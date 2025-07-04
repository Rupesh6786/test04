import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Use a unique filename
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${Date.now()}_${sanitizedFilename}`;
  
  // Define the upload directory within the public folder
  const uploadDir = path.join(process.cwd(), 'public/img');

  // Define the full path for the file
  const filePath = path.join(uploadDir, uniqueFilename);

  try {
    // Ensure the upload directory exists
    await mkdir(uploadDir, { recursive: true });
    
    // Write the file to the public/img directory
    await writeFile(filePath, buffer);

    // Return the public path to the file
    const publicPath = `/img/${uniqueFilename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error uploading file locally:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file due to an unknown error.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
