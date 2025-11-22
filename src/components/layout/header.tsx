'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, UserCircle, Menu } from 'lucide-react';
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

const getTitleFromPathname = (pathname: string) => {
  if (pathname === '/home') return 'Home';
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end md:px-6">
      <Link href="/home" className="md:hidden">
        <AvidityLogo className="h-8 w-8 text-primary" />
        <span className="sr-only">Home</span>
      </Link>

      <h1 className="font-headline text-xl font-semibold md:absolute md:left-1/2 md:-translate-x-1/2">
        {pageTitle}
      </h1>

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
    </header>
  );
}
