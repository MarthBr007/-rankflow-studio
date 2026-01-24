import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { prisma } from '@/app/lib/prisma';
import { getCurrentUser } from '@/app/lib/auth';
import sharp from 'sharp';
import { rateLimiters } from '@/app/lib/rate-limit';

export const dynamic = 'force-dynamic';

// POST: Upload image
export async function POST(request: NextRequest) {
  try {
    // Rate limiting voor uploads
    const rateLimitResponse = await rateLimiters.upload(request);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const organizationId = formData.get('organizationId') as string | null;
    const alt = formData.get('alt') as string | null;
    const tags = formData.get('tags') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Geen bestand geüpload' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Alleen afbeeldingen zijn toegestaan (JPEG, PNG, WebP, GIF)' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Bestand is te groot (max 10MB)' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop() || 'jpg';
    const filename = `${timestamp}-${randomString}.${extension}`;
    const filepath = join(uploadsDir, filename);

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp (resize if needed, optimize)
    let processedBuffer: Buffer = buffer;
    let width: number | undefined;
    let height: number | undefined;

    try {
      const image = sharp(buffer);
      const metadata = await image.metadata();
      width = metadata.width;
      height = metadata.height;

      // Resize if too large (max 2000px on longest side)
      if (width && height && (width > 2000 || height > 2000)) {
        processedBuffer = Buffer.from(await image
          .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toBuffer());
        
        // Update dimensions after resize
        const resizedMetadata = await sharp(processedBuffer).metadata();
        width = resizedMetadata.width;
        height = resizedMetadata.height;
      } else {
        // Optimize without resizing
        processedBuffer = Buffer.from(await image
          .jpeg({ quality: 85 })
          .toBuffer());
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // If sharp fails, use original buffer
      processedBuffer = buffer;
    }

    // Save file
    await writeFile(filepath, processedBuffer);

    // Create database record
    const imageUrl = `/uploads/${filename}`;
    const image = await prisma.uploadedImage.create({
      data: {
        organizationId: organizationId || null,
        filename,
        originalName: file.name,
        url: imageUrl,
        mimeType: file.type,
        size: processedBuffer.length,
        width: width || null,
        height: height || null,
        alt: alt || null,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        createdBy: user.email,
      },
    });

    return NextResponse.json({
      image: {
        id: image.id,
        url: image.url,
        originalName: image.originalName,
        width: image.width,
        height: image.height,
        size: image.size,
      },
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: error.message || 'Fout bij uploaden afbeelding' },
      { status: 500 }
    );
  }
}

