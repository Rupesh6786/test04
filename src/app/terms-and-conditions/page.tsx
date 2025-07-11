
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gavel, IndianRupee, Handshake, CalendarClock, ShieldAlert, Shield } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Terms and Conditions</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Please read our terms carefully before using our services. Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Handshake className="w-8 h-8 text-primary"/>
                    <CardTitle className="font-headline text-2xl">1. Booking Agreement</CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/80 space-y-3">
                    <p>By booking a service or purchasing a product from Classic-Solution ("we", "us", "our"), you ("the customer", "you") agree to be bound by these Terms and Conditions. These terms constitute a legally binding agreement between you and Classic-Solution.</p>
                    <p>All services are subject to availability. We reserve the right to refuse service to anyone for any reason at any time.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <IndianRupee className="w-8 h-8 text-primary"/>
                    <CardTitle className="font-headline text-2xl">2. Payments and Charges</CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/80 space-y-3">
                    <p>All prices for services and products are listed in Indian Rupees (INR). Payment is due at the time of booking or purchase, as indicated on the service or product page. We use Razorpay as our secure third-party payment gateway.</p>
                    <p>You are responsible for providing accurate payment information. Any additional charges incurred during the service (e.g., for extra parts or unforeseen complexities) must be settled upon completion of the service.</p>
                </CardContent>
            </Card>

             <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <CalendarClock className="w-8 h-8 text-primary"/>
                    <CardTitle className="font-headline text-2xl">3. Cancellations & Rescheduling</CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/80 space-y-3">
                    <p>You may cancel or reschedule a service appointment. Our cancellation policy, including any applicable fees, is detailed in our Cancellations & Refunds Policy page. We reserve the right to cancel or reschedule appointments due to unforeseen circumstances, in which case we will notify you as soon as possible and offer a full refund or a new appointment time.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <ShieldAlert className="w-8 h-8 text-primary"/>
                    <CardTitle className="font-headline text-2xl">4. Limitation of Liability</CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/80 space-y-3">
                    <p>Classic-Solution will perform its services with reasonable skill and care. However, we are not liable for any pre-existing faults or damages to your property or equipment. Our liability for any claim arising out of our services is limited to the amount paid for that service.</p>
                     <p>We are not responsible for indirect, incidental, or consequential damages.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Gavel className="w-8 h-8 text-primary"/>
                    <CardTitle className="font-headline text-2xl">5. Governing Law and Jurisdiction</CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/80 space-y-3">
                    <p>These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Shield className="w-8 h-8 text-primary"/>
                    <CardTitle className="font-headline text-2xl">6. Privacy and Shipping Policies</CardTitle>
                </CardHeader>
                <CardContent className="text-foreground/80 space-y-3">
                    <p>Your privacy is important to us. Our data handling practices are detailed in our Privacy Policy. Our product delivery and service fulfillment processes are covered by our Shipping Policy.</p>
                    <ul className="list-disc list-inside space-y-2 pl-4">
                        <li>
                            <Link href="https://merchant.razorpay.com/policy/QiaxVKBcuDFX3k/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Read our full Privacy Policy
                            </Link>
                        </li>
                        <li>
                             <Link href="https://merchant.razorpay.com/policy/QiaxVKBcuDFX3k/shipping" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Read our full Shipping Policy
                            </Link>
                        </li>
                    </ul>
                </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
