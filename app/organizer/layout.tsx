'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSession from '@/hooks/useSession';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSideBarOrganizer from '@/components/Organizer/AppSideBarOrganizer';

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useSession();

  useEffect(() => {
    console.log('Organizer Layout - isLoading:', isLoading, 'user:', user);
    
    if (!isLoading) {
      if (!user) {
        // User is not logged in, redirect to login
        console.log('Organizer Layout - No user, redirecting to login');
        router.push('/login?callbackUrl=' + encodeURIComponent(window.location.pathname));
        return;
      }
      
      console.log('Organizer Layout - User role:', user.role, 'Expected: ORGANIZER');
      
      // Check if user has organizer role - using userType from schema
      if (user.role !== 'ORGANIZER') {
        // User is not an organizer, redirect to home
        console.log('Organizer Layout - User is not ORGANIZER, redirecting to home');
        router.push('/');
        return;
      }
      
      console.log('Organizer Layout - User is ORGANIZER, allowing access');
    }
  }, [user, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show loading if no user or wrong role (while redirecting)
  if (!user || user.role !== 'ORGANIZER') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSideBarOrganizer />
      <main className="w-full p-6">
        {children}
      </main>
    </SidebarProvider>
  );
}