
import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LocateStorePage() {
  const storeName = "Classic Solution";
  const storeAddress = "Plot No.8, Shop NO.4, Baghdadi Market, Near Krishna Hotel, Tare Compound, W.E.Highway, Dahisar Checknaka, Dahisar(E), Mumbai-400068";
  
  // This is the Firebase Web API key, safe to use on the client for this purpose.
  // Ensure the Google Maps Embed API is enabled in your Google Cloud project.
  const API_KEY = "AIzaSyDEsi2at9uEvSycslN4-6rH6s8WbLJQjWs";
  const mapsQuery = encodeURIComponent(`${storeName}, ${storeAddress}`);
  
  // Use the Google Maps Embed API URL which is designed for iframes
  const mapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${mapsQuery}`;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Locate Our Store</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find our main store location and contact details below. We look forward to serving you!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
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
              <a href="tel:+919821806461" className="flex items-center text-accent hover:underline">
                <Phone className="w-5 h-5 mr-2" /> +91 98218 06461
              </a>
              <a href="mailto:classicsolutionofficial@gmail.com" className="flex items-center text-accent hover:underline">
                <Mail className="w-5 h-5 mr-2" /> classicsolutionofficial@gmail.com
              </a>
            </div>
          </CardContent>
        </Card>

        <div className="relative aspect-video bg-muted rounded-lg shadow hover:shadow-md transition-shadow">
          <iframe
            src={mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Google Map of Classic Solution"
            className="rounded-lg"
          ></iframe>
        </div>
      </div>

       <div className="mt-16 text-center">
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Can't Visit Us?</h2>
        <p className="text-muted-foreground mb-6">
          No worries! You can browse our products online or book services right from your home.
        </p>
        <div className="space-x-4">
            <a href="/products" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-accent-foreground bg-accent hover:bg-accent/90">
            Shop Products
          </a>
           <a href="/services" className="inline-flex items-center justify-center px-6 py-3 border border-accent text-base font-medium rounded-md text-accent hover:bg-accent/10">
            Book Services
          </a>
        </div>
      </div>
    </div>
  );
}
