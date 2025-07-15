
import type { Metadata } from 'next';
import { HomePageClient } from '@/components/pages/HomePageClient';

export const metadata: Metadata = {
  title: 'Classic Solution: Affordable Used AC & Expert Repair Services in Mumbai',
  description: 'Buy second-hand air conditioners at affordable prices in Mumbai. Reliable AC servicing and installation at Classic Solution. Call now!',
};

export default function HomePage() {
  return <HomePageClient />;
}
