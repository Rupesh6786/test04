
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, PackageCheck, BellRing, MapPin } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Shipping & Delivery Policy</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Information on how we deliver our products and services to your doorstep.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Truck className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">Our Delivery Approach</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed">
                        <p>
                            At Classic-Solution, we provide both physical products (new and used AC units) and on-site expert services. Our delivery process is designed to be seamless and convenient, whether you're purchasing an AC or booking a repair.
                        </p>
                    </CardContent>
                </Card>

                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <PackageCheck className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">Product Delivery & Installation</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed space-y-3">
                        <p>
                           When you purchase an AC unit from us, we don't just ship a box. We deliver a complete cooling solution. The delivery of your AC unit is scheduled together with its professional installation.
                        </p>
                         <p>
                           Our team will contact you after your purchase is confirmed to arrange a convenient date and time for both the delivery and installation. This ensures your unit arrives safely and is set up for optimal performance by our certified technicians.
                        </p>
                    </CardContent>
                </Card>

                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <BellRing className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">On-Site Service Delivery</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed space-y-3">
                        <p>
                           For services such as repairs, maintenance, or gas charging, our "delivery" is the timely arrival of our technician at your location.
                        </p>
                        <p>
                           On the day of your scheduled service, you will receive notifications via SMS and/or email to confirm the technician's dispatch and provide an estimated time of arrival, ensuring a smooth and predictable service experience.
                        </p>
                    </CardContent>
                </Card>
                
                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <MapPin className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">Delivery Area & Charges</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed">
                        <p>
                            We currently operate within Mumbai and surrounding areas. Any potential delivery or transportation charges associated with product purchase or service will be clearly communicated to you during the checkout or booking process. We believe in full transparency with no hidden costs.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
