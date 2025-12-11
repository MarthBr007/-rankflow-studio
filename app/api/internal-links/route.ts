'use server';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

type LinkSuggestion = {
  title: string;
  url: string;
  source: 'library' | 'sitemap';
};

function parseSitemap(xml: string, limit = 30): LinkSuggestion[] {
  const urls: LinkSuggestion[] = [];
  const locRegex = /<loc>(.*?)<\/loc>/gi;
  let match;
  while ((match = locRegex.exec(xml)) !== null && urls.length < limit) {
    const loc = match[1].trim();
    urls.push({ title: loc, url: loc, source: 'sitemap' });
  }
  return urls;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sitemapUrl = searchParams.get('sitemapUrl');

  try {
    const suggestions: LinkSuggestion[] = [];

    // Library-based suggestions
    const items = await prisma.libraryContent.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 25,
      include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
    });

    for (const item of items) {
      const slug = item.versions[0]?.metadata?.slug || item.versions[0]?.metadata?.urlSlug;
      const title = item.title || slug || item.id;
      const url = slug
        ? `/${slug}`
        : item.versions[0]?.metadata?.url || item.versions[0]?.metadata?.link || '#';
      suggestions.push({
        title,
        url,
        source: 'library',
      });
    }

    // Optional sitemap fetch
    if (sitemapUrl) {
      try {
        const res = await fetch(sitemapUrl, { cache: 'no-store' });
        if (res.ok) {
          const xml = await res.text();
          const parsed = parseSitemap(xml);
          suggestions.push(...parsed);
        }
      } catch (e) {
        // ignore sitemap errors; return library suggestions
      }
    }

    return NextResponse.json(suggestions);
  } catch (error: any) {
    console.error('Internal links error:', error);
    return NextResponse.json({ error: error.message || 'Fout bij interne links' }, { status: 500 });
  }
}

