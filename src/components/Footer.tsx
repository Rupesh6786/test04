
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, ShieldCheck, Award, Users, MapPin, Twitter } from 'lucide-react';

const QuickLinkItem = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-muted-foreground hover:text-primary transition-colors">
      {children}
    </Link>
  </li>
);

const SocialLinkItem = ({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-muted-foreground hover:text-primary transition-colors">
    <Icon size={24} />
  </a>
);

const TrustBadgeItem = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
    <li className="flex items-center space-x-3 text-muted-foreground">
        <Icon className="h-5 w-5 text-primary" />
        <span>{text}</span>
    </li>
);

export function Footer() {
  const shortAddress = "Plot No.8, Shop NO.4, Dahisar Checknaka";

  return (
    <footer className="bg-card border-t mt-12 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Us */}
          <div>
            <h5 className="font-headline text-lg font-semibold text-foreground mb-4">About Us</h5>
            <p className="text-muted-foreground text-sm">
              Classic-Solution is your trusted partner for quality second-hand ACs and expert services. We aim to provide affordable and reliable cooling solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="font-headline text-lg font-semibold text-foreground mb-4">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <QuickLinkItem href="/products">Products</QuickLinkItem>
              <QuickLinkItem href="/services">Services</QuickLinkItem>
              <QuickLinkItem href="/offers">Offers</QuickLinkItem>
              <QuickLinkItem href="/about">Why Choose Us</QuickLinkItem>
              <QuickLinkItem href="/locate-store">Locate Store</QuickLinkItem>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h5 className="font-headline text-lg font-semibold text-foreground mb-4">Contact Info</h5>
            <address className="not-italic text-sm space-y-1">
              <Link href="/locate-store" className="text-muted-foreground hover:text-primary transition-colors block">
                  <p>{shortAddress},</p>
                  <p>Mumbai-400068</p>
              </Link>
              <p className="pt-1"><a href="tel:+919821806461" className="text-muted-foreground hover:text-primary transition-colors">+91 98218 06461</a></p>
              <p><a href="mailto:classicsolutionofficial@gmail.com" className="text-muted-foreground hover:text-primary transition-colors">classicsolutionofficial@gmail.com</a></p>
            </address>
             <div className="mt-4 flex space-x-4">
              <SocialLinkItem href="https://www.facebook.com/share/1Bka82yYBn/" icon={Facebook} label="Facebook" />
              <SocialLinkItem href="https://www.instagram.com/classic_solution_official/" icon={Instagram} label="Instagram" />
              <SocialLinkItem href="https://www.linkedin.com/in/gulam-mainuddin-khan-79913mk" icon={Linkedin} label="LinkedIn" />
              <SocialLinkItem href="https://x.com/GulamKh31049008" icon={Twitter} label="Twitter" />
            </div>
          </div>

            {/* Our Commitment */}
            <div>
                <h5 className="font-headline text-lg font-semibold text-foreground mb-4">Our Commitment</h5>
                <ul className="space-y-3 text-sm">
                    <TrustBadgeItem icon={ShieldCheck} text="Secure Payments" />
                    <TrustBadgeItem icon={Award} text="Certified Technicians" />
                    <TrustBadgeItem icon={Users} text="Customer Satisfaction" />
                    <TrustBadgeItem icon={MapPin} text="Easy Store Locator" />
                </ul>
            </div>
        </div>

        <div className="mt-12 border-t pt-8 text-center text-sm">
          <p className="text-muted-foreground">&copy; {new Date().getFullYear()} Classic-Solution. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
