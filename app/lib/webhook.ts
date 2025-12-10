import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || '';

export function signPayload(payload: any) {
  const body = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
  return { body, signature };
}

export async function sendWebhook(urls: string[], event: string, data: any) {
  if (!WEBHOOK_SECRET || !urls || urls.length === 0) return;
  const { body, signature } = signPayload({ event, data, ts: Date.now() });

  await Promise.all(
    urls.map(async (url) => {
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-RF-Event': event,
            'X-RF-Signature': signature,
          },
          body,
        });
      } catch (err) {
        console.error('Webhook failed for', url, err);
      }
    })
  );
}

