'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Calendar, List, Users2 } from 'lucide-react';
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import type { Event, Venue, Thread } from '@/lib/types';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';

type SearchResult = {
  id: string;
  title: string;
  type: 'event' | 'venue' | 'thread';
  path: string;
};

const searchCollections = async (searchTerm: string): Promise<SearchResult[]> => {
  if (!searchTerm) return [];

  const results: SearchResult[] = [];
  const lowerCaseTerm = searchTerm.toLowerCase();

  // Search Events
  const eventsQuery = query(
    collection(firestore, 'events'),
    where('status', '==', 'published'),
    orderBy('title')
  );
  const eventSnap = await getDocs(eventsQuery);
  eventSnap.forEach(doc => {
    const event = doc.data() as Event;
    if (event.title.toLowerCase().includes(lowerCaseTerm)) {
      results.push({
        id: doc.id,
        title: event.title,
        type: 'event',
        path: `/events/${doc.id}`,
      });
    }
  });

  // Search Venues
  const venuesQuery = query(
    collection(firestore, 'venues'),
    where('verified', '==', true),
    orderBy('name')
  );
  const venueSnap = await getDocs(venuesQuery);
  venueSnap.forEach(doc => {
    const venue = doc.data() as Venue;
    if (venue.name.toLowerCase().includes(lowerCaseTerm)) {
      results.push({
        id: doc.id,
        title: venue.name,
        type: 'venue',
        path: `/directory/${doc.id}`,
      });
    }
  });

  // Search Threads
  const threadsQuery = query(
    collection(firestore, 'threads'),
    orderBy('title')
  );
  const threadSnap = await getDocs(threadsQuery);
  threadSnap.forEach(doc => {
    const thread = doc.data() as Thread;
    if (thread.title.toLowerCase().includes(lowerCaseTerm)) {
      results.push({
        id: doc.id,
        title: thread.title,
        type: 'thread',
        path: `/commons/${doc.id}`,
      });
    }
  });

  return results.slice(0, 15); // Limit total results
};

export default function GlobalSearch({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true);
      searchCollections(debouncedSearchTerm).then(res => {
        setResults(res);
        setLoading(false);
      });
    } else {
      setResults([]);
    }
  }, [debouncedSearchTerm]);

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if(!isOpen) {
        setSearchTerm('');
        setResults([]);
    }
  }
  
  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'event': return <Calendar className="h-5 w-5 text-muted-foreground" />;
      case 'venue': return <List className="h-5 w-5 text-muted-foreground" />;
      case 'thread': return <Users2 className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search events, places, and discussions..."
            className="pl-10 h-11"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="mt-4 space-y-2 max-h-[400px] overflow-y-auto">
            {loading && (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            )}
            {!loading && results.length > 0 && (
                 <div className="divide-y">
                    {results.map(result => (
                        <Link href={result.path} key={result.id} onClick={() => onOpenChange(false)} className="block">
                            <div className="flex items-center gap-4 p-3 hover:bg-muted/50 rounded-md">
                                {getIcon(result.type)}
                                <span className="flex-1 font-medium truncate">{result.title}</span>
                                <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
            {!loading && debouncedSearchTerm && results.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No results found for "{debouncedSearchTerm}".</p>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

    