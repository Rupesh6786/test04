import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { stat, mkdir } from 'fs/promises';

async function ensureDirExists(dirPath: string) {
  try {
    await stat(dirPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await mkdir(dirPath, { recursive: true });
    } else {
      throw error;
    }
  }
}

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Use a timestamp and sanitized filename for uniqueness
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${Date.now()}_${sanitizedFilename}`;

  // The path will be relative to the project root, inside the `public` directory
  const publicDirPath = join(process.cwd(), 'public', 'img');
  const filePath = join(publicDirPath, uniqueFilename);
  
  // The public path to be stored in the database and used in <img> tags
  const publicPath = `/img/${uniqueFilename}`;

  try {
    // Ensure the `public/img` directory exists before trying to write to it
    await ensureDirExists(publicDirPath);
    
    // Write the file to the local filesystem
    await writeFile(filePath, buffer);
    console.log(`File saved to ${filePath}`);

    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error saving file to local filesystem:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save file due to an unknown error.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
