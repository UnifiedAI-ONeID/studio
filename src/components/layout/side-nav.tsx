'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  List,
  Users2,
  UserCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import AvidityLogo from '../logo';

const navItems = [
  { href: '/home', icon: LayoutDashboard, label: 'Home' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/directory', icon: List, label: 'Directory' },
  { href: '/commons', icon: Users2, label: 'Commons' },
  { href: '/profile', icon: UserCircle, label: 'Profile' },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/home" className="flex items-center gap-2 font-semibold">
          <AvidityLogo className="h-8 w-8 text-primary" />
          <span className="font-headline text-xl tracking-tight">Avidity</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              {
                'bg-accent text-accent-foreground': pathname === item.href,
              }
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
