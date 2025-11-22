'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, UserCircle, Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { signOut } from '@/lib/firebase/auth';
import AvidityLogo from '../logo';
import { Input } from '../ui/input';

const getTitleFromPathname = (pathname: string) => {
  if (pathname === '/home') return 'Home';
  if (pathname.startsWith('/events/')) return 'Event';
  if (pathname.startsWith('/directory/')) return 'Venue';
  if (pathname.startsWith('/commons/')) return 'Commons';
  const title = pathname.split('/').pop();
  return title ? title.charAt(0).toUpperCase() + title.slice(1) : 'Dashboard';
};

export default function Header() {
  const { user } = useAuth();
  const pathname = usePathname();
  const pageTitle = getTitleFromPathname(pathname);

  const handleSignOut = async () => {
    await signOut();
    // The AuthProvider will handle redirecting to /login
  };

  const userInitial = user?.displayName?.charAt(0).toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-4">
        <Link href="/home" className="md:hidden">
          <AvidityLogo className="h-8 w-8 text-primary" />
          <span className="sr-only">Home</span>
        </Link>
        <div className="relative hidden md:block">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
           <Input placeholder="Search..." className="pl-10 w-64 bg-gray-100 dark:bg-card border-none" />
        </div>
      </div>

      <h1 className="font-headline text-xl font-semibold absolute left-1/2 -translate-x-1/2 hidden md:block">
        {pageTitle}
      </h1>
      
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-6 w-6"/>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                <AvatarFallback>{userInitial}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.displayName}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/profile" passHref>
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
