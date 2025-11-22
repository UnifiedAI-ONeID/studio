'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, MapPin, Plus } from 'lucide-react';
import { format } from 'date-fns';

const categories = ['Music', 'Food & Drink', 'Talks', 'Sports', 'Arts'];
const dateFilters = ['Today', 'Tomorrow', 'This weekend', 'All'];

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardHeader>
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-3/4 mt-2" />
        <Skeleton className="h-4 w-1/2 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
}

function getPriceDisplay(event: Event) {
  if (event.priceType === 'free') return 'Free';
  if (event.priceType === 'donation') return 'Donation';
  if (event.priceMin && event.priceMax && event.priceMin !== event.priceMax) {
    return `$${event.priceMin} - $${event.priceMax}`;
  }
  if (event.priceMin) return `$${event.priceMin}`;
  return 'Paid';
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeDateFilter, setActiveDateFilter] = useState('All');

  const eventsQuery = query(
    collection(firestore, 'events'),
    where('status', '==', 'published'),
    where('approvalStatus', '==', 'approved'),
    orderBy('startTime', 'asc')
  );

  const [eventsSnapshot, loading, error] = useCollection(eventsQuery);

  const toggleCategory = (category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredEvents = eventsSnapshot?.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Event))
    .filter((event) => {
      const now = new Date();
      const eventDate = event.startTime.toDate();
      
      // Date filtering
      if (activeDateFilter === 'Today' && format(eventDate, 'yyyy-MM-dd') !== format(now, 'yyyy-MM-dd')) return false;
      if (activeDateFilter === 'Tomorrow') {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        if (format(eventDate, 'yyyy-MM-dd') !== format(tomorrow, 'yyyy-MM-dd')) return false;
      }
      // This Weekend logic can be more complex, this is a simplified version
      if (activeDateFilter === 'This weekend') {
        const day = now.getDay();
        const isWeekend = day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
        if (!isWeekend) return false;
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

      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search events..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
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

      {error && <p className="text-destructive text-center">Error loading events: {error.message}</p>}

      {!loading && filteredEvents && filteredEvents.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredEvents.map((event) => (
            <Link href={`/events/${event.id}`} key={event.id}>
              <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-40 w-full">
                  <Image
                    src={event.coverImageUrl || 'https://picsum.photos/seed/event/400/200'}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <Badge variant="secondary" className="absolute top-2 right-2">{getPriceDisplay(event)}</Badge>
                </div>
                <CardHeader>
                  <p className="text-sm font-medium text-primary">{event.category.toUpperCase()}</p>
                  <CardTitle className="font-headline text-lg line-clamp-2">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="font-semibold">{format(event.startTime.toDate(), "E, MMM d '·' h:mm a")}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{event.neighborhood || 'TBA'}</span>
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
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
