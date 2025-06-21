"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Service } from "@/types";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const serviceBookingSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Invalid phone number format. Include country code if necessary (e.g., +91XXXXXXXXXX)." }),
  email: z.string().email({ message: "Invalid email address." }),
  serviceType: z.string({ required_error: "Please select a service type." }),
  bookingDate: z.date({ required_error: "A date for booking is required." }),
  bookingTime: z.string({ required_error: "Please select a time slot." }),
  budget: z.string().optional(),
  address: z.string().min(5, { message: "Address must be at least 5 characters."}),
});

type ServiceBookingFormValues = z.infer<typeof serviceBookingSchema>;

const timeSlots = [
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
];

interface ServiceBookingFormProps {
  availableServices: Service[];
  initialServiceType?: string;
}

export function ServiceBookingForm({ availableServices, initialServiceType }: ServiceBookingFormProps) {
  const { isLoggedIn, openAuthModal, currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<ServiceBookingFormValues>({
    resolver: zodResolver(serviceBookingSchema),
    defaultValues: {
      name: currentUser?.displayName || "",
      phone: "", 
      email: currentUser?.email || "",
      serviceType: initialServiceType || "",
      budget: "",
      address: "",
    },
  });

  useEffect(() => {
    if (currentUser) {
      form.reset({
        ...form.getValues(), 
        name: currentUser.displayName || form.getValues().name || "",
        email: currentUser.email || form.getValues().email || "",
        serviceType: initialServiceType || form.getValues().serviceType || "", 
      });
    }
  }, [currentUser, form, initialServiceType]);

  useEffect(() => {
    if (initialServiceType) {
      form.setValue("serviceType", initialServiceType, { shouldValidate: true });
    }
  }, [initialServiceType, form]);


  async function onSubmit(data: ServiceBookingFormValues) {
    if (!isLoggedIn || !currentUser) {
      toast({
        title: "Login Required",
        description: "Please login or register to book an appointment.",
        variant: "destructive",
      });
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "users", currentUser.uid, "appointments"), {
        userId: currentUser.uid,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        serviceType: data.serviceType,
        bookingDate: format(data.bookingDate, "yyyy-MM-dd"), // Store date as string
        bookingTime: data.bookingTime,
        budget: data.budget || "",
        status: "Payment Pending", // Initial status
        createdAt: serverTimestamp(), // For ordering
      });

      toast({
        title: "Booking Request Submitted!",
        description: `We've received your request. You'll now be redirected to your account page to complete payment.`,
      });

      router.push('/my-account');

      form.reset({ 
        name: currentUser?.displayName || "",
        phone: "",
        email: currentUser?.email || "",
        serviceType: "", 
        bookingDate: undefined,
        bookingTime: undefined,
        budget: "",
        address: "",
      });
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast({ title: "Booking Error", description: "Could not submit your booking request. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+911234567890" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St, Anytown" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="serviceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Service Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., ₹500 - ₹1000" {...field} disabled={isSubmitting}/>
                </FormControl>
                <FormDescription>
                  Let us know your budget range for the service.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="bookingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Preferred Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={isSubmitting}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0)) } 
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="bookingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Time Slot</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time slot" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeSlots.map(slot => (
                       <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" size="lg" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isSubmitting ? 'Submitting...' : 'Request Appointment'}
        </Button>
      </form>
    </Form>
  );
}
