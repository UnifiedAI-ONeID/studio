
'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Venue } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import VenueCard from './venue-card';
import { useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';

function SectionSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default function PopularPlacesSection() {
  const venuesQuery = useMemoFirebase(() => query(
    collection(firestore, 'venues'),
    where('isFeaturedOnLanding', '==', true),
    orderBy('name', 'asc'),
    limit(6)
  ), []);

  const { data: venues, loading } = useCollection<Venue>(venuesQuery);


  return (
    <section id="places" className="bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-800">
            Popular places & venues
          </h2>
          <Button variant="link" asChild>
            <Link href="/directory">
              Browse all places <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
        {loading ? (
            <SectionSkeleton />
        ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {venues?.map(venue => (
                <VenueCard key={venue.id} venue={venue} />
            ))}
            </div>
        )}
      </div>
    </section>
  );
}
