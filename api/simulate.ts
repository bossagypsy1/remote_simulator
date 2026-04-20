import type { VercelRequest, VercelResponse } from '@vercel/node';
import { devices } from '../src/devices/registry';
import { phone } from '../src/devices/phone';
import { generateEnvironmentalPayload } from '../src/payloads/environmental';
import { generatePhonePayload } from '../src/payloads/mobile_phone';
import { sendPayload } from '../src/api/client';

const SESSION_ID  = `cron-${phone.deviceId}`;
const messageIds: Record<string, number> = {};
function nextId(id: string) { return (messageIds[id] = (messageIds[id] ?? 0) + 1); }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Optional secret check
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = (req.headers['authorization'] as string) ?? '';
    const qs   = (req.query['secret'] as string) ?? '';
    if (auth !== `Bearer ${secret}` && qs !== secret) {
      return res.status(401).json({ error: 'Unauthorised' });
    }
  }

  const baseUrl   = (process.env.INGEST_URL ?? '').replace(/\/$/, '').replace(/\/(environmental|mobile_phone)$/, '');
  const ingestUrl = `${baseUrl}/environmental`;
  const mobileUrl = `${baseUrl}/mobile_phone`;

  if (!baseUrl) return res.status(500).json({ error: 'INGEST_URL not set' });

  const results: { device: string; ok: boolean; status: number }[] = [];

  for (const device of devices) {
    const payload = generateEnvironmentalPayload(device, nextId(device.deviceId));
    const result  = await sendPayload(ingestUrl, payload);
    results.push({ device: device.deviceId, ok: result.ok, status: result.status });
  }

  const phonePayload = generatePhonePayload(phone, nextId(phone.deviceId), SESSION_ID);
  const phoneResult  = await sendPayload(mobileUrl, phonePayload);
  results.push({ device: phone.deviceId, ok: phoneResult.ok, status: phoneResult.status });

  const succeeded = results.filter(r => r.ok).length;
  return res.status(200).json({ ok: true, sent: results.length, succeeded, results });
}
