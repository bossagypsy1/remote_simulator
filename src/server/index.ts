/**
 * Cron trigger server
 * -------------------
 * Listens for GET /simulate from cron-job.org.
 * On each call it generates one round of payloads for every device
 * and POSTs them to the configured SEND_TO_URL.
 *
 * Deploy anywhere that runs a persistent Node process (Railway, Render, Fly.io…).
 * Set env vars:  SEND_TO_URL, PORT (optional, default 3001), CRON_SECRET (optional).
 */

import 'dotenv/config';
import * as http from 'http';
import { devices } from '../devices/registry';
import { phone } from '../devices/phone';
import { generateEnvironmentalPayload } from '../payloads/environmental';
import { generatePhonePayload } from '../payloads/mobile_phone';
import { sendPayload } from '../api/client';

const PORT        = parseInt(process.env.PORT ?? '3001', 10);
const BASE_URL    = (process.env.SEND_TO_URL ?? '').replace(/\/$/, '').replace(/\/environmental$/, '').replace(/\/mobile_phone$/, '');
const SEND_TO_URL  = `${BASE_URL}/environmental`;
const MOBILE_URL  = `${BASE_URL}/mobile_phone`;
const CRON_SECRET = process.env.CRON_SECRET ?? '';

const SESSION_ID  = `cron-${phone.deviceId}-${Date.now()}`;

// Per-process message counters
const messageIds: Record<string, number> = {};
function nextId(id: string) { return (messageIds[id] = (messageIds[id] ?? 0) + 1); }

function ts() { return new Date().toLocaleTimeString('en-GB', { hour12: false }); }

function isAuthorised(req: http.IncomingMessage): boolean {
  if (!CRON_SECRET) return true;
  const auth = req.headers['authorization'] ?? '';
  const url  = new URL(req.url ?? '/', `http://localhost`);
  return auth === `Bearer ${CRON_SECRET}` || url.searchParams.get('secret') === CRON_SECRET;
}

async function simulate(): Promise<{ device: string; ok: boolean; status: number }[]> {
  const results: { device: string; ok: boolean; status: number }[] = [];

  for (const device of devices) {
    const payload = generateEnvironmentalPayload(device, nextId(device.deviceId));
    const result  = await sendPayload(SEND_TO_URL, payload);
    console.log(`[${ts()}] ${device.deviceId} -> ${result.status} ${result.statusText}`);
    results.push({ device: device.deviceId, ok: result.ok, status: result.status });
  }

  const phonePayload = generatePhonePayload(phone, nextId(phone.deviceId), SESSION_ID);
  const phoneResult  = await sendPayload(MOBILE_URL, phonePayload);
  console.log(`[${ts()}] ${phone.deviceId} -> ${phoneResult.status} ${phoneResult.statusText}`);
  results.push({ device: phone.deviceId, ok: phoneResult.ok, status: phoneResult.status });

  return results;
}

const server = http.createServer(async (req, res) => {
  const url    = new URL(req.url ?? '/', `http://localhost`);
  const method = req.method ?? 'GET';

  // Health check
  if (url.pathname === '/health' && method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, target: BASE_URL }));
    return;
  }

  // Trigger endpoint
  if (url.pathname === '/simulate' && method === 'GET') {
    if (!isAuthorised(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorised' }));
      return;
    }

    console.log(`[${ts()}] /simulate triggered`);
    try {
      const results = await simulate();
      const ok      = results.filter(r => r.ok).length;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, sent: results.length, succeeded: ok, results }));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${ts()}] simulate error:`, message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: message }));
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Cron trigger server listening on port ${PORT}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Endpoints: GET /simulate  GET /health`);
  if (CRON_SECRET) console.log(`Auth: Bearer token required`);
  else             console.log(`Auth: none (set CRON_SECRET to enable)`);
});
