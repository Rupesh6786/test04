
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
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription as ShadFormDescription,
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
import { Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import type { Offer } from '@/types';

const offerSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  status: z.enum(['Active', 'Inactive'], { required_error: 'Status is required.' }),
  ctaText: z.string().min(3, { message: "CTA button text is required." }),
  ctaLink: z.string().startsWith('/', { message: "Link must be a relative path, e.g., /products" }),
});

type OfferFormValues = z.infer<typeof offerSchema>;

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOfferSaved: () => void;
  offerToEdit?: Offer | null;
}

export function OfferFormModal({
  isOpen,
  onClose,
  onOfferSaved,
  offerToEdit,
}: OfferFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      imageUrl: '',
      status: 'Active',
      ctaText: '',
      ctaLink: '',
    },
  });

  useEffect(() => {
    if (offerToEdit) {
      form.reset({
        title: offerToEdit.title,
        description: offerToEdit.description,
        imageUrl: offerToEdit.imageUrl || '',
        status: offerToEdit.status,
        ctaText: offerToEdit.ctaText,
        ctaLink: offerToEdit.ctaLink,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        imageUrl: '',
        status: 'Active',
        ctaText: 'Claim Offer',
        ctaLink: '/products',
      });
    }
  }, [offerToEdit, form, isOpen]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Upload failed');
      
      form.setValue('imageUrl', result.path, { shouldValidate: true });
      toast({ title: 'Image Uploaded', description: 'Image URL has been set.' });
    } catch (error) {
      console.error("Upload error:", error);
      toast({ title: 'Upload Failed', description: String(error), variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: OfferFormValues) => {
    setIsSubmitting(true);
    try {
      const offerData = { ...data, updatedAt: serverTimestamp() };
      if (offerToEdit) {
        const offerRef = doc(db, 'offers', offerToEdit.id);
        await setDoc(offerRef, offerData, { merge: true });
        toast({ title: 'Offer Updated' });
      } else {
        await addDoc(collection(db, 'offers'), { ...offerData, createdAt: serverTimestamp() });
        toast({ title: 'Offer Added' });
      }
      onOfferSaved();
      onClose();
    } catch (error) {
      console.error('Error saving offer:', error);
      toast({ title: 'Error', description: 'Could not save offer.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90svh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>{offerToEdit ? 'Edit Offer' : 'Add New Offer'}</DialogTitle>
          <DialogDescription>
            {offerToEdit ? 'Update the details for this promotion.' : 'Enter details for a new promotion.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Title</FormLabel>
                  <FormControl><Input placeholder="e.g., 20% Off Summer Sale" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Details about the offer..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl><Input placeholder="https://... or upload" {...field} /></FormControl>
                    <Button asChild variant="outline" size="icon">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                        <input id="image-upload" type="file" className="sr-only" onChange={handleImageUpload} accept="image/*" />
                      </label>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="ctaText"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Button Text</FormLabel>
                        <FormControl><Input placeholder="e.g., Shop Now" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="ctaLink"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Button Link</FormLabel>
                        <FormControl><Input placeholder="/products" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {offerToEdit ? 'Save Changes' : 'Add Offer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
