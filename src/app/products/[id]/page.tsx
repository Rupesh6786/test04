
"use client";

import type { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Tag, ShieldCheck, CircleDollarSign, CheckCircle, Settings, Star, PackageSearch, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CardDescription } from '@/components/ui/card';


export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      setError("Product ID is missing.");
      return;
    }

    setIsLoading(true);
    const productRef = doc(db, "products", productId);
    
    const unsubscribe: Unsubscribe = onSnapshot(
      productRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : undefined,
          } as Product);
          setError(null);
        } else {
          setError("Product not found.");
          setProduct(null); // Explicitly set to null if not found
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !product) { 
    // If there's an error AND product is null (which it would be if not found or fetch failed)
    // We call notFound() to render the nearest not-found.tsx or a default 404 page
    notFound();
  }
  
  if (!product) {
    // This case should ideally be handled by the error check above leading to notFound()
    // But as a fallback, if somehow product is null without an error state leading to notFound(),
    // we can also trigger notFound here.
    notFound();
  }


  const featuresArray = product.features ? product.features.split(',').map(f => f.trim()) : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        
        <Carousel className="w-full max-w-full shadow-lg">
          <CarouselContent>
            {product.imageUrls && product.imageUrls.length > 0 ? (
                product.imageUrls.map((url, index) => (
                <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                    <CardContent className="p-0 aspect-square flex items-center justify-center">
                        <Image
                        src={url}
                        alt={`${product.brand} ${product.model} image ${index + 1}`}
                        width={800}
                        height={800}
                        className="object-cover w-full h-full"
                        priority={index === 0}
                        />
                    </CardContent>
                    </Card>
                </CarouselItem>
                ))
            ) : (
                <CarouselItem>
                <Card className="overflow-hidden">
                    <CardContent className="p-0 aspect-square flex items-center justify-center bg-muted">
                    <Image
                        src="https://placehold.co/800x800.png"
                        alt="Placeholder image"
                        width={800}
                        height={800}
                        className="object-cover w-full"
                    />
                    </CardContent>
                </Card>
                </CarouselItem>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>

        <div className="space-y-6">
          <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium rounded-full">
            {product.condition}
          </span>
          <h1 className="font-headline text-4xl font-bold text-foreground">{product.brand} {product.model}</h1>
          
          <div className="flex items-center space-x-2">
            <CircleDollarSign className="w-8 h-8 text-accent" />
            <p className="text-4xl font-semibold text-accent">₹{product.price.toLocaleString()}</p>
          </div>
           <p className={`text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
          </p>

          <CardDescription className="text-lg text-foreground/80 leading-relaxed">
            {product.description}
          </CardDescription>

          <div className="space-y-3 py-4 border-t border-b">
            <div className="flex items-center text-foreground">
              <Tag className="w-5 h-5 mr-3 text-primary" /> 
              <span className="font-medium">Capacity:</span>&nbsp;{product.capacity}
            </div>
            {product.warranty && (
                 <div className="flex items-center text-foreground">
                    <ShieldCheck className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">Warranty:</span>&nbsp;{product.warranty}
                 </div>
            )}
             <div className="flex items-center text-foreground">
              <Settings className="w-5 h-5 mr-3 text-primary" /> 
              <span className="font-medium">Category:</span>&nbsp;{product.category}
            </div>
          </div>
          
          {featuresArray.length > 0 && featuresArray[0] !== '' && (
            <div>
                <h3 className="font-headline text-xl font-semibold text-foreground mb-3">Key Features</h3>
                <ul className="space-y-2">
                {featuresArray.map((feature, index) => (
                    <li key={index} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-1 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                    </li>
                ))}
                </ul>
            </div>
          )}
          
          {product.stock > 0 ? (
            <Link href={`/checkout/${product.id}`} className="w-full md:w-auto block mt-6">
                <Button size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8">
                Buy Now
                </Button>
            </Link>
            ) : (
            <Button size="lg" className="w-full md:w-auto text-lg py-3 px-8" disabled>
                Out of Stock
            </Button>
          )}
        </div>
      </div>

      {/* Placeholder for Reviews/Ratings section */}
      <div className="mt-16 pt-8 border-t">
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Customer Reviews</h2>
        <div className="bg-muted/50 p-6 rounded-lg text-center">
          <Star className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
          <p className="text-muted-foreground">Customer reviews and ratings coming soon!</p>
        </div>
      </div>
    </div>
  );
}
