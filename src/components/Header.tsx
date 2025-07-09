"use client";

import Link from 'next/link';
import { AirVent, Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './ThemeToggle';
import { Separator } from './ui/separator';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/services', label: 'Services' },
  { href: '/media', label: 'Media' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/locate-store', label: 'Locate a Store' },
];

export function Header() {
  const { isLoggedIn, logout, openAuthModal } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
              <AirVent size={32} />
              <span className="font-headline text-2xl font-semibold">Classic-Solution</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link key={item.label} href={item.href} className="font-medium text-foreground hover:text-primary transition-colors">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                <Link href="/my-account">
                  <Button variant="outline">My Account</Button>
                </Link>
                <Button onClick={logout}>Logout</Button>
              </>
            ) : (
              <Button onClick={() => openAuthModal('login')}>Login</Button>
            )}
            <ThemeToggle />
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Toggle menu">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-20 left-0 right-0 bg-card shadow-lg transition-all duration-300 ease-in-out overflow-hidden",
          isMobileMenuOpen ? "max-h-screen opacity-100 py-4" : "max-h-0 opacity-0 py-0"
        )}
      >
        <nav className="flex flex-col items-center space-y-4 px-4">
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} className="block w-full text-center py-2 font-medium text-foreground hover:text-primary transition-colors" onClick={toggleMobileMenu}>
              {item.label}
            </Link>
          ))}
          <Separator className="w-1/2"/>
          <div className="flex flex-col items-center space-y-3 pt-4 w-full">
             {isLoggedIn ? (
              <>
                <Link href="/my-account" className="w-full">
                  <Button variant="outline" className="w-full" onClick={toggleMobileMenu}>My Account</Button>
                </Link>
                <Button onClick={() => { logout(); toggleMobileMenu(); }} className="w-full">Logout</Button>
              </>
            ) : (
              <Button onClick={() => { openAuthModal('login'); toggleMobileMenu(); }} className="w-full">Login</Button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
