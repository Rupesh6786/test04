
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ContactUsPage() {
    const storeAddress = "Plot No.8, Shop NO.4, Baghdadi Market, Near Krishna Hotel, Tare Compound, W.E.Highway, Dahisar Checknaka, Dahisar(E), Mumbai-400068";
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeAddress)}`;

  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Contact Us</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're here to help! Reach out to us with any questions or for service inquiries.
                </p>
            </div>
            <Card className="max-w-4xl mx-auto shadow-lg">
                <div className="grid md:grid-cols-2">
                    <div className="p-8">
                        <CardHeader className="p-0 mb-6">
                            <CardTitle className="font-headline text-2xl">Get in Touch</CardTitle>
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
                                    <a href="mailto:support@classic-solution.com" className="hover:text-primary transition-colors">support@classic-solution.com</a>
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
                     <div className="bg-primary/10 md:rounded-r-lg flex items-center justify-center p-8">
                        <Link href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block text-center group">
                            <MapPin className="w-16 h-16 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <h3 className="font-headline text-xl font-semibold text-foreground mb-2">View on Map</h3>
                            <p className="text-sm text-muted-foreground group-hover:text-primary transition-colors">Click here to get directions to our store.</p>
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
}
