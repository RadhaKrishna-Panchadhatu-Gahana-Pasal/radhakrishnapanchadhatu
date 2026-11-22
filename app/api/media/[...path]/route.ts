import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';
import { CONTENT_TYPE_BY_EXTENSION, getUploadsDirectory } from '@/lib/store/uploads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Serves images uploaded from the admin media library. */
export async function GET(
  _req: Request,
  { params }: { params: { path: string[] } }
) {
  const segments = params.path ?? [];
  if (segments.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  // Flatten any traversal attempt down to a single file name.
  const fileName = path.basename(segments.join('/'));
  if (!fileName || fileName.startsWith('.')) {
    return new NextResponse('Not found', { status: 404 });
  }

  const contentType = CONTENT_TYPE_BY_EXTENSION[path.extname(fileName).toLowerCase()];
  if (!contentType) {
    return new NextResponse('Not found', { status: 404 });
  }

  try {
    const filePath = path.join(getUploadsDirectory(), fileName);
    const file = await fs.readFile(filePath);

    return new NextResponse(new Uint8Array(file), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
