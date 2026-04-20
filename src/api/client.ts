export interface SendResult {
  ok: boolean;
  status: number;
  statusText: string;
  body: string;
}

export async function sendPayload(url: string, payload: unknown, source?: string): Promise<SendResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(source ? { 'X-Simulator-Source': source } : {}),
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
  };
}
