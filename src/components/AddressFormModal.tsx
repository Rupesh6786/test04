
"use client";

import { useState } from 'react';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Address } from '@/types';

const addressSchema = z.object({
  type: z.enum(['Home', 'Work', 'Other'], { required_error: 'Address type is required.' }),
  line1: z.string().min(5, { message: 'Address line 1 must be at least 5 characters.' }),
  line2: z.string().optional(),
  city: z.string().min(2, { message: 'City must be at least 2 characters.' }),
  state: z.string().min(2, { message: 'State must be at least 2 characters.' }),
  zipCode: z.string().min(5, { message: 'Zip code must be at least 5 characters.' }),
  country: z.string().min(2, { message: 'Country must be at least 2 characters.' }),
  isDefault: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onAddressAdded: () => void;
  addressToEdit?: Address | null; // For future edit functionality
}

export function AddressFormModal({
  isOpen,
  onClose,
  userId,
  onAddressAdded,
  addressToEdit,
}: AddressFormModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: addressToEdit
      ? {
          type: addressToEdit.type,
          line1: addressToEdit.line1,
          line2: addressToEdit.line2 || '',
          city: addressToEdit.city,
          state: addressToEdit.state,
          zipCode: addressToEdit.zipCode,
          country: addressToEdit.country,
          isDefault: addressToEdit.isDefault || false,
        }
      : {
          type: 'Home',
          line1: '',
          line2: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'India', // Default country
          isDefault: false,
        },
  });

  const onSubmit = async (data: AddressFormValues) => {
    setIsSubmitting(true);
    try {
      if (addressToEdit) {
        // Update logic (for future)
        toast({ title: 'Update (Not Implemented)', description: 'Address update functionality coming soon.' });
      } else {
        // Add new address
        await addDoc(collection(db, 'users', userId, 'addresses'), {
          userId, // Store userId for potential cross-user queries if needed (though usually scoped per user)
          ...data,
        });
        onAddressAdded(); // This will close modal and refresh list via parent
      }
      form.reset(); // Reset form after successful submission
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: 'Error',
        description: `Could not save address. ${error instanceof Error ? error.message : ''}`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[480px] max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{addressToEdit ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {addressToEdit ? 'Update your existing address details.' : 'Enter the details for your new address.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select address type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Home">Home</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input placeholder="Street address, P.O. box, company name, c/o" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Apartment, suite, unit, building, floor, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>State / Province</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. Maharashtra" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Zip / Postal Code</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. 400068" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g. India" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <Label htmlFor="isDefault" className="font-normal">
                      Set as default address
                    </Label>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {addressToEdit ? 'Save Changes' : 'Add Address'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
