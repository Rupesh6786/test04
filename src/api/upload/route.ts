
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Define the directory path to be public/img
    const uploadDir = path.join(process.cwd(), 'public', 'img');

    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Sanitize and create a unique filename to prevent path traversal issues
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `${Date.now()}_${sanitizedFilename}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Write the file to the local filesystem
    await writeFile(filePath, buffer);
    
    // The public path to be stored in the database and used by next/image
    const publicPath = `/img/${uniqueFilename}`;

    // Return the public path
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error saving file locally:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file due to an unknown error.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
