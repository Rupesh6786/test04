
import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LocateStorePage() {
  const storeName = "Classic Solution";
  const storeAddress = "Plot No.8, Shop NO.4, Baghdadi Market, Near Krishna Hotel, Tare Compound, W.E.Highway, Dahisar Checknaka, Dahisar(E), Mumbai-400068";
  
  // This URL opens the address directly in Google Maps for navigation.
  const googleMapsUrl = "https://maps.app.goo.gl/WLGJs15dSfZA9nRM6?g_st=aw";

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Locate Our Store</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find our main store location and contact details below. We look forward to serving you!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-stretch">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary flex items-center">
              <MapPin className="w-6 h-6 mr-2" /> {storeName}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <address className="not-italic text-foreground/80">
              <p>Plot No.8, Shop NO.4, Baghdadi Market</p>
              <p>Near Krishna Hotel, Tare Compound</p>
              <p>W.E.Highway, Dahisar Checknaka</p>
              <p>Dahisar(E), Mumbai-400068</p>
            </address>
            <div>
              <h4 className="font-semibold mb-1">Operating Hours:</h4>
              <p className="text-foreground/80">Monday - Saturday: 9:00 AM - 7:00 PM</p>
              <p className="text-foreground/80">Sunday: 10:00 AM - 4:00 PM</p>
            </div>
            <div className="space-y-2 pt-2">
              <a href="tel:+917991317190" className="flex items-center text-accent hover:underline">
                <Phone className="w-5 h-5 mr-2" /> +91 79913 17190
              </a>
              <a href="mailto:classicsolutionofficial@gmail.com" className="flex items-center text-accent hover:underline">
                <Mail className="w-5 h-5 mr-2" /> classicsolutionofficial@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>

        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="block h-full">
          <Card className="hover:shadow-lg transition-shadow h-full bg-primary/10 flex items-center justify-center">
            <CardContent className="text-center p-6">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-headline text-xl font-semibold text-foreground mb-2">Click to Navigate</h3>
                <p className="text-sm text-muted-foreground">
                    {storeAddress}
                </p>
            </CardContent>
          </Card>
        </a>
      </div>

       <div className="mt-16 text-center">
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Can't Visit Us?</h2>
        <p className="text-muted-foreground mb-6">
          No worries! You can browse our products online or book services right from your home.
        </p>
        <div className="space-x-4">
            <Link href="/products">
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Shop Products</Button>
            </Link>
           <Link href="/services">
             <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">Book Services</Button>
            </Link>
        </div>
      </div>
    </div>
  );
}
