
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
import Script from 'next/script';

// Default metadata, can be overridden by individual pages
const defaultMetadata: Metadata = {
  title: 'Classic Solution | Used AC Sales, Repair & Installation in Mumbai',
  description: 'Buy second-hand air conditioners in Mumbai at affordable prices. We offer expert AC servicing, installation, and reliable customer support at Classic Solution, Dahisar.',
  openGraph: {
    title: 'Classic Solution | AC Experts in Mumbai',
    description: 'Affordable second-hand ACs with repair and installation services across Mumbai. Visit Classic Solution in Dahisar.',
    url: 'https://classicsolution.shop',
    images: [
      {
        url: 'https://classicsolution.shop/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Classic Solution AC Services',
      },
    ],
    siteName: 'Classic Solution',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Classic Solution - Mumbai’s Trusted AC Experts',
    description: 'Get affordable used ACs and expert repair/installation services. Serving Dahisar and nearby areas in Mumbai.',
    images: ['https://classicsolution.shop/assets/twitter-image.jpg'],
  },
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
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Classic Solution",
    "image": "https://classicsolution.shop/hero-section.jpg",
    "telephone": "+917991317190",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Plot No.8, Shop NO.4, Baghdadi Market, Near Krishna Hotel, Tare Compound, W.E.Highway, Dahisar Checknaka, Dahisar(E)",
      "addressLocality": "Mumbai",
      "addressRegion": "MH",
      "postalCode": "400068",
      "addressCountry": "IN"
    },
    "url": "https://classicsolution.shop",
    "sameAs": [
      "https://www.facebook.com/share/1Bka82yYBn/",
      "https://www.instagram.com/classic_solution_official/",
      "https://www.linkedin.com/in/gulam-mainuddin-khan-79913mk",
      "https://x.com/GulamKh31049008"
    ],
    "priceRange": "₹500 - ₹3000",
    "openingHours": "Mo-Sa 09:00-18:00"
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>{String(defaultMetadata.title)}</title>
        <meta name="description" content={defaultMetadata.description!} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
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
