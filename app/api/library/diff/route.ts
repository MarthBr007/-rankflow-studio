export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

// GET: Genereer diff tussen twee versies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const version1 = searchParams.get('v1');
    const version2 = searchParams.get('v2');

    if (!contentId || !version1 || !version2) {
      return NextResponse.json(
        { error: 'id, v1 en v2 zijn verplicht' },
        { status: 400 }
      );
    }

    const v1Num = parseInt(version1, 10);
    const v2Num = parseInt(version2, 10);

    const [version1Data, version2Data] = await Promise.all([
      prisma.libraryVersion.findUnique({
        where: {
          libraryContentId_version: {
            libraryContentId: contentId,
            version: v1Num,
          },
        },
      }),
      prisma.libraryVersion.findUnique({
        where: {
          libraryContentId_version: {
            libraryContentId: contentId,
            version: v2Num,
          },
        },
      }),
    ]);

    if (!version1Data || !version2Data) {
      return NextResponse.json(
        { error: 'Een of beide versies niet gevonden' },
        { status: 404 }
      );
    }

    // Simpele JSON diff (deep comparison)
    const diff = generateDiff(version1Data.data, version2Data.data);

    return NextResponse.json({
      version1: {
        version: v1Num,
        createdAt: version1Data.createdAt.toISOString(),
        metadata: version1Data.metadata,
      },
      version2: {
        version: v2Num,
        createdAt: version2Data.createdAt.toISOString(),
        metadata: version2Data.metadata,
      },
      diff,
    });
  } catch (error: any) {
    console.error('Error generating diff:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij het genereren van diff' },
      { status: 500 }
    );
  }
}

// Simpele diff functie voor JSON objecten
function generateDiff(obj1: any, obj2: any, path = ''): any {
  const diff: any = {
    added: {},
    removed: {},
    changed: {},
  };

  // Check voor toegevoegde/gewijzigde velden
  for (const key in obj2) {
    const currentPath = path ? `${path}.${key}` : key;
    
    if (!(key in obj1)) {
      diff.added[currentPath] = obj2[key];
    } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
      if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
        const nestedDiff = generateDiff(obj1[key], obj2[key], currentPath);
        Object.assign(diff.added, nestedDiff.added);
        Object.assign(diff.removed, nestedDiff.removed);
        Object.assign(diff.changed, nestedDiff.changed);
      } else {
        diff.changed[currentPath] = {
          old: obj1[key],
          new: obj2[key],
        };
      }
    }
  }

  // Check voor verwijderde velden
  for (const key in obj1) {
    if (!(key in obj2)) {
      const currentPath = path ? `${path}.${key}` : key;
      diff.removed[currentPath] = obj1[key];
    }
  }

  return diff;
}

