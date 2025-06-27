
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, BellRing, PackageCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
  return (
    <div className="bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Shipping & Delivery Policy</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Information on how we deliver our services to you.
                </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Truck className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">Service Delivery, Not Shipping</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed">
                        <p>
                            At Classic-Solution, we specialize in providing expert AC services and installations. As such, we do not ship physical products in the traditional sense. Our "delivery" is the timely and professional arrival of our certified technicians at your specified location to perform the service you have booked.
                        </p>
                    </CardContent>
                </Card>
                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <BellRing className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">Appointment Confirmation & Notification</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed space-y-3">
                        <p>
                            Once you book a service with us, you will receive an immediate confirmation of your appointment details via email. Our system is designed to keep you informed every step of the way.
                        </p>
                         <p>
                            On the day of your scheduled service, you will be notified via SMS and/or email to confirm the dispatch of our technician and provide an estimated time of arrival. This ensures you are prepared for our visit and minimizes any disruption to your day.
                        </p>
                    </CardContent>
                </Card>
                 <Card className="shadow-lg">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <PackageCheck className="w-8 h-8 text-primary" />
                        <CardTitle className="font-headline text-2xl">Product Purchases</CardTitle>
                    </CardHeader>
                    <CardContent className="text-foreground/80 leading-relaxed">
                        <p>
                            For purchases of AC units made through our platform, delivery and installation are typically scheduled together as a single service appointment. The details of the delivery and installation schedule will be confirmed with you by our team after your purchase is complete. We handle the logistics to ensure your new unit arrives safely and is installed correctly by our professionals.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
