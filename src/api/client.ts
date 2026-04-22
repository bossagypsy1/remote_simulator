export interface SendResult {
  ok: boolean;
  status: number;
  statusText: string;
  body: string;
}

export async function sendPayload(url: string, payload: unknown, source?: string, timeoutMs = 20_000): Promise<SendResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(source ? { 'X-Simulator-Source': source } : {}),
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });

    const body = await response.text();
    return { ok: response.ok, status: response.status, statusText: response.statusText, body };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, status: 0, statusText: 'timeout', body: msg };
  } finally {
    clearTimeout(timer);
  }
}
