
import type { Metadata } from 'next';
import { ProductsPageClient } from '@/components/pages/ProductsPageClient';

export const metadata: Metadata = {
  title: 'Used & New ACs for Sale | Classic-Solution',
  description: 'Browse our wide selection of quality-checked used and new air conditioners. Find the perfect split, window, or portable AC for your home or office.',
};

export default function ProductsPage() {
    return <ProductsPageClient />;
}
