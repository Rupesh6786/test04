import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function POST(request: NextRequest) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename for the uploaded file
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFilename = `product-images/${Date.now()}_${sanitizedFilename}`;

    // Create a reference to the file in Firebase Storage
    const storageRef = ref(storage, uniqueFilename);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: file.type,
    });

    // Get the public URL of the uploaded file
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Return the URL
    return NextResponse.json({ success: true, path: downloadURL });

  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload file due to an unknown error.';
    
    // Check for common storage errors
    if (errorMessage.includes('storage/unauthorized')) {
      return NextResponse.json({ success: false, error: "Permission denied. This is a Firebase Storage Rules issue. Please see the instructions in the README.md file." }, { status: 403 });
    }
    if (errorMessage.includes('storage/object-not-found')) {
         return NextResponse.json({ success: false, error: 'Storage object not found. The bucket might not exist.' }, { status: 404 });
    }
    if (errorMessage.includes('storage/unknown')) {
      return NextResponse.json({ success: false, error: "CORS configuration error. The 'storage/unknown' error is almost always caused by missing CORS settings on your Firebase Storage bucket. Please follow the specific instructions in README.md to fix this." }, { status: 500 });
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
