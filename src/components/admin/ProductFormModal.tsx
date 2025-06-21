
"use client";

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription, // This is for Dialog, not the FormDescription for fields
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription as ShadFormDescription, // Renaming to avoid conflict if any, and to be explicit for form fields
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Product } from '@/types';

// Schema without 'features' for AI, as per manual entry requirement.
const productSchema = z.object({
  brand: z.string().min(2, { message: "Brand must be at least 2 characters." }),
  model: z.string().min(2, { message: "Model must be at least 2 characters." }),
  capacity: z.string().min(2, { message: "Capacity is required (e.g., 1.5 Ton)." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  stock: z.coerce.number().int().min(0, { message: "Stock must be a non-negative integer." }),
  condition: z.enum(['New', 'Used'], { required_error: 'Condition is required.' }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }).max(1000, {message: "Description cannot exceed 1000 characters."}),
  category: z.string().min(3, { message: "Category must be at least 3 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL." }),
  features: z.string().optional(),
  warranty: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductSaved: () => void;
  productToEdit?: Product | null;
}

export function ProductFormModal({
  isOpen,
  onClose,
  onProductSaved,
  productToEdit,
}: ProductFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      brand: '',
      model: '',
      capacity: '',
      price: 0,
      stock: 0,
      condition: 'Used',
      description: '',
      category: '',
      imageUrl: '',
      features: '',
      warranty: '',
    },
  });

  useEffect(() => {
    if (productToEdit) {
      form.reset({
        brand: productToEdit.brand,
        model: productToEdit.model,
        capacity: productToEdit.capacity,
        price: productToEdit.price,
        stock: productToEdit.stock,
        condition: productToEdit.condition,
        description: productToEdit.description,
        category: productToEdit.category,
        imageUrl: productToEdit.imageUrl,
        features: productToEdit.features || '',
        warranty: productToEdit.warranty || '',
      });
    } else {
      form.reset({
        brand: '',
        model: '',
        capacity: '',
        price: 0,
        stock: 0,
        condition: 'Used',
        description: '',
        category: '',
        imageUrl: '',
        features: '',
        warranty: '',
      });
    }
  }, [productToEdit, form, isOpen]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    try {
      const productData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      if (productToEdit) {
        const productRef = doc(db, 'products', productToEdit.id);
        await setDoc(productRef, productData, { merge: true });
        toast({ title: 'Product Updated', description: `${data.brand} ${data.model} has been updated.` });
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Product Added', description: `${data.brand} ${data.model} has been added.` });
      }
      onProductSaved();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: 'Error',
        description: `Could not save product. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90svh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          {/* The DialogDescription below is for the overall dialog, not the form field */}
          <DialogDescription>
            {productToEdit ? 'Update the details of this AC unit.' : 'Enter the details for the new AC unit.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl><Input placeholder="e.g., LG, Samsung, Voltas" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl><Input placeholder="e.g., X2000, CoolPro 150" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl><Input placeholder="e.g., 1.5 Ton, 1 Ton, 18000 BTU" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl><Input placeholder="e.g., Split AC, Window AC, Portable AC" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 25000" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock</FormLabel>
                    <FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="New">New</SelectItem>
                        <SelectItem value="Used">Used</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Detailed product description (max 1000 characters)..." {...field} rows={5} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
                control={form.control}
                name="warranty"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Warranty</FormLabel>
                    <FormControl><Input placeholder="e.g., 1 Year Parts, 5 Years Compressor" {...field} /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Features</FormLabel>
                  <FormControl><Textarea placeholder="Comma-separated features (e.g., Inverter, Smart Control, Air Purification)" {...field} rows={3} /></FormControl>
                  <ShadFormDescription>
                    Enter key features separated by commas.
                  </ShadFormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder="https://example.com/image.png" {...field} /></FormControl>
                  <ShadFormDescription>
                    Direct URL to the product image. Ensure it's publicly accessible. 
                    (Note: File upload with preview requires Firebase Storage integration - currently uses URL input.)
                  </ShadFormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {productToEdit ? 'Save Changes' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
