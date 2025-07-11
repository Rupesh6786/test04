"use client"; 

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'; 
import { ThemeProvider } from '@/components/ThemeProvider';
import { useEffect, useState } from 'react';

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
  // The segment will be null on initial load and then `(not-found)` on client-side navigation.
  // On a direct server render of a 404, we need another way, but for client-side this is key.
  // For the `not-found.tsx` to render, Next.js provides it as a child. 
  // We can key off the `segment` being `(not-found)`.
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
        <title>Classic-Solution - AC Sales and Services</title>
        <meta name="description" content="Your one-stop solution for second-hand ACs and reliable services." />
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
