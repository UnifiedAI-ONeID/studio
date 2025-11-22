'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCollection } from 'react-firebase-hooks/firestore';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import type { Venue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Building, Coffee, GalleryVertical, BarChart } from 'lucide-react';

const venueTypes = ['cafe', 'bar', 'gallery', 'venue', 'ngo', 'other'];

function VenueCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

function PriceLevel({ level }: { level: number }) {
    return (
      <div className="flex text-primary">
        {Array.from({ length: 4 }).map((_, i) => (
          <span key={i} className={i < level ? 'text-primary' : 'text-muted-foreground/30'}>$</span>
        ))}
      </div>
    );
}

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTypes, setActiveTypes] = useState<string[]>([]);

  const venuesQuery = query(
    collection(firestore, 'venues'),
    where('verified', '==', true),
    orderBy('name', 'asc')
  );

  const [venuesSnapshot, loading, error] = useCollection(venuesQuery);

  const toggleType = (type: string) => {
    setActiveTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };
  
  const filteredVenues = venuesSnapshot?.docs
    .map((doc) => ({ id: doc.id, ...doc.data() } as Venue))
    .filter((venue) => {
      // Type filtering
      if (activeTypes.length > 0 && !activeTypes.includes(venue.type)) {
        return false;
      }
      
      // Search term filtering
      if (searchTerm && !venue.name.toLowerCase().includes(searchTerm.toLowerCase()) && !venue.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl font-bold">Directory</h1>
        <Button asChild>
          <Link href="/directory/new">
            <Plus className="mr-2 h-4 w-4" /> Add Place
          </Link>
        </Button>
      </div>

      <div className="space-y-4 mb-8">
        <div className="relative md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search venues, cafes, NGOs..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
         <div className="flex flex-wrap gap-2">
            {venueTypes.map((type) => (
                <Button
                key={type}
                variant={activeTypes.includes(type) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => toggleType(type)}
                className="border capitalize"
                >
                {type}
                </Button>
            ))}
        </div>
      </div>

      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <VenueCardSkeleton key={i} />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-10">Error loading venues: {error.message}</p>}

      {!loading && filteredVenues && filteredVenues.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredVenues.map((venue) => (
            <Link href={`/directory/${venue.id}`} key={venue.id}>
              <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="relative h-32 w-full">
                  <Image
                    src={venue.coverImageUrl || 'https://picsum.photos/seed/venue/400/200'}
                    alt={venue.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardHeader>
                  <p className="text-sm font-medium text-primary capitalize">{venue.type}</p>
                  <CardTitle className="font-headline text-lg line-clamp-2">{venue.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-sm text-muted-foreground">{venue.neighborhood}</p>
                  <div className="mt-2">
                    <PriceLevel level={venue.priceLevel} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      {!loading && (!filteredVenues || filteredVenues.length === 0) && (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No places found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or add a new place.</p>
        </div>
      )}
    </div>
  );
}

    