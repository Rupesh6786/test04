

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactForm } from '@/components/ContactForm';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | Classic-Solution AC Services',
  description: 'Get in touch with Classic-Solution for AC sales, service inquiries, or support. Find our address, phone number, and email, or send us a message directly.',
};


export default function ContactUsPage() {
    const storeAddress = "Plot No.8, Shop NO.4, Baghdadi Market, Near Krishna Hotel, Tare Compound, W.E.Highway, Dahisar Checknaka, Dahisar(E), Mumbai-400068";
    
  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Contact Us</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're here to help! Reach out to us with any questions or for service inquiries using the form below.
                </p>
            </div>
            <Card className="max-w-6xl mx-auto shadow-lg grid md:grid-cols-2 overflow-hidden">
                <div className="p-4 sm:p-8">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle className="font-headline text-xl sm:text-2xl">Get in Touch</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 space-y-6 text-foreground/80">
                         <div className="flex items-start space-x-4">
                            <MapPin className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-foreground">Business Address</h3>
                                <address className="not-italic">{storeAddress}</address>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <Mail className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-foreground">Support Email</h3>
                                <a href="mailto:classicsolutionofficial@gmail.com" className="hover:text-primary transition-colors">classicsolutionofficial@gmail.com</a>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <Phone className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-foreground">Phone Number</h3>
                                <a href="tel:+917991317190" className="hover:text-primary transition-colors">+91 79913 17190</a>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <Clock className="w-6 h-6 text-primary mt-1 shrink-0" />
                            <div>
                                <h3 className="font-semibold text-foreground">Business Hours</h3>
                                <p>Monday – Saturday: 9:00 AM – 6:00 PM</p>
                                <p>Sunday: Closed</p>
                            </div>
                        </div>
                    </CardContent>
                </div>
                 <div className="bg-primary/5 p-4 sm:p-8">
                    <h3 className="font-headline text-xl sm:text-2xl font-semibold text-foreground mb-4">Send us an Enquiry</h3>
                    <ContactForm />
                </div>
            </Card>
        </div>
    </div>
  );
}

    