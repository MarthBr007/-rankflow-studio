import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const LIBRARY_FILE = join(process.cwd(), 'content-library.json');

interface ContentItem {
  id: string;
  type: string;
  title: string;
  createdAt: string;
  data: any;
  preview?: string;
}

// GET: Haal alle opgeslagen content op
export async function GET() {
  try {
    const data = await readFile(LIBRARY_FILE, 'utf-8');
    const library = JSON.parse(data);
    return NextResponse.json(library);
  } catch (error) {
    // Als bestand niet bestaat, return lege array
    return NextResponse.json([]);
  }
}

// POST: Sla nieuwe content op
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, data } = body;

    if (!type || !title || !data) {
      return NextResponse.json(
        { error: 'type, title en data zijn verplicht' },
        { status: 400 }
      );
    }

    // Laad bestaande library
    let library: ContentItem[] = [];
    try {
      const fileData = await readFile(LIBRARY_FILE, 'utf-8');
      library = JSON.parse(fileData);
    } catch (error) {
      // Bestand bestaat niet, start met lege array
    }

    // Maak nieuwe content item
    const newItem: ContentItem = {
      id: `content-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      createdAt: new Date().toISOString(),
      data,
      preview: generatePreview(data, type),
    };

    // Voeg toe aan library
    library.unshift(newItem); // Nieuwe items eerst

    // Sla op
    await writeFile(LIBRARY_FILE, JSON.stringify(library, null, 2), 'utf-8');

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Fout bij het opslaan van content' },
      { status: 500 }
    );
  }
}

// DELETE: Verwijder content item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'id is verplicht' },
        { status: 400 }
      );
    }

    // Laad bestaande library
    const fileData = await readFile(LIBRARY_FILE, 'utf-8');
    let library: ContentItem[] = JSON.parse(fileData);

    // Verwijder item
    library = library.filter(item => item.id !== id);

    // Sla op
    await writeFile(LIBRARY_FILE, JSON.stringify(library, null, 2), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Fout bij het verwijderen van content' },
      { status: 500 }
    );
  }
}

// Genereer preview tekst
function generatePreview(data: any, type: string): string {
  if (type === 'landing') {
    return data.h1 || data.seoTitle || 'Landingspagina';
  } else if (type === 'product') {
    return data.title || data.seoTitle || 'Productpagina';
  } else if (type === 'categorie') {
    return data.h1 || data.seoTitle || 'Categoriepagina';
  } else if (type === 'blog') {
    return data.h1 || data.title || 'Blog artikel';
  } else if (type === 'social') {
    return data.topic || 'Social Media Post';
  }
  return 'Content';
}

