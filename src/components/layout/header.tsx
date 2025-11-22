'use client';

import Link from 'next/link';
import { LogOut, UserCircle, Search } from 'lucide-react';
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
import { Input } from '../ui/input';
import { useState } from 'react';
import GlobalSearch from '../search/global-search';
import { SidebarTrigger } from '../ui/sidebar';

export default function Header() {
  const { user } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    // The AuthProvider will handle redirecting to /
  };

  const userInitial = user?.displayName?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
           <SidebarTrigger className="md:hidden"/>
            <div className="relative hidden md:block">
                <button onClick={() => setIsSearchOpen(true)} className="w-full text-left">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search..." 
                    className="pl-10 w-64 lg:w-96 bg-gray-100 dark:bg-card border-none pointer-events-none" 
                />
                </button>
            </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(true)}>
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
      <GlobalSearch isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
}
