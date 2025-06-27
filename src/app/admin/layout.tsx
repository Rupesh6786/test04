
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Loader2, Menu as MenuIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const { currentUser, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        router.push('/'); 
      } else if (!isAdmin) {
        router.push('/'); 
      }
    }
  }, [currentUser, isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">Access Denied. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar 
        isMobileOpen={isMobileSidebarOpen} 
        setMobileOpen={setIsMobileSidebarOpen} 
      />
      <div className="flex flex-col flex-1">
        
        <header className="sticky top-0 z-30 flex items-center justify-between md:hidden h-16 px-4 border-b bg-card">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden mr-2"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-semibold text-primary">Admin Panel</h1>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
       {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
