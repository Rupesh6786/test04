import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the path to the public/img directory
    const uploadDir = join(process.cwd(), 'public', 'img');

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Create a unique filename to prevent overwriting
    const uniqueFilename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = join(uploadDir, uniqueFilename);

    // Write the file to the local filesystem
    await writeFile(filePath, buffer);

    // The public path to be stored in the database
    const publicPath = `/img/${uniqueFilename}`;

    // Return the public path
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error uploading to local filesystem:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file due to an unknown error.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
