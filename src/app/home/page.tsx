'use client';

import { useAuth, useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import { collection, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { format, startOfToday, endOfToday, startOfWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getFollowedVenueIds } from '@/lib/firebase/firestore';
import { useEffect, useState, useMemo } from 'react';
import RecommendedEvents from '@/components/ai/recommended-events';
import RecommendedDirectory from '@/components/ai/recommended-directory';
import PlaceHolderImages from '@/lib/placeholder-images';

function getPriceDisplay(event: Event) {
  if (event.priceType === 'free') return 'Free';
  if (event.priceType === 'donation') return 'Donation';
  if (event.priceMin) {
    return `$${event.priceMin}${event.priceMax && event.priceMax > event.priceMin ? ` - $${event.priceMax}`: ''}`;
  }
  return 'Paid';
}

function EventCard({ event }: { event: Event }) {
    const placeholder = PlaceHolderImages.find(p => p.id.includes('event')) || PlaceHolderImages[0];
  return (
    <Link href={`/events/${event.id}`} key={event.id}>
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-40 w-full">
          <Image
            src={event.coverImageUrl || placeholder.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            data-ai-hint={placeholder.imageHint}
          />
          <Badge variant="secondary" className="absolute top-2 right-2">{getPriceDisplay(event)}</Badge>
        </div>
        <CardHeader>
          <p className="text-sm font-medium text-primary">{event.category.toUpperCase()}</p>
          <CardTitle className="font-headline text-lg line-clamp-2">{event.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-semibold">{format((event.startTime as Timestamp).toDate(), "E, MMM d '·' h:mm a")}</p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-4 w-4" />
            <span>{event.neighborhood || 'TBA'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}


function EventSection({ title, events, loading }: { title: string; events: Event[] | undefined; loading: boolean }) {
  if (loading) {
    return (
      <section>
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">{title}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </section>
    );
  }

  if (!events || events.length === 0) {
    return null; // Don't show the section if there are no events
  }

  return (
    <section>
      <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {events.map(event => <EventCard key={event.id} event={event} />)}
      </div>
    </section>
  );
}

function FollowedVenuesEvents() {
    const { user } = useAuth();
    const [followedVenueIds, setFollowedVenueIds] = useState<string[] | null>(null);
    const [loadingIds, setLoadingIds] = useState(true);

    useEffect(() => {
        if (user) {
            getFollowedVenueIds(user.uid).then(ids => {
                setFollowedVenueIds(ids);
                setLoadingIds(false);
            });
        } else {
            setLoadingIds(false);
        }
    }, [user]);

    const eventsQuery = useMemoFirebase(() => 
        (user && followedVenueIds && followedVenueIds.length > 0)
        ? query(
            collection(firestore, 'events'),
            where('status', '==', 'published'),
            where('visibility', '==', 'public'),
            where('venueId', 'in', followedVenueIds),
            where('startTime', '>=', Timestamp.now()),
            orderBy('startTime', 'asc'),
            limit(4)
          )
        : null
    , [user, followedVenueIds]);

    const { data: events, loading: eventsLoading } = useCollection<Event>(eventsQuery);
    
    if (!user || loadingIds || (followedVenueIds && followedVenueIds.length === 0)) {
        return null;
    }

    return (
        <EventSection title="From Places You Follow" events={events} loading={loadingIds || eventsLoading} />
    )
}


export default function HomePage() {
  const { user } = useAuth();

  // Query for Today's Events
  const todayQuery = useMemo(() => {
      const todayStart = Timestamp.fromDate(startOfToday());
      const todayEnd = Timestamp.fromDate(endOfToday());
      return query(
        collection(firestore, 'events'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        where('startTime', '>=', todayStart),
        where('startTime', '<=', todayEnd),
        orderBy('startTime', 'asc')
      );
  }, []);
  const { data: todayEvents, loading: todayLoading } = useCollection<Event>(todayQuery);


  // Query for This Weekend's Events
  const weekendQuery = useMemo(() => {
      const now = new Date();
      const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday
      const friday = new Date(startOfThisWeek);
      friday.setDate(startOfThisWeek.getDate() + 4);
      friday.setHours(0, 0, 0, 0);

      const sunday = new Date(startOfThisWeek);
      sunday.setDate(startOfThisWeek.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);
      
      return query(
        collection(firestore, 'events'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        where('startTime', '>=', Timestamp.fromDate(friday)),
        where('startTime', '<=', Timestamp.fromDate(sunday)),
        orderBy('startTime', 'asc')
      );
  }, []);
  const { data: weekendEvents, loading: weekendLoading } = useCollection<Event>(weekendQuery);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Welcome, {user?.displayName || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here’s what’s happening in your community.
        </p>
      </div>
      
      {user && (
        <>
          <RecommendedEvents />
          <RecommendedDirectory />
        </>
      )}
      <FollowedVenuesEvents />
      <EventSection title="Happening Today" events={todayEvents} loading={todayLoading} />
      <EventSection title="This Weekend" events={weekendEvents} loading={weekendLoading} />
    </div>
  );
}
