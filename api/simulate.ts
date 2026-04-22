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

  const results = await Promise.allSettled([
    ...devices.map(async (device) => {
      const payload = generateEnvironmentalPayload(device, nextId(device.deviceId));
      const result  = await sendPayload(ingestUrl, payload, 'vercel-cron');
      return { device: device.deviceId, ok: result.ok, status: result.status };
    }),
    ...fuelDevices.map(async (device) => {
      const payload = generateFuelPayload(device, nextId(device.deviceId));
      const result  = await sendPayload(ingestUrl, payload, 'vercel-cron');
      return { device: device.deviceId, ok: result.ok, status: result.status };
    }),
    (async () => {
      const payload = generatePhonePayload(phone, nextId(phone.deviceId), SESSION_ID);
      const result  = await sendPayload(mobileUrl, payload, 'vercel-cron');
      return { device: phone.deviceId, ok: result.ok, status: result.status };
    })(),
  ]);

  const settled = results.map(r => r.status === 'fulfilled' ? r.value : { device: 'unknown', ok: false, status: 0 });
  const succeeded = settled.filter(r => r.ok).length;
  return res.status(200).json({ ok: true, sent: settled.length, succeeded, results: settled });
}
