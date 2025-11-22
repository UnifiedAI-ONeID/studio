
'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { collection, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import { useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Plus } from 'lucide-react';
import { format, isToday, isTomorrow, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import PlaceHolderImages from '@/lib/placeholder-images';

const categories = ['Music', 'Food & Drink', 'Talks', 'Sports', 'Arts', 'Networking', 'Other'];
const dateFilters = ['All', 'Today', 'Tomorrow', 'This weekend'];

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardHeader>
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-3/4 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardContent>
    </Card>
  );
}

function getPriceDisplay(event: Event) {
  if (event.priceType === 'free') return 'Free';
  if (event.priceType === 'donation') return 'Donation';
  if (event.minPrice) {
    return `$${event.minPrice}${event.maxPrice && event.maxPrice > event.minPrice ? ` - $${event.maxPrice}`: ''}`;
  }
  return 'Paid';
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeDateFilter, setActiveDateFilter] = useState('All');
  const placeholder = PlaceHolderImages.find(p => p.id.includes('event')) || PlaceHolderImages[0];

  const eventsQuery = useMemoFirebase(() => query(
    collection(firestore, 'events'),
    where('status', '==', 'published'),
    where('approvalStatus', '==', 'approved'),
    orderBy('startTime', 'asc')
  ), []);

  const { data: events, loading, error } = useCollection<Event>(eventsQuery);


  const toggleCategory = (category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };
  
  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter((event) => {
        if (!event.startTime) return false;
        const eventDate = (event.startTime as Timestamp).toDate();
        const now = new Date();
        if (eventDate < now && !isToday(eventDate)) return false; // Filter out past events

        // Date filtering
        if (activeDateFilter === 'Today' && !isToday(eventDate)) return false;
        if (activeDateFilter === 'Tomorrow' && !isTomorrow(eventDate)) return false;
        if (activeDateFilter === 'This weekend') {
          const startOfThisWeek = startOfWeek(now);
          const endOfThisWeek = endOfWeek(now);
          const weekendStart = new Date(startOfThisWeek.setDate(startOfThisWeek.getDate() + (5 - startOfThisWeek.getDay() + 7) % 7)); // Friday
          const weekendEnd = new Date(new Date(weekendStart).setDate(weekendStart.getDate() + 2)); // Sunday
          if (!isWithinInterval(eventDate, { start: weekendStart, end: weekendEnd })) {
              return false;
          }
        }

        // Category filtering
        if (activeCategories.length > 0 && !activeCategories.includes(event.category)) {
          return false;
        }
        
        // Search term filtering
        if (searchTerm && !event.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
        
        return true;
      });
  }, [events, activeDateFilter, activeCategories, searchTerm]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl font-bold">Events</h1>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="mr-2 h-4 w-4" /> Add Event
          </Link>
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
            <p className="text-sm font-medium mr-2 self-center">Filters:</p>
            {dateFilters.map((filter) => (
                <Button
                key={filter}
                variant={activeDateFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveDateFilter(filter)}
                >
                {filter}
                </Button>
            ))}
        </div>
         <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
                <Button
                key={category}
                variant={activeCategories.includes(category) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => toggleCategory(category)}
                className="border"
                >
                {category}
                </Button>
            ))}
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <EventCardSkeleton key={i} />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-10">Error loading events: {error.message}</p>}

      {!loading && filteredEvents && filteredEvents.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
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
                    <span>{event.location?.neighborhood || 'TBA'}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && (!filteredEvents || filteredEvents.length === 0) && (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No events found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or creating a new event.</p>
        </div>
      )}
    </div>
  );
}
