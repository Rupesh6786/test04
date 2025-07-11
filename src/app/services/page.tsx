
import type { Metadata } from 'next';
import { ServicesPageClient } from '@/components/pages/ServicesPageClient';

export const metadata: Metadata = {
    title: 'Professional AC Service & Repair | Classic-Solution',
    description: 'Book professional AC services including installation, repair, cleaning, and gas charging in Mumbai. Our certified technicians ensure your AC runs perfectly.',
};

export default function ServicesPage() {
    return <ServicesPageClient />;
}
