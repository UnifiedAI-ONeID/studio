'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';
import EventCard from './event-card';
import { startOfWeek, endOfWeek } from 'date-fns';
import { useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';

function SectionSkeleton() {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
         <div key={i} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <Skeleton className="aspect-[16/9] w-full" />
            <div className="p-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="mt-2 h-5 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
            </div>
         </div>
      ))}
    </div>
  );
}

export default function ThisWeekendSection() {
  const eventsQuery = useMemoFirebase(() => {
    const now = new Date();
    // Get Friday of the current week
    const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
    const friday = new Date(start);
    friday.setDate(start.getDate() + 4);
    friday.setHours(0,0,0,0);
    // Get Sunday of the current week
    const sunday = endOfWeek(now, { weekStartsOn: 1 });
    
    return query(
      collection(firestore, 'events'),
      where('status', '==', 'published'),
      where('visibility', '==', 'public'),
      where('city', '==', 'Taipei'),
      where('startTime', '>=', Timestamp.fromDate(friday)),
      where('startTime', '<=', Timestamp.fromDate(sunday)),
      orderBy('startTime', 'asc'),
      limit(3)
    );
  }, []);

  const { data: events, loading } = useCollection<Event>(eventsQuery);


  return (
    <section id="events" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-800">
            Happening This Weekend
          </h2>
          <Button variant="link" asChild>
            <Link href="/events">
              View all events <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
        {loading ? (
            <SectionSkeleton />
        ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events?.map(event => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        )}
      </div>
    </section>
  );
}
