
import { MetadataRoute } from 'next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product } from '@/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://classicsolution.shop'; // Replace with your actual domain

  // Get all products for dynamic routes
  const productsSnapshot = await getDocs(collection(db, 'products'));
  const products = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  
  const productUrls = products.map(product => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Define static routes
  const staticRoutes = [
    '/',
    '/about',
    '/contact',
    '/cancellations-and-refunds',
    '/locate-store',
    '/media',
    '/my-account',
    '/products',
    '/services',
    '/shipping-policy',
    '/terms-and-conditions',
  ];

  const staticUrls = staticRoutes.map(route => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '/' ? 1.0 : 0.7,
  }));

  return [...staticUrls, ...productUrls];
}
