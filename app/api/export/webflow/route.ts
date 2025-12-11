'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const token = process.env.WEBFLOW_API_TOKEN;
  const siteId = process.env.WEBFLOW_SITE_ID;
  const collectionId = process.env.WEBFLOW_COLLECTION_ID;

  if (!token || !siteId || !collectionId) {
    return NextResponse.json(
      { error: 'WEBFLOW_API_TOKEN, WEBFLOW_SITE_ID, WEBFLOW_COLLECTION_ID ontbreken' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { title, data } = body || {};
    if (!title || !data) {
      return NextResponse.json({ error: 'title en data zijn verplicht' }, { status: 400 });
    }

    const content = data?.content?.full || data?.body || JSON.stringify(data);
    const slug = data?.seo?.urlSlug || data?.urlSlug || undefined;

    const res = await fetch(`https://api.webflow.com/v2/sites/${siteId}/collections/${collectionId}/items/draft`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept-Version': '2.0.0',
      },
      body: JSON.stringify({
        fields: {
          name: title,
          slug: slug || undefined,
          _archived: false,
          _draft: true,
          // Map content field; users moeten de juiste field key instellen
          // Bijvoorbeeld "body": content, afhankelijk van de Webflow collection
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'Webflow export mislukt', details: text.substring(0, 500) }, { status: 500 });
    }

    const result = await res.json();
    return NextResponse.json({ ok: true, id: result?.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Export fout' }, { status: 500 });
  }
}

