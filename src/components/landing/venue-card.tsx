'use client';

import Link from 'next/link';
import type { Venue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';

export default function VenueCard({ venue }: { venue: Venue }) {
    const { user, setPrompted } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const handleFollow = () => {
        if (!user) {
            setPrompted(true);
            const continueUrl = `/directory/${venue.id}`;
            router.push(`/login?continueUrl=${encodeURIComponent(continueUrl)}`);
        } else {
            // Logic to follow venue for logged in user
            console.log('Following venue', venue.id);
        }
    };
    
  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/directory/${venue.id}`} className="flex-grow">
        <h4 className="font-headline font-semibold text-slate-800 group-hover:text-primary">{venue.name}</h4>
        <p className="text-sm text-slate-500 capitalize">{venue.type}</p>
        <p className="mt-2 text-sm text-slate-600">{venue.neighborhood}</p>
      </Link>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-500">
            {'$'.repeat(venue.priceLevel)}
            <span className="text-slate-300">{'$'.repeat(4-venue.priceLevel)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleFollow}>
          <Plus className="mr-1.5" /> Follow
        </Button>
      </div>
    </div>
  );
}
