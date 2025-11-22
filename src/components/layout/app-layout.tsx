'use client';

import React, { createContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, getUserProfile } from '@/lib/firebase';
import { AppUser } from '@/lib/types';
import { AuthContext, useAuth } from '@/hooks/use-auth';

import AvidityLogo from '@/components/logo';
import Header from './header';
import BottomNav from './bottom-nav';
import LandingTopNav from '../landing/landing-top-nav';
import { Toaster } from '../ui/toaster';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Calendar,
  List,
  Users2,
  UserCircle,
  Settings,
  Database,
} from 'lucide-react';
import Link from 'next/link';


const topNavItems = [
  { href: '/home', icon: LayoutDashboard, label: 'Home' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/directory', icon: List, label: 'Directory' },
  { href: '/commons', icon: Users2, label: 'Commons' },
];

const bottomNavItems = [
  { href: '/profile', icon: UserCircle, label: 'Profile' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isLandingPage = pathname === '/';
  const isSeedPage = pathname === '/seed';


  useEffect(() => {
    if (loading) return;

    if (user && (isAuthPage || isLandingPage)) {
      router.replace('/home');
    } else if (!user && !isAuthPage && !isLandingPage && !isSeedPage) {
      router.replace('/');
    }
  }, [user, loading, router, pathname, isAuthPage, isLandingPage, isSeedPage]);


  if (isLandingPage && !user) {
    return (
      <>
        <LandingTopNav />
        <main>{children}</main>
      </>
    );
  }

  if (isAuthPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        {children}
      </div>
    );
  }
  
  if (isSeedPage) {
    return <main>{children}</main>;
  }


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
  
  if (!user) {
      return null;
  }

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
                  isActive={
                    (pathname.startsWith(item.href) && item.href !== '/home') ||
                    (pathname === '/home' && item.href === '/home')
                  }
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
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser | null>(null);
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [prompted, setPrompted] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            setFirebaseUser(fbUser);
            if (fbUser) {
                const userProfile = await getUserProfile(fbUser.uid);
                setUser(userProfile);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, prompted, setPrompted }}>
      <LayoutContent>{children}</LayoutContent>
      <Toaster />
    </AuthContext.Provider>
  );
}

    