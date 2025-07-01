"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, CircleDollarSign, PackageSearch, ShieldCheck } from 'lucide-react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const stockValue = Number(product.stock);
  const isAvailable = !isNaN(stockValue) && stockValue > 0;

  const displayImage = (product.imageUrls && product.imageUrls[0]) || product.imageUrl || "https://placehold.co/400x300.png";
  
  const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
  const discountedPrice = hasDiscount ? product.price * (1 - product.discountPercentage! / 100) : product.price;

  return (
    <Card className="flex flex-col overflow-hidden h-full hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="p-0 relative">
        <Link href={`/products/${product.id}`} aria-label={`View details for ${product.brand} ${product.capacity} ${product.category}`}>
          <Image
            src={displayImage}
            alt={`${product.brand} ${product.capacity} ${product.category}`}
            width={400}
            height={300}
            className="object-cover w-full h-48"
          />
        </Link>
        {hasDiscount && (
             <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground px-2 py-1 text-xs font-bold rounded-md shadow-lg transform -rotate-6">
                {product.discountPercentage}% OFF
            </div>
        )}
        <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-2 py-1 text-xs font-semibold rounded-md shadow">
          {product.condition}
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="font-headline text-xl mb-1">
          <Link href={`/products/${product.id}`} className="hover:text-primary transition-colors">
            {product.brand} {product.capacity} {product.category}
          </Link>
        </CardTitle>
        <div className="flex items-center space-x-2 mb-2">
            <p className="text-2xl font-semibold text-accent">₹{discountedPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            {hasDiscount && (
                <p className="text-lg font-medium text-muted-foreground line-through">
                    ₹{product.price.toLocaleString()}
                </p>
            )}
        </div>
        <div className="space-y-1 text-sm text-muted-foreground mb-3">
          <div className="flex items-center">
            <Tag className="w-4 h-4 mr-2 text-primary" /> Capacity: {product.capacity}
          </div>
          <div className="flex items-center">
            <PackageSearch className="w-4 h-4 mr-2 text-primary" /> Stock: {isAvailable ? `${stockValue} units` : 'Out of Stock'}
          </div>
          {product.warranty && (
            <div className="flex items-center">
              <ShieldCheck className="w-4 h-4 mr-2 text-primary" /> Warranty: {product.warranty}
            </div>
          )}
        </div>
        <CardDescription className="text-sm text-foreground/80 line-clamp-3">
          {product.description || 'No description available.'}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex space-x-2 w-full">
          {isAvailable ? (
              <Link href={`/checkout/${product.id}`} className="flex-1">
                  <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">Buy Now</Button>
              </Link>
          ) : (
              <Button className="flex-1" disabled>Out of Stock</Button>
          )}
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="outline" className="w-full">Know More</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
