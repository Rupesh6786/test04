
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, stat } from 'fs/promises';
import { join } from 'path';

// Function to ensure the directory exists
async function ensureDirExists(dirPath: string) {
  try {
    // The 'stat' function will throw an error if the path doesn't exist.
    await stat(dirPath);
  } catch (error: any) {
    // If the error is that the directory doesn't exist, create it.
    if (error.code === 'ENOENT') {
      try {
        await mkdir(dirPath, { recursive: true });
        console.log(`Created directory: ${dirPath}`);
      } catch (mkdirError) {
        console.error('Error creating directory:', mkdirError);
        throw mkdirError; // Propagate the error
      }
    } else {
      // For any other errors, re-throw them.
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

  // Sanitize the filename and make it unique to prevent overwrites
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${Date.now()}_${sanitizedFilename}`;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const imagesDir = join(process.cwd(), 'public', 'images');
    await ensureDirExists(imagesDir);

    const path = join(imagesDir, uniqueFilename);
    await writeFile(path, buffer);
    
    console.log(`File uploaded to: ${path}`);
    const publicPath = `/images/${uniqueFilename}`;
    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false, error: 'Failed to save file.' }, { status: 500 });
  }
}
