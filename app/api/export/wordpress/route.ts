'use server';

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Hier zou je WordPress REST integratie doen. Voor nu een stub.
    return NextResponse.json({ ok: true, received: true, title: body?.title || null });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Export fout' }, { status: 500 });
  }
}

