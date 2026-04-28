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

const DEFAULT_TARGET = process.env.SEND_TO_URL ?? 'https://remote-sensor-phone.vercel.app/api/ingest';
const TARGETS: Record<string, string> = {
  current: DEFAULT_TARGET,
  smartranger: 'https://smartranger.com/api/ingest',
};

function resolveBaseUrl(req: VercelRequest) {
  const rawTarget = Array.isArray(req.query.target) ? req.query.target[0] : req.query.target;
  const selected = rawTarget?.trim() || 'current';
  const base = TARGETS[selected] ?? selected;
  const withProtocol = /^https?:\/\//i.test(base) ? base : `https://${base}`;
  const appBase = withProtocol
    .replace(/\/$/, '')
    .replace(/\/(miketron-device|mobile_phone)$/, '')
    .replace(/\/api\/ingest$/, '');
  return `${appBase}/api/ingest`;
}

export interface DeviceResult {
  device: string;
  ok: boolean;
  status: number;
  readings: { name: string; value: number }[];
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const baseUrl   = resolveBaseUrl(req);
  const ingestUrl = `${baseUrl}/miketron-device`;
  const mobileUrl = `${baseUrl}/mobile_phone`;

  const results = await Promise.allSettled<DeviceResult>([
    ...devices.map(async (device) => {
      const payload = generateEnvironmentalPayload(device, nextId(device.deviceId));
      const result  = await sendPayload(ingestUrl, payload, 'vercel-cron');
      return {
        device: device.deviceId,
        ok: result.ok,
        status: result.status,
        readings: payload.payload.map(r => ({ name: r.name, value: r.value })),
      };
    }),
    ...fuelDevices.map(async (device) => {
      const payload = generateFuelPayload(device, nextId(device.deviceId));
      const result  = await sendPayload(ingestUrl, payload, 'vercel-cron');
      return {
        device: device.deviceId,
        ok: result.ok,
        status: result.status,
        readings: payload.payload.map(r => ({ name: r.name, value: r.value })),
      };
    }),
    (async () => {
      const payload = generatePhonePayload(phone, nextId(phone.deviceId), SESSION_ID);
      const result  = await sendPayload(mobileUrl, payload, 'vercel-cron');
      // Flatten phone sensor groups into name/value pairs
      const readings = payload.payload.flatMap(group =>
        Object.entries(group.values).map(([k, v]) => ({ name: `${group.name}.${k}`, value: v }))
      );
      return { device: phone.deviceId, ok: result.ok, status: result.status, readings };
    })(),
  ]);

  const settled: DeviceResult[] = results.map(r =>
    r.status === 'fulfilled' ? r.value : { device: 'unknown', ok: false, status: 0, readings: [] }
  );
  const succeeded = settled.filter(r => r.ok).length;
  return res.status(200).json({ ok: true, target: baseUrl, sent: settled.length, succeeded, timestamp: new Date().toISOString(), results: settled });
}
