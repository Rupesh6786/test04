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

  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const uniqueFilename = `${Date.now()}_${sanitizedFilename}`;

  const publicDirPath = join(process.cwd(), 'public', 'images');
  const filePath = join(publicDirPath, uniqueFilename);
  
  const publicPath = `/images/${uniqueFilename}`;

  try {
    await ensureDirExists(publicDirPath);
    
    await writeFile(filePath, buffer);
    console.log(`File saved to ${filePath}`);

    return NextResponse.json({ success: true, path: publicPath });

  } catch (error) {
    console.error('Error saving file to local filesystem:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to save file due to an unknown error.';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
