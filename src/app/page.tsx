
import type { Metadata } from 'next';
import { HomePageClient } from '@/components/pages/HomePageClient';

export const metadata: Metadata = {
  title: 'AC-Solution: Affordable Used ACs & Expert Repair Services in Mumbai',
  description: 'Find top deals on quality second-hand ACs and book reliable services like installation, repair, and gas charging. Serving Mumbai for over 16 years with 10,000+ happy customers.',
};

export default function HomePage() {
  return <HomePageClient />;
}
