
'use client';

import { useAuth, useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import { collection, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import type { Event, Follow } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { format, startOfToday, endOfToday, startOfWeek, endOfWeek } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RecommendedEvents from '@/components/ai/recommended-events';
import RecommendedDirectory from '@/components/ai/recommended-directory';
import PlaceHolderImages from '@/lib/placeholder-images';

function getPriceDisplay(event: Event) {
  if (event.priceType === 'free') return 'Free';
  if (event.priceType === 'donation') return 'Donation';
  if (event.minPrice) {
    return `$${event.minPrice}${event.maxPrice && event.maxPrice > event.minPrice ? ` - $${event.maxPrice}`: ''}`;
  }
  return 'Paid';
}

function EventCard({ event }: { event: Event }) {
    const placeholder = PlaceHolderImages.find(p => p.id.includes('event')) || PlaceHolderImages[0];
  return (
    <Link href={`/events/${event.id}`} key={event.id}>
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-40 w-full">
          {event.coverImageUrl && (
            <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                className="object-cover"
                data-ai-hint={placeholder.imageHint}
            />
          )}
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
            <span>{event.location?.neighborhood || event.city}</span>
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
    return null; 
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
    
    const followsQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'follows'), where('followerUserId', '==', user.id), where('targetType', '==', 'venue')) : null
    , [user]);
    const { data: follows, loading: followsLoading } = useCollection<Follow>(followsQuery);

    const followedVenueIds = useMemoFirebase(() => {
        if (!follows) return null;
        return follows.map(f => f.targetId);
    }, [follows]);

    const eventsQuery = useMemoFirebase(() => 
        (user && followedVenueIds && followedVenueIds.length > 0)
        ? query(
            collection(firestore, 'events'),
            where('status', '==', 'published'),
            where('visibility', '==', 'public'),
            where('location.venueId', 'in', followedVenueIds),
            where('startTime', '>=', Timestamp.now()),
            orderBy('startTime', 'asc'),
            limit(4)
          )
        : null
    , [user, followedVenueIds]);

    const { data: events, loading: eventsLoading } = useCollection<Event>(eventsQuery);
    
    if (!user || ( !followsLoading && (!followedVenueIds || followedVenueIds.length === 0) )) {
        return null;
    }

    return (
        <EventSection title="From Places You Follow" events={events} loading={followsLoading || eventsLoading} />
    )
}


export default function HomePage() {
  const { user } = useAuth();

  const todayQuery = useMemoFirebase(() => {
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

  const weekendQuery = useMemoFirebase(() => {
      const now = new Date();
      const weekendStart = startOfWeek(now, { weekStartsOn: 1 });
      weekendStart.setDate(weekendStart.getDate() + 4); // Friday
      const weekendEnd = endOfWeek(now, { weekStartsOn: 1 });

      return query(
        collection(firestore, 'events'),
        where('status', '==', 'published'),
        where('visibility', '==', 'public'),
        where('startTime', '>=', Timestamp.fromDate(weekendStart)),
        where('startTime', '<=', Timestamp.fromDate(weekendEnd)),
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
