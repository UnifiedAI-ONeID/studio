
'use client';

import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { useCollection } from '@/firebase/firestore/use-doc-and-collection-hooks';
import { useMemoFirebase } from '@/hooks/use-memo-firebase';
import PlaceHolderImages from '@/lib/placeholder-images';

function FeaturedEventCard({ event, large = false }: { event: Event; large?: boolean }) {
    const placeholder = PlaceHolderImages.find(p => p.id.includes('event')) || PlaceHolderImages[0];
    if (!event.startTime) return null;
  return (
    <Link href={`/events/${event.id}`} className={`group relative block overflow-hidden rounded-3xl ${large ? 'col-span-2' : ''}`}>
      <div className={`aspect-square w-full ${large ? 'md:aspect-[2/1]' : ''}`}>
        <Image
          src={event.coverImageUrl || placeholder.imageUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint={placeholder.imageHint}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4 md:p-6 text-white">
        <p className="text-sm font-medium">{format(event.startTime.toDate(), 'eee, MMM d')}</p>
        <h3 className="font-headline text-lg md:text-xl font-semibold">{event.title}</h3>
      </div>
    </Link>
  );
}


function GridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Skeleton className="col-span-2 aspect-video h-full w-full rounded-3xl" />
            <Skeleton className="aspect-square h-full w-full rounded-3xl" />
            <Skeleton className="aspect-square h-full w-full rounded-3xl" />
        </div>
    )
}

export default function FeaturedEventsGrid() {
  const eventsQuery = useMemoFirebase(() => query(
    collection(firestore, 'events'),
    where('isFeaturedOnLanding', '==', true),
    where('status', '==', 'published'),
    where('visibility', '==', 'public'),
    orderBy('priorityScore', 'desc'),
    orderBy('startTime', 'asc'),
    limit(3)
  ), []);

  const { data: events, loading } = useCollection<Event>(eventsQuery);

  if (loading) return <GridSkeleton />;
  if (!events || events.length < 3) return null;

  return (
    <div className="grid grid-cols-2 gap-4">
        <FeaturedEventCard event={events[0]} large />
        <FeaturedEventCard event={events[1]} />
        <FeaturedEventCard event={events[2]} />
    </div>
  );
}
