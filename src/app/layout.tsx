
"use client"; 

import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'; 
import { ThemeProvider } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';
import type { Metadata } from 'next';

// Default metadata, can be overridden by individual pages
const defaultMetadata: Metadata = {
  title: 'Classic-Solution - AC Sales and Services',
  description: 'Your one-stop solution for second-hand ACs and reliable services.',
};

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine if the route is an admin route
  const isAdminRoute = pathname.startsWith('/admin');
  
  // Determine if the route is the not-found page.
  const isNotFound = segment === '(not-found)';

  return (
    <>
      {isClient && !isAdminRoute && !isNotFound && <Header />}
      <main className="flex-grow">{children}</main>
      {isClient && !isAdminRoute && !isNotFound && <Footer />}
      <Toaster />
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{String(defaultMetadata.title)}</title>
        <meta name="description" content={defaultMetadata.description!} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
        >
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
