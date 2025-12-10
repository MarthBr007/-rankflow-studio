import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET /api/logs?organizationId=&type=&from=&to=&limit=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || undefined;
    const contentType = searchParams.get('type') || undefined;
    const from = searchParams.get('from') ? new Date(searchParams.get('from') as string) : undefined;
    const to = searchParams.get('to') ? new Date(searchParams.get('to') as string) : undefined;
    const limit = searchParams.get('limit') ? Math.min(parseInt(searchParams.get('limit') as string, 10), 500) : 200;

    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    if (contentType) where.contentType = contentType;
    if (from || to) where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;

    const logs = await prisma.generateLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Aggregates
    const total = logs.length;
    const successCount = logs.filter(l => l.success).length;
    const errorCount = total - successCount;
    const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
    const avgDuration = total > 0 ? Math.round(logs.reduce((s, l) => s + (l.duration || 0), 0) / total) : 0;
    const totalTokens = logs.reduce((s, l) => s + (l.tokensUsed || 0), 0);

    return NextResponse.json({
      total,
      successCount,
      errorCount,
      successRate,
      avgDuration,
      totalTokens,
      items: logs,
    });
  } catch (error: any) {
    console.error('Error loading logs:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het laden van logs' },
      { status: 500 }
    );
  }
}

