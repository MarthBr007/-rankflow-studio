import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || 'global';
    const versionParam = searchParams.get('version');

    if (versionParam) {
      const version = parseInt(versionParam, 10);
      const record = await prisma.promptVersion.findUnique({
        where: { tenantId_version: { tenantId, version } },
      });
      if (!record) {
        return NextResponse.json({ error: 'Versie niet gevonden' }, { status: 404 });
      }
      return NextResponse.json({
        version: record.version,
        createdAt: record.createdAt,
        prompts: record.data,
      });
    }

    const versions = await prisma.promptVersion.findMany({
      where: { tenantId },
      orderBy: { version: 'desc' },
      select: { version: true, createdAt: true },
    });

    return NextResponse.json(versions);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Fout bij het ophalen van versies' },
      { status: 500 }
    );
  }
}

