
"use client";

import type { Product } from '@/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Tag, ShieldCheck, Settings, CheckCircle, PackageSearch, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, notFound } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent } from '@/components/ui/card';
import { CardDescription } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from '@/contexts/AuthContext';
import { Star } from 'lucide-react';

export function ProductDetailPageClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { isLoggedIn, openAuthModal } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

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

  const handleBuyNowClick = () => {
    if (!product) return;
    if (isLoggedIn) {
      router.push(`/checkout/${product.id}`);
    } else {
      openAuthModal('login');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error && !product) { 
    notFound();
  }
  
  if (!product) {
    notFound();
  }


  const featuresArray = product.features ? product.features.split(',').map(f => f.trim()) : [];

  const carouselImageUrls = (product.imageUrls && product.imageUrls.length > 0)
    ? product.imageUrls
    : (product.imageUrl ? [product.imageUrl] : []);

  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discountPercentage! / 100) : product.price;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        
        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-full shadow-lg"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent>
            {carouselImageUrls.length > 0 ? (
                carouselImageUrls.map((url, index) => (
                <CarouselItem key={index}>
                    <Card className="overflow-hidden">
                    <CardContent className="p-0 aspect-[4/3] flex items-center justify-center">
                        <Image
                        src={url}
                        alt={`${product.brand} ${product.model} image ${index + 1}`}
                        width={800}
                        height={600}
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
                    <CardContent className="p-0 aspect-[4/3] flex items-center justify-center bg-muted">
                    <Image
                        src="https://placehold.co/800x600.png"
                        alt="Placeholder image"
                        width={800}
                        height={600}
                        className="object-cover w-full"
                    />
                    </CardContent>
                </Card>
                </CarouselItem>
            )}
          </CarouselContent>
        </Carousel>

        <div className="space-y-6">
          <div className="flex gap-2 items-center">
            <span className="inline-block bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium rounded-full">
              {product.condition}
            </span>
             {hasDiscount && (
              <span className="inline-block bg-destructive text-destructive-foreground px-3 py-1 text-sm font-bold rounded-full">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>
          <h1 className="font-headline text-4xl font-bold text-foreground">{product.brand} {product.model}</h1>
          
          <div className="flex items-center space-x-4">
            <p className="text-4xl font-semibold text-accent">₹{discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            {hasDiscount && (
                <p className="text-2xl font-medium text-muted-foreground line-through">
                    ₹{product.price.toLocaleString()}
                </p>
            )}
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
            <Button
              size="lg"
              onClick={handleBuyNowClick}
              className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-3 px-8 mt-6"
            >
              Buy Now
            </Button>
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
