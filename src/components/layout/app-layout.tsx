
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FirebaseClientProvider } from '@/firebase/provider';
import { useAuth } from '@/hooks/use-auth';

import AvidityLogo from '@/components/logo';
import Header from './header';
import BottomNav from './bottom-nav';
import LandingTopNav from '../landing/landing-top-nav';
import { Toaster } from '../ui/toaster';
import FirebaseErrorListener from '../FirebaseErrorListener';
import {
  Sidebar,
  SidebarProvider,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarInset
} from '@/components/ui/sidebar';
import {
  Home,
  Calendar,
  Building,
  MessageSquare,
  User,
  Settings,
  Database,
} from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';


const topNavItems = [
  { href: '/home', icon: Home, label: 'Home' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/directory', icon: Building, label: 'Directory' },
  { href: '/commons', icon: MessageSquare, label: 'Commons' },
];

const bottomNavItems = [
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';
  const isSeedPage = pathname === '/seed';

  React.useEffect(() => {
      if (!loading && !user && !isAuthPage && !isLandingPage && !isSeedPage) {
        router.push('/');
      }
      if (!loading && user && (isAuthPage || isLandingPage)) {
          router.push('/home');
      }
  }, [user, loading, pathname, isAuthPage, isLandingPage, isSeedPage, router]);


  if (loading) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AvidityLogo className="h-12 w-12 animate-pulse text-primary" />
          <p className="text-muted-foreground">Loading Avidity...</p>
        </div>
      </div>
    );
  }

  if (!user && (isLandingPage || isSeedPage)) {
     return <LandingTopNavAndMain>{children}</LandingTopNavAndMain>
  }
  
  if (isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        {children}
      </div>
    );
  }
  
  if(user) {
    return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
  }

  // Fallback for non-authed users on non-public pages, should be redirected by useEffect
  return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <AvidityLogo className="h-12 w-12 animate-pulse text-primary" />
        </div>
      </div>
  );
}

const LandingTopNavAndMain = ({ children }: { children: React.ReactNode }) => {
    return (
      <>
        <LandingTopNav />
        <main>{children}</main>
      </>
    );
}


const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <AvidityLogo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl tracking-tight">Avidity</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {topNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
           <SidebarMenu>
            <SidebarSeparator/>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/seed')}>
                  <Link href="/seed">
                    <Database />
                    <span>Seed Database</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            {bottomNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6 lg:p-8">
          {children}
        </main>
        <BottomNav />
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {

  return (
    <FirebaseClientProvider>
      <LayoutContent>{children}</LayoutContent>
      <Toaster />
      <FirebaseErrorListener />
    </FirebaseClientProvider>
  );
}
