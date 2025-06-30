
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Users, CircleDollarSign, CalendarCheck, CheckCircle } from 'lucide-react';

const whyChooseUsItems = [
  {
    icon: Award,
    title: '16+ Years Experience',
    description: 'Decades of expertise in AC sales and services, ensuring quality and reliability.',
  },
  {
    icon: Users,
    title: '10,000+ Happy Customers',
    description: 'A growing family of satisfied clients who trust our products and services.',
  },
  {
    icon: CircleDollarSign,
    title: 'Affordable Pricing',
    description: 'Competitive prices without compromising on quality for all AC units and services.',
  },
  {
    icon: CalendarCheck,
    title: 'Free Demo & Visit',
    description: 'Schedule a free demo or site visit to help you choose the perfect AC.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/20 via-background to-background py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://placehold.co/1920x1080/87CEEB/4682B4')] bg-repeat"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Top Deals on Used ACs - <span className="text-primary">Save Big Today!</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
                Discover high-quality, pre-owned air conditioners at unbeatable prices. Reliable, efficient, and budget-friendly cooling solutions for your home or office.
              </p>
              <Link href="/products">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-transform hover:scale-105">
                  Explore Now
                </Button>
              </Link>
            </div>
            <div className="relative h-80 md:h-[450px] group">
               <div className="absolute inset-0 bg-primary/30 rounded-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300"></div>
                <Image
                  // src="https://placehold.co/600x450.png"
                  src="/hero-section.jpg"
                  alt="Actress impressed by AC unit"
                  data-ai-hint="woman air conditioner"
                  width={600}
                  height={450}
                  className="rounded-lg shadow-2xl object-cover w-full h-full relative transform rotate-1 group-hover:rotate-0 transition-transform duration-300"
                  priority
                />
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="why-choose-us" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-center text-foreground mb-12">
            Why Choose <span className="text-primary">Classic-Solution?</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsItems.map((item, index) => (
              <Card
                key={index}
                className="text-center hover:shadow-xl transition-shadow duration-300 group bg-background opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardHeader className="items-center">
                  <div className="p-4 bg-primary/10 rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-10 h-10 text-primary" />
                  </div>
                  <CardTitle className="font-headline text-xl text-foreground">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Teaser (Optional) */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-center text-foreground mb-12">
            Featured Products
          </h2>
          <div className="text-center mb-8">
             <p className="text-lg text-muted-foreground">Check out some of our top-selling AC units.</p>
          </div>
          {/* Placeholder for a few product cards or a link to products page */}
          <div className="flex justify-center">
            <Link href="/products">
              <Button size="lg" variant="outline" className="border-accent text-accent hover:bg-accent/10">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Call to Action for Services */}
      <section className="py-16 md:py-24 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-headline text-3xl sm:text-4xl font-semibold mb-6">
            Need AC Service or Repair?
          </h2>
          <p className="text-lg text-accent-foreground/80 mb-8 max-w-2xl mx-auto">
            Our certified technicians provide top-notch AC services, from cleaning and maintenance to complex repairs and installations.
          </p>
          <Link href="/services">
            <Button size="lg" variant="secondary" className="bg-background text-accent hover:bg-background/90 shadow-lg transition-transform hover:scale-105">
              Book a Service
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
