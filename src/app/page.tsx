
import type { Metadata } from 'next';
import { HomePageClient } from '@/components/pages/HomePageClient';

export const metadata: Metadata = {
  title: 'AC-Solution: Affordable Used ACs & Expert Repair Services in Mumbai',
  description: 'Affordable second-hand AC units & expert AC servicing in Mumbai. Contact us today!',
};

export default function HomePage() {
  return <HomePageClient />;
}
