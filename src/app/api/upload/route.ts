
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  // Sanitize the filename to prevent directory traversal attacks
  const filename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // The path will be public/images/<filename>
  // process.cwd() gives the root of the project
  const path = join(process.cwd(), 'public', 'images', filename);

  try {
    await writeFile(path, buffer);
    console.log(`File uploaded to: ${path}`);
    // The URL path to be stored in DB and used in src attribute
    const publicPath = `/images/${filename}`;
    return NextResponse.json({ success: true, path: publicPath });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file.' }, { status: 500 });
  }
}
