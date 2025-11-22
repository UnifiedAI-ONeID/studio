
import { WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-center px-4">
      <WifiOff className="w-24 h-24 text-muted-foreground mb-6" />
      <h1 className="text-4xl font-headline font-bold mb-2">You're Offline</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        It looks like you've lost your connection. Don't worry, any pages you've already visited should still be available.
      </p>
      <Button asChild>
        <Link href="/">Go to Homepage</Link>
      </Button>
    </div>
  );
}
