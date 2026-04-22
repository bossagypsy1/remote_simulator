import type { VercelRequest, VercelResponse } from '@vercel/node';
import { devices } from '../src/devices/registry';
import { phone } from '../src/devices/phone';
import { fuelDevices } from '../src/devices/fuel_registry';
import { generateEnvironmentalPayload } from '../src/payloads/environmental';
import { generatePhonePayload } from '../src/payloads/mobile_phone';
import { generateFuelPayload } from '../src/payloads/fuel_monitor';
import { sendPayload } from '../src/api/client';

const SESSION_ID = `cron-${phone.deviceId}`;
const messageIds: Record<string, number> = {};
function nextId(id: string) { return (messageIds[id] = (messageIds[id] ?? 0) + 1); }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl   = (process.env.SEND_TO_URL ?? '').replace(/\/$/, '').replace(/\/(miketron-device|mobile_phone)$/, '');
  const ingestUrl = `${baseUrl}/miketron-device`;
  const mobileUrl = `${baseUrl}/mobile_phone`;

  if (!baseUrl) return res.status(500).json({ error: 'SEND_TO_URL not set' });

  // Respond immediately so cron-job.org gets 200 — sends run in background
  const total = devices.length + fuelDevices.length + 1;
  res.status(200).json({ ok: true, sent: total, note: 'firing in background' });

  await Promise.allSettled([
    ...devices.map(async (device) => {
      const payload = generateEnvironmentalPayload(device, nextId(device.deviceId));
      await sendPayload(ingestUrl, payload, 'vercel-cron');
    }),
    ...fuelDevices.map(async (device) => {
      const payload = generateFuelPayload(device, nextId(device.deviceId));
      await sendPayload(ingestUrl, payload, 'vercel-cron');
    }),
    (async () => {
      const payload = generatePhonePayload(phone, nextId(phone.deviceId), SESSION_ID);
      await sendPayload(mobileUrl, payload, 'vercel-cron');
    })(),
  ]);
}
