'use client';

import Link from 'next/link';
import { MapPin, ChevronDown } from 'lucide-react';
import AvidityLogo from '@/components/logo';
import { Button } from '@/components/ui/button';

export default function LandingTopNav() {
  const navLinks = [
    { name: 'Events', href: '#events' },
    { name: 'Places', href: '#places' },
    { name: 'Community', href: '#community' },
  ];
  
  const scrollTo = (id:string) => (e:React.MouseEvent) => {
    e.preventDefault();
    document.getElementById(id.substring(1))?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-white/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <AvidityLogo className="h-8 w-8 text-primary" />
            <span className="font-headline text-xl font-bold tracking-tight text-slate-800">
              Avidity
            </span>
          </Link>
          <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 md:flex">
            <MapPin className="h-4 w-4" />
            <span>San Francisco</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </div>
        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Button key={link.name} variant="ghost" asChild className="text-slate-700" onClick={scrollTo(link.href)}>
              <Link href={link.href}>{link.name}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden text-slate-700 sm:block">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild className="rounded-full">
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
