import 'dotenv/config';
import { devices, getDevice } from '../devices/registry';
import { phone } from '../devices/phone';
import { generateEnvironmentalPayload } from '../payloads/environmental';
import { generatePhonePayload } from '../payloads/mobile_phone';
import { sendPayload } from '../api/client';

// Fixed for the lifetime of this process run
const SESSION_ID = `session-${phone.deviceId}-${Date.now()}`;

// ── CLI argument parsing ─────────────────────────────────────────────────────

interface CliOptions {
  device: string | null;
  all: boolean;
  count: number;       // 0 = continuous
  interval: number;    // ms
  dryRun: boolean;
  verbose: boolean;
}

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const opts: CliOptions = {
    device: null,
    all: false,
    count: 0,
    interval: 10_000,
    dryRun: false,
    verbose: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--device':   opts.device   = args[++i]; break;
      case '--all':      opts.all      = true;       break;
      case '--count':    opts.count    = parseInt(args[++i], 10); break;
      case '--interval': opts.interval = parseInt(args[++i], 10); break;
      case '--dry-run':  opts.dryRun   = true;       break;
      case '--verbose':  opts.verbose  = true;       break;
      default:
        console.warn(`Unknown flag: ${args[i]}`);
    }
  }

  return opts;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function localTimestamp(): string {
  return new Date().toLocaleTimeString('en-GB', { hour12: false });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitteredDelay(base: number): number {
  return base + Math.floor(Math.random() * 3_000);
}

// ── Per-device message ID counter ────────────────────────────────────────────

const messageIds: Record<string, number> = {};

function nextMessageId(deviceId: string): number {
  messageIds[deviceId] = (messageIds[deviceId] ?? 0) + 1;
  return messageIds[deviceId];
}

// ── Error formatting ─────────────────────────────────────────────────────────

function formatError(err: unknown): string {
  const top   = err instanceof Error ? err.message : String(err);
  const cause = err instanceof Error && err.cause instanceof Error ? ` (${err.cause.message})` : '';
  return `${top}${cause}`;
}

// ── Push: environmental device ───────────────────────────────────────────────

async function pushEnvironmental(
  deviceId: string,
  opts: CliOptions,
  ingestUrl: string,
  baseUrl: string,
): Promise<void> {
  const device = getDevice(deviceId);
  if (!device) {
    console.error(`Unknown environmental device: ${deviceId}`);
    return;
  }

  const msgId   = nextMessageId(deviceId);
  const payload = generateEnvironmentalPayload(device, msgId);
  const ts      = localTimestamp();

  if (opts.dryRun) {
    console.log(`[${ts}] ${deviceId} messageId=${msgId} DRY RUN — payload:`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`[${ts}] [${baseUrl}] ${deviceId} messageId=${msgId} sending...`);
  if (opts.verbose) console.log(JSON.stringify(payload, null, 2));

  try {
    const result    = await sendPayload(ingestUrl, payload);
    const statusStr = `${result.status} ${result.statusText}`;

    if (result.ok) {
      console.log(`[${localTimestamp()}] [${baseUrl}] ${deviceId} messageId=${msgId} sent ${payload.payload.length} readings -> ${statusStr}`);
      if (opts.verbose) console.log(`       Response: ${result.body}`);
    } else {
      const bodyPreview = result.body.trimStart().startsWith('<')
        ? '(HTML response — likely auth/proxy page)'
        : result.body.slice(0, 120);
      console.error(`[${localTimestamp()}] [${baseUrl}] ${deviceId} messageId=${msgId} -> ERROR ${statusStr}: ${bodyPreview}`);
    }
  } catch (err) {
    console.error(`[${localTimestamp()}] [${baseUrl}] ${deviceId} messageId=${msgId} -> ERROR ${formatError(err)}`);
  }
}

// ── Push: phone device ───────────────────────────────────────────────────────

async function pushPhone(opts: CliOptions, mobileUrl: string, baseUrl: string): Promise<void> {
  const msgId   = nextMessageId(phone.deviceId);
  const payload = generatePhonePayload(phone, msgId, SESSION_ID);
  const ts      = localTimestamp();

  if (opts.dryRun) {
    console.log(`[${ts}] ${phone.deviceId} messageId=${msgId} DRY RUN — payload:`);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`[${ts}] [${baseUrl}] ${phone.deviceId} messageId=${msgId} sending...`);
  if (opts.verbose) console.log(JSON.stringify(payload, null, 2));

  try {
    const result    = await sendPayload(mobileUrl, payload);
    const statusStr = `${result.status} ${result.statusText}`;

    if (result.ok) {
      console.log(`[${localTimestamp()}] [${baseUrl}] ${phone.deviceId} messageId=${msgId} sent ${payload.payload.length} sensor groups -> ${statusStr}`);
      if (opts.verbose) console.log(`       Response: ${result.body}`);
    } else {
      const bodyPreview = result.body.trimStart().startsWith('<')
        ? '(HTML response — likely auth/proxy page)'
        : result.body.slice(0, 120);
      console.error(`[${localTimestamp()}] [${baseUrl}] ${phone.deviceId} messageId=${msgId} -> ERROR ${statusStr}: ${bodyPreview}`);
    }
  } catch (err) {
    console.error(`[${localTimestamp()}] [${baseUrl}] ${phone.deviceId} messageId=${msgId} -> ERROR ${formatError(err)}`);
  }
}

// ── Main entry point ─────────────────────────────────────────────────────────

type DeviceEntry = { id: string; type: 'environmental' | 'phone' };

const allEnvDevices: DeviceEntry[] = devices.map((d) => ({ id: d.deviceId, type: 'environmental' }));
const phoneEntry: DeviceEntry      = { id: phone.deviceId, type: 'phone' };
const allDeviceIds                 = [...devices.map((d) => d.deviceId), phone.deviceId];

export async function run(): Promise<void> {
  const opts      = parseArgs();
  const baseUrl   = (process.env.INGEST_URL ?? '').replace(/\/$/, '');
  const ingestUrl = `${baseUrl}/environmental`;
  const mobileUrl = `${baseUrl}/mobile_phone`;

  // Resolve target device list
  let targetDevices: DeviceEntry[];

  if (opts.all) {
    targetDevices = [...allEnvDevices, phoneEntry];
  } else if (opts.device === phone.deviceId) {
    targetDevices = [phoneEntry];
  } else if (opts.device) {
    if (!getDevice(opts.device)) {
      console.error(`Error: unknown device "${opts.device}". Valid IDs: ${allDeviceIds.join(', ')}`);
      process.exit(1);
    }
    targetDevices = [{ id: opts.device, type: 'environmental' }];
  } else {
    console.error(`Error: specify --device <id> or --all. Valid IDs: ${allDeviceIds.join(', ')}`);
    process.exit(1);
  }

  // Validate required env vars (skipped in dry-run)
  if (!opts.dryRun && !baseUrl) {
    console.error('Error: INGEST_URL is not set. Copy .env.example to .env and set the value.');
    process.exit(1);
  }

  const continuous = opts.count === 0;
  const rounds     = continuous ? Infinity : opts.count;

  console.log(`Target: ${baseUrl}`);
  console.log(`Simulating: ${targetDevices.map((d) => d.id).join(', ')}`);
  if (continuous) {
    console.log(`Mode: continuous | Interval: ${opts.interval}ms ± up to 3s jitter`);
    console.log(`Press Ctrl+C to stop.\n`);
  } else {
    console.log(`Mode: ${rounds} round(s) | Interval: ${opts.interval}ms ± up to 3s jitter\n`);
  }

  process.on('SIGINT', () => {
    console.log('\nStopped.');
    process.exit(0);
  });

  for (let i = 0; i < rounds; i++) {
    for (const dev of targetDevices) {
      if (dev.type === 'phone') {
        await pushPhone(opts, mobileUrl, baseUrl);
      } else {
        await pushEnvironmental(dev.id, opts, ingestUrl, baseUrl);
      }
    }

    if (continuous || i < rounds - 1) {
      const delay = jitteredDelay(opts.interval);
      if (opts.verbose) console.log(`  Next round in ${delay}ms…\n`);
      await sleep(delay);
    }
  }
}
