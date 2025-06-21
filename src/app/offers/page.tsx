
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import type { Offer } from '@/types';

const offersData: Offer[] = [
  {
    id: '1',
    title: '₹500 Off on First Service',
    description: 'New to Classic-Solution? Get ₹500 off on your first AC service booking. Applicable on services above ₹1000.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'discount offer',
  },
  {
    id: '2',
    title: 'Buy One AC, Get Installation Free',
    description: 'Purchase any used AC from our premium collection and enjoy complimentary standard installation services.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'air conditioner installation',
  },
  {
    id: '3',
    title: 'Summer Cooler Combo: 15% Off',
    description: 'Get a flat 15% discount when you opt for a combo of AC Dry Service and Gas Charging. Keep your AC running like new!',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'ac service combo',
  },
  {
    id: '4',
    title: 'Extended Warranty Special',
    description: 'Add an extra year of warranty to your purchased used AC for just ₹999. Peace of mind guaranteed.',
    imageUrl: 'https://placehold.co/600x400.png',
    aiHint: 'warranty certificate',
  },
];

export default function OffersPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Special Offers & Discounts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Don't miss out on these amazing deals! Save big on AC products and services.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {offersData.map((offer) => (
          <Card key={offer.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col sm:flex-row">
            {offer.imageUrl && (
              <div className="sm:w-2/5 relative">
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  data-ai-hint={offer.aiHint || 'offer promotion'}
                  width={600}
                  height={400}
                  className="object-cover w-full h-48 sm:h-full"
                />
              </div>
            )}
            <div className="sm:w-3/5 flex flex-col">
              <CardHeader>
                <CardTitle className="font-headline text-xl text-primary">{offer.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-foreground/80 mb-4">{offer.description}</CardDescription>
              </CardContent>
              <CardContent className="pt-0">
                 <div className="flex items-center text-sm text-muted-foreground mb-4">
                   <CalendarDays className="w-4 h-4 mr-2" /> Limited time offer!
                 </div>
                <Link href={offer.title.includes("Service") ? "/services" : "/products"}>
                  <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Tag className="w-4 h-4 mr-2" />
                    Claim Offer
                  </Button>
                </Link>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
