
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, CalendarDays, Loader2 } from 'lucide-react';
import Link from 'next/link';
import type { Offer } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function OffersPage() {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const offersColRef = collection(db, "offers");
    // Simplified query to fetch all documents first, then filter on the client.
    // This can help bypass Firestore security rules that are strict on complex queries.
    const q = query(offersColRef);

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedOffers: Offer[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
          } as Offer;
        });

        // Filter for active offers and sort by date on the client side
        const activeAndSortedOffers = fetchedOffers
          .filter(offer => offer.status === 'Active')
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA; // Sort descending (newest first)
          });
        
        setOffers(activeAndSortedOffers);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching offers:", error);
        toast({
          title: "Error Fetching Offers",
          description: "Could not fetch offers from Firestore. " + error.message,
          variant: "destructive",
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Special Offers & Discounts</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Don't miss out on these amazing deals! Save big on AC products and services.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="ml-3 text-muted-foreground">Loading offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="text-center py-20">
          <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No Active Offers</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no special offers available right now. Please check back later!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {offers.map((offer) => (
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
                  <Link href={offer.ctaLink}>
                    <Button className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Tag className="w-4 h-4 mr-2" />
                      {offer.ctaText}
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
