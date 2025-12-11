'use server';

import { NextRequest, NextResponse } from 'next/server';

type SlackPayload = {
  status: 'success' | 'error';
  message: string;
  contentType?: string;
  meta?: Record<string, any>;
};

export async function POST(req: NextRequest) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return NextResponse.json({ error: 'SLACK_WEBHOOK_URL ontbreekt' }, { status: 500 });
  }

  let body: SlackPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status, message, contentType, meta } = body;
  if (!status || !message) {
    return NextResponse.json({ error: 'status en message zijn verplicht' }, { status: 400 });
  }

  const metaLines = [];
  if (contentType) metaLines.push(`• Type: ${contentType}`);
  if (meta?.productName) metaLines.push(`• Product: ${meta.productName}`);
  if (meta?.topic) metaLines.push(`• Onderwerp: ${meta.topic}`);
  if (meta?.subject) metaLines.push(`• Titel: ${meta.subject}`);

  const text = [
    status === 'success' ? ':white_check_mark: Nieuwe content' : ':x: Fout bij genereren',
    message,
    metaLines.length ? metaLines.join('\n') : null,
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      cache: 'no-store',
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Slack webhook error', errText);
      return NextResponse.json({ error: 'Slack webhook failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Slack webhook error', error);
    return NextResponse.json({ error: 'Slack webhook exception' }, { status: 500 });
  }
}

