
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Frown, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] bg-background text-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="flex justify-center items-center mb-6">
            <Frown className="h-24 w-24 text-primary" strokeWidth={1.5} />
            <span className="text-9xl font-bold text-foreground -ml-4 -mr-2 z-10">4</span>
            <Frown className="h-24 w-24 text-primary transform -scale-x-100" strokeWidth={1.5}/>
            <span className="text-9xl font-bold text-foreground -ml-4 z-10">4</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mt-4">
          Page Not Found
        </h1>
        
        <p className="mt-4 text-lg text-muted-foreground">
          Oops! The page you are looking for does not exist. It might have been moved or deleted.
        </p>
        
        <Link href="/" className="mt-8 inline-block">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
