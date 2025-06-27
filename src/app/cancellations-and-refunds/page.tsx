
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarX2, WalletMinimal, Clock, CheckCircle } from 'lucide-react';

export default function CancellationsAndRefundsPage() {
  return (
    <div className="bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="font-headline text-3xl sm:text-4xl font-semibold text-foreground mb-2">Cancellations & Refunds Policy</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our policies for cancelling service appointments and processing refunds.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                    <CalendarX2 className="w-8 h-8 text-destructive" />
                    <CardTitle className="font-headline text-2xl">Cancellation Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-semibold text-foreground mb-1">Free Cancellation</h3>
                        <p className="text-foreground/80">
                            You can cancel your service appointment free of charge if the cancellation is made at least <span className="font-bold text-green-600">12 hours</span> before the scheduled appointment time.
                        </p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-foreground mb-1">Late Cancellation</h3>
                        <p className="text-foreground/80">
                            If a cancellation is made within 12 hours of the scheduled appointment, a convenience fee may be applied to cover our technician's allocation and travel costs.
                        </p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-foreground mb-1">How to Cancel</h3>
                        <p className="text-foreground/80">
                            You can cancel your appointment through your 'My Account' page or by contacting our customer support team directly.
                        </p>
                    </div>
                </CardContent>
            </Card>
            <Card className="shadow-lg">
                <CardHeader className="flex flex-row items-center gap-4">
                    <WalletMinimal className="w-8 h-8 text-primary" />
                    <CardTitle className="font-headline text-2xl">Refund Policy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div>
                        <h3 className="font-semibold text-foreground mb-1">Eligibility for Full Refund</h3>
                        <p className="text-foreground/80">
                            A full refund will be processed in the following cases:
                        </p>
                         <ul className="list-disc list-inside text-foreground/80 mt-2 space-y-1">
                            <li>You cancel your appointment at least 12 hours in advance.</li>
                            <li>Classic-Solution cancels the appointment due to unforeseen circumstances.</li>
                            <li>A service is paid for but cannot be delivered due to technical reasons from our end.</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Refund Timeline</h3>
                        <p className="text-foreground/80">
                            Eligible refunds will be credited back to your original mode of payment within <span className="font-bold text-accent">1-3 working days</span>.
                        </p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Non-Refundable Situations</h3>
                        <p className="text-foreground/80">
                            Partial or no refunds may be applicable for services that have already been partially or fully rendered, or for late cancellations as specified in our policy.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
