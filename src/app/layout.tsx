
"use client"; 

import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { usePathname, useSelectedLayoutSegment } from 'next/navigation'; 
import { ThemeProvider } from '@/components/ThemeProvider';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const segment = useSelectedLayoutSegment();
  
  const isAdminRoute = pathname.startsWith('/admin');
  // `segment` will be `(not-found)` for the 404 page.
  const isNotFound = segment === '(not-found)';

  return (
    <>
      {!isAdminRoute && !isNotFound && <Header />}
      <main className="flex-grow">{children}</main>
      {!isAdminRoute && !isNotFound && <Footer />}
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
