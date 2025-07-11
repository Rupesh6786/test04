
"use client";

import { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, Unsubscribe, Timestamp, orderBy } from 'firebase/firestore';
import { Loader2, PackageSearch } from 'lucide-react';

export function ProductsPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const productsColRef = collection(db, "products");
    // Query for all products, ordered by creation date descending (newest first).
    // This shows all products, including out-of-stock ones. The ProductCard handles the UI.
    const q = query(productsColRef, orderBy("createdAt", "desc"));

    const unsubscribe: Unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedProducts: Product[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          fetchedProducts.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as Product);
        });

        setProducts(fetchedProducts);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Our Products</h1>
        <p className="text-lg text-muted-foreground">
          Find the perfect pre-owned or new AC unit for your needs. All units are quality-checked.
        </p>
      </div>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Loading available products...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-20 text-destructive bg-destructive/10 p-6 rounded-md">
            <PackageSearch className="mx-auto h-12 w-12 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Oops! Something went wrong.</h2>
          <p>{error}</p>
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <div className="text-center py-20">
          <PackageSearch className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">No Products Available</h2>
          <p className="text-muted-foreground">
            It seems we're currently out of stock or no products match your criteria.
            <br />
            Please check back later or contact us for assistance!
          </p>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
