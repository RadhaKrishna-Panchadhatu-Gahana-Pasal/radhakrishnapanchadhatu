import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/store/auth';
import {
  MAX_UPLOAD_BYTES,
  UPLOAD_MIME_EXTENSIONS,
  getUploadsDirectory,
} from '@/lib/store/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image file to upload.' }, { status: 400 });
    }

    const extension = UPLOAD_MIME_EXTENSIONS[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WebP, GIF or AVIF images can be uploaded.' },
        { status: 415 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Images must be 5 MB or smaller.' },
        { status: 413 }
      );
    }

    const directory = getUploadsDirectory();
    await fs.mkdir(directory, { recursive: true });

    const safeBase = path
      .parse(file.name || 'image')
      .name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40);
    const storedName = `${safeBase || 'image'}-${Date.now().toString(36)}-${crypto
      .randomBytes(4)
      .toString('hex')}${extension}`;

    await fs.writeFile(path.join(directory, storedName), Buffer.from(await file.arrayBuffer()));

    return NextResponse.json(
      {
        url: `/api/media/${storedName}`,
        fileName: file.name,
        title: path.parse(file.name || 'Image').name.replace(/[-_]+/g, ' ').trim(),
        sizeBytes: file.size,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          'Upload failed. The storage directory is not writable on this host — use an image URL, or run on a server with a persistent disk.',
      },
      { status: 500 }
    );
  }
}
