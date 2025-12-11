'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const wpBase = process.env.WP_BASE_URL;
  const wpUser = process.env.WP_USERNAME;
  const wpPass = process.env.WP_APP_PASSWORD;

  if (!wpBase || !wpUser || !wpPass) {
    return NextResponse.json({ error: 'WP_BASE_URL, WP_USERNAME, WP_APP_PASSWORD ontbreken' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { title, data } = body || {};
    if (!title || !data) {
      return NextResponse.json({ error: 'title en data zijn verplicht' }, { status: 400 });
    }

    const content = data?.content?.full || data?.body || JSON.stringify(data);
    const slug = data?.seo?.urlSlug || data?.urlSlug || undefined;

    const res = await fetch(`${wpBase}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`${wpUser}:${wpPass}`).toString('base64')}`,
      },
      body: JSON.stringify({
        title,
        content,
        status: 'draft',
        slug,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'WordPress export mislukt', details: text.substring(0, 500) }, { status: 500 });
    }

    const result = await res.json();
    return NextResponse.json({ ok: true, id: result.id, link: result.link });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Export fout' }, { status: 500 });
  }
}

