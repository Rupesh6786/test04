
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

// A simple inline SVG for Google icon
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const { loginUser, registerUser, signInWithGoogle, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'login' | 'register'>(initialView);
  const [showResetForm, setShowResetForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    if (!email || !password) {
        toast({ title: "Missing Fields", description: "Please enter both email and password.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }

    try {
      await loginUser(email, password);
    } catch (error) {
      console.error('Login submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password || !confirmPassword) {
        toast({ title: "Missing Fields", description: "Please fill out all registration fields.", variant: "destructive"});
        setIsSubmitting(false);
        return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Registration Failed', description: 'Passwords do not match.', variant: 'destructive' });
      setIsSubmitting(false);
      return;
    }

    try {
      await registerUser(email, password, name);
    } catch (error) {
      console.error('Registration submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Google Sign-In submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordResetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('reset-email') as string;

    if (!email) {
      toast({ title: "Email Required", description: "Please enter your email address.", variant: "destructive"});
      setIsSubmitting(false);
      return;
    }

    try {
        await sendPasswordReset(email);
        setShowResetForm(false); // Go back to login form after sending
    } catch (error) {
        console.error('Password reset submission error:', error);
    } finally {
        setIsSubmitting(false);
    }
  };

  const title = showResetForm ? 'Reset Password' : (currentView === 'login' ? 'Login' : 'Register');
  const description = showResetForm 
    ? "Enter your email to receive a password reset link."
    : (currentView === 'login' ? "Access your account to manage bookings and view offers." : "Create an account to get started.");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onClose();
          setShowResetForm(false);
        }
    }}>
      <DialogContent className="sm:max-w-[425px] max-h-[90svh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {showResetForm ? (
             <form onSubmit={handlePasswordResetSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" name="reset-email" type="email" placeholder="m@example.com" required disabled={isSubmitting} />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
        ) : (
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as 'login' | 'register')} className="w-full pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login with Email</TabsTrigger>
              <TabsTrigger value="register">Register with Email</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLoginSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" placeholder="m@example.com" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" name="password" type="password" required disabled={isSubmitting} />
                </div>
                 <div className="text-right">
                    <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setShowResetForm(true)}>
                      Forgot Password?
                    </Button>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="register">
              <form onSubmit={handleRegisterSubmit} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name</Label>
                  <Input id="register-name" name="name" placeholder="Your Name" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" name="email" type="email" placeholder="m@example.com" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input id="register-password" name="password" type="password" required disabled={isSubmitting} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password</Label>
                  <Input id="register-confirm-password" name="confirmPassword" type="password" required disabled={isSubmitting} />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register Now'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="relative py-2">
          <Separator />
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isSubmitting}
        >
          <GoogleIcon />
          <span className="ml-2">{isSubmitting ? 'Signing in...' : 'Sign in with Google'}</span>
        </Button>

        <DialogFooter className="sm:justify-start pt-4">
          {showResetForm ? (
            <p className="text-sm text-muted-foreground">
                Remembered your password?{' '}
                <Button variant="link" className="p-0 h-auto" onClick={() => setShowResetForm(false)} disabled={isSubmitting}>
                    Back to Login
                </Button>
            </p>
          ) : currentView === 'login' ? (
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentView('register')} disabled={isSubmitting}>
                Register Now
              </Button>
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" className="p-0 h-auto" onClick={() => setCurrentView('login')} disabled={isSubmitting}>
                Login
              </Button>
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
