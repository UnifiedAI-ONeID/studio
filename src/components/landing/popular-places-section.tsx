'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import type { Venue } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import VenueCard from './venue-card';

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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  const venuesQuery = useMemo(() => query(
    collection(firestore, 'venues'),
    where('isFeaturedOnLanding', '==', true),
    where('verified', '==', true),
    limit(6)
  ), []);

  useEffect(() => {
    const unsubscribe = onSnapshot(venuesQuery, (snapshot) => {
      setVenues(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venue)));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching popular places:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [venuesQuery]);


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
