'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import AvidityLogo from '@/components/logo';
import Header from './header';
import SideNav from './side-nav';
import BottomNav from './bottom-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.replace('/login');
    }
  }, [user, loading, router, isAuthPage]);

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
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
    <div className="flex min-h-screen w-full flex-col bg-background">
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
