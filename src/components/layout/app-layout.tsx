'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AvidityLogo from '@/components/logo';
import Header from './header';
import SideNav from './side-nav';
import BottomNav from './bottom-nav';
import LandingTopNav from '../landing/landing-top-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, prompted } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';

  useEffect(() => {
    if (!loading) {
      if (user && (isAuthPage || isLandingPage)) {
        // If user is logged in and on an auth page or landing page, redirect to home
        router.replace('/home');
      } else if (!user && !isAuthPage && !isLandingPage && !prompted) {
        // If user is not logged in and not on a public page, redirect to landing
         router.replace('/');
      }
    }
  }, [user, loading, router, isAuthPage, isLandingPage, prompted]);

  if (isLandingPage && !user) {
    return (
       <>
        <LandingTopNav />
        <main>{children}</main>
      </>
    )
  }

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        {children}
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AvidityLogo className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading Avidity...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 dark:bg-black">
      <div className="flex flex-1">
        <SideNav />
        <div className="flex flex-1 flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
