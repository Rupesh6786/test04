
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, FileText, Phone, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const policyLinks = [
  { href: '/contact', title: 'Contact Us', description: 'Get in touch with our team.', icon: Phone },
  { href: '/shipping-policy', title: 'Shipping Policy', description: 'Details on service delivery.', icon: Truck },
  { href: '/terms-and-conditions', title: 'Terms & Conditions', description: 'Read our terms of service.', icon: FileText },
  { href: '/cancellations-and-refunds', title: 'Cancellations & Refunds', description: 'Our policy on cancellations.', icon: RotateCcw },
];

export default function AboutUsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">About Classic-Solution</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Your trusted partner for affordable and reliable AC sales and services for over 16 years.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-4">
          <h2 className="font-headline text-2xl font-semibold text-primary">Our Mission</h2>
          <p className="text-foreground/80 leading-relaxed text-justify">
            At Classic-Solution, our mission is simple: to provide high-quality, budget-friendly cooling solutions to every household and business. We believe that comfort shouldn't come at a premium price. For over 16 years, we have been dedicated to sourcing the best pre-owned air conditioners and offering expert repair and maintenance services, ensuring our customers stay cool and comfortable all year round.
          </p>
          <p className="text-foreground/80 leading-relaxed text-justify">
            Our team of certified technicians and friendly customer service staff are the backbone of our company. We pride ourselves on our commitment to honesty, transparency, and customer satisfaction, which has helped us serve over 10,000 happy clients.
          </p>
        </div>
        <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
           <Image
            src="/images/about_us.jpg"
            alt="Our dedicated team"
            data-ai-hint="team meeting office"
            fill
            className="object-cover"
          />
        </div>
      </div>
      
      <div className="text-center mb-12">
        <h2 className="font-headline text-3xl font-semibold text-foreground mb-2">Our Policies</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          We believe in transparency. Here you can find all the information about our operational policies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {policyLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-transform flex flex-col items-center text-center">
              <CardHeader className="items-center">
                <div className="p-3 bg-primary/10 rounded-full mb-3">
                    <link.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="font-headline text-xl">{link.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground text-sm">{link.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
