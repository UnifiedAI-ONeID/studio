'use client';

import Link from 'next/link';
import type { Venue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { followTarget } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function VenueCard({ venue }: { venue: Venue }) {
    const { user, setPrompted } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleFollow = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        if (!user) {
            if (setPrompted) setPrompted(true);
            const continueUrl = `/directory/${venue.id}`;
            router.push(`/login?continueUrl=${encodeURIComponent(continueUrl)}`);
        } else {
            try {
                await followTarget(user.id, venue.id, 'venue');
                toast({ title: `You are now following ${venue.name}` });
            } catch (error) {
                toast({ variant: 'destructive', title: "Something went wrong" });
            }
        }
    };
    
  return (
    <Link href={`/directory/${venue.id}`} className="group">
      <div className="flex flex-col h-full rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex-grow">
          <h4 className="font-headline font-semibold text-slate-800 group-hover:text-primary">{venue.name}</h4>
          <p className="text-sm text-slate-500 capitalize">{venue.categories.join(', ')}</p>
          <p className="mt-2 text-sm text-slate-600">{venue.homepageTagline}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">
              {venue.priceLevel && (
                  <>
                    {'$'.repeat(venue.priceLevel)}
                    <span className="text-slate-300">{'$'.repeat(4 - venue.priceLevel)}</span>
                  </>
              )}
          </div>
          <Button variant="outline" size="sm" onClick={handleFollow}>
            <Plus className="mr-1.5 h-4 w-4" /> Follow
          </Button>
        </div>
      </div>
    </Link>
  );
}
