
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Users, CircleDollarSign, CalendarCheck, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useRef } from 'react';

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

const heroSlides = [
  {
    title: <>Top Deals on Used ACs - <span className="text-primary">Save Big Today!</span></>,
    description: 'Discover high-quality, pre-owned air conditioners at unbeatable prices. Reliable, efficient, and budget-friendly cooling solutions for your home or office.',
    buttonText: 'Explore Products',
    buttonLink: '/products',
    imageUrl: '/hero-section.jpg',
    imageAlt: 'Woman impressed by an AC unit',
    aiHint: 'woman air conditioner'
  },
  {
    title: <>Expert AC Services & Repairs - <span className="text-primary">We've Got You Covered!</span></>,
    description: 'From routine maintenance and gas charging to complex repairs and installations, our certified technicians are ready to help.',
    buttonText: 'Book a Service',
    buttonLink: '/services',
    imageUrl: '/hero_section_expert_service.jpg',
    imageAlt: 'Technician servicing an AC unit',
    aiHint: 'technician ac service'
  },
  {
    title: <>Join 10,000+ Happy Customers - <span className="text-primary">Your Comfort is Our Priority.</span></>,
    description: 'We are dedicated to providing exceptional service and building lasting relationships. See what our customers have to say.',
    buttonText: 'Read Testimonials',
    buttonLink: '#testimonials',
    imageUrl: '/hero_section_happy_customer.jpg',
    imageAlt: 'Happy family enjoying their cool home',
    aiHint: 'family living room'
  },
  {
    title: <>Quality You Can Trust - <span className="text-primary">Guaranteed Performance.</span></>,
    description: 'Every pre-owned AC unit undergoes rigorous testing and quality checks to ensure it meets our high standards of performance and reliability.',
    buttonText: 'Why Choose Us',
    buttonLink: '#why-choose-us',
    imageUrl: '/hero_section_quality_trust.jpg',
    imageAlt: 'AC unit with a quality check seal',
    aiHint: 'quality seal certificate'
  },
  {
    title: <>Visit Our Store in Mumbai - <span className="text-primary">Get Expert Advice.</span></>,
    description: 'Explore our wide range of AC units in person and get expert advice from our friendly team. We\'re ready to help you find the perfect fit.',
    buttonText: 'Find Our Store',
    buttonLink: '/locate-store',
    imageUrl: '/hero_section_visit_store.jpg',
    imageAlt: 'Map pointing to a store location',
    aiHint: 'store map location'
  }
];

export default function HomePage() {
  const plugin = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }));

  return (
    <>
      {/* Hero Section Carousel */}
      <section className="bg-gradient-to-r from-primary/20 via-background to-background relative overflow-hidden py-16 md:py-24">
        <Carousel
          plugins={[plugin.current]}
          className="w-full embla-fade"
          opts={{loop: true}}
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-center md:text-left">
                      <h1 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                        {slide.title}
                      </h1>
                      <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto md:mx-0">
                        {slide.description}
                      </p>
                      <Link href={slide.buttonLink}>
                        <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg transition-transform hover:scale-105">
                          {slide.buttonText}
                        </Button>
                      </Link>
                    </div>
                    <div className="relative h-80 md:h-[450px] group">
                      <div className="absolute inset-0 bg-primary/30 rounded-lg transform -rotate-3 group-hover:rotate-0 transition-transform duration-300"></div>
                      <Image
                        src={slide.imageUrl}
                        alt={slide.imageAlt}
                        data-ai-hint={slide.aiHint}
                        width={600}
                        height={450}
                        className="rounded-lg shadow-2xl object-cover w-full h-full relative transform rotate-1 group-hover:rotate-0 transition-transform duration-300"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our satisfied customers have to say about our products and services.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="bg-background p-6 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Quote className="w-10 h-10 text-primary/30 mb-4" strokeWidth={1.5} />
                <blockquote className="text-foreground/80 text-lg leading-relaxed mb-6">
                  "The best service I have ever received. The technicians were professional and fixed my AC in no time. Their attention to detail and customer care is top-notch. Highly recommended!"
                </blockquote>
              </div>
              <footer className="flex items-center mt-auto">
                <Avatar>
                  <AvatarFallback>RS</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-semibold text-foreground">Rohan Sharma</p>
                  <p className="text-sm text-muted-foreground">Mumbai</p>
                </div>
              </footer>
            </Card>
            <Card className="bg-background p-6 shadow-lg flex flex-col justify-between hover:-translate-y-1 transition-transform">
              <div>
                <Quote className="w-10 h-10 text-primary/30 mb-4" strokeWidth={1.5} />
                <blockquote className="text-foreground/80 text-lg leading-relaxed mb-6">
                  "I bought a second-hand AC and it's working like new. The price was great and the installation team was incredibly efficient and clean. Thank you, Classic-Solution!"
                </blockquote>
              </div>
              <footer className="flex items-center mt-auto">
                <Avatar>
                  <AvatarFallback>PK</AvatarFallback>
                </Avatar>
                <div className="ml-4">
                  <p className="font-semibold text-foreground">Priya K.</p>
                  <p className="text-sm text-muted-foreground">Thane</p>
                </div>
              </footer>
            </Card>
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
