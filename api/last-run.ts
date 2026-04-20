import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const sendTo = (process.env.SEND_TO_URL ?? '').replace(/\/$/, '');
  if (!sendTo) return res.status(500).json({ error: 'SEND_TO_URL not set' });

  // Derive dashboard base from the ingest URL
  // e.g. https://remote-sensor-phone.vercel.app/api/ingest/environmental
  //   →  https://remote-sensor-phone.vercel.app
  const base = sendTo.replace(/\/api\/ingest.*$/, '');

  try {
    const r = await fetch(`${base}/api/feed`);
    if (!r.ok) return res.status(502).json({ error: `Feed returned ${r.status}` });

    const feed: {
      id: string;
      received_at: string;
      source_device_id: string | null;
      processing_status: string;
      simulator_source: string | null;
    }[] = await r.json();

    // Only care about simulator-sent rows (vercel-cron or local-cli)
    const simRows = feed.filter(
      (row) => row.simulator_source === 'vercel-cron' || row.simulator_source === 'local-cli',
    );

    // Latest row per device
    const byDevice: Record<string, typeof simRows[0]> = {};
    for (const row of simRows) {
      const dev = row.source_device_id ?? 'unknown';
      if (!byDevice[dev]) byDevice[dev] = row; // feed is newest-first
    }

    // Latest cron-only run time
    const cronRows = feed.filter((r) => r.simulator_source === 'vercel-cron');
    const lastCron = cronRows.length > 0 ? cronRows[0].received_at : null;

    return res.status(200).json({ byDevice, lastCron, totalSim: simRows.length });
  } catch (e: unknown) {
    return res.status(502).json({ error: String(e) });
  }
}
