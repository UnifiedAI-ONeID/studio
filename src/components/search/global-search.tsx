
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
import { Search, Calendar, Building, MessageSquare } from 'lucide-react';
import {
  collection,
  query,
  getDocs,
  limit,
  orderBy,
  startAt,
  endAt,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { Event, Venue, CommonsThread } from '@/lib/types';
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

  const term = searchTerm.toLowerCase();
  const searchTermEnd = term + '\uf8ff';

  const searchInCollection = async (collectionName: string, titleField: string, type: 'event' | 'venue' | 'thread', pathPrefix: string) => {
    const collRef = collection(firestore, collectionName);
    // Note: This kind of query requires a composite index on the `titleField` for each collection.
    // If not configured, it will fail.
    const q = query(
        collRef, 
        orderBy(titleField), 
        startAt(term), 
        endAt(searchTermEnd),
        limit(5)
    );

    const snap = await getDocs(q);
    return snap.docs.map(doc => ({
        id: doc.id,
        title: doc.data()[titleField],
        type: type,
        path: `${pathPrefix}/${doc.id}`
    }));
  };

  try {
    const [events, venues, threads] = await Promise.all([
      searchInCollection('events', 'title', 'event', '/events'),
      searchInCollection('venues', 'name', 'venue', '/directory'),
      searchInCollection('threads', 'title', 'thread', '/commons'),
    ]);
    return [...events, ...venues, ...threads];
  } catch (error) {
      console.error("Search failed, likely due to missing composite indexes. Falling back to less efficient client-side filtering.", error);
      
      const [eventSnap, venueSnap, threadSnap] = await Promise.all([
        getDocs(query(collection(firestore, 'events'), limit(50))),
        getDocs(query(collection(firestore, 'venues'), limit(50))),
        getDocs(query(collection(firestore, 'threads'), limit(50))),
      ]);

      const results: SearchResult[] = [];
      eventSnap.forEach(doc => {
        const event = doc.data() as Event;
        if (event.title.toLowerCase().includes(term)) {
          results.push({ id: doc.id, title: event.title, type: 'event', path: `/events/${doc.id}` });
        }
      });
      venueSnap.forEach(doc => {
        const venue = doc.data() as Venue;
        if (venue.name.toLowerCase().includes(term)) {
          results.push({ id: doc.id, title: venue.name, type: 'venue', path: `/directory/${doc.id}` });
        }
      });
      threadSnap.forEach(doc => {
        const thread = doc.data() as CommonsThread;
        if (thread.title.toLowerCase().includes(term)) {
          results.push({ id: doc.id, title: thread.title, type: 'thread', path: `/commons/${doc.id}` });
        }
      });
      return results.slice(0, 15);
  }
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
      case 'venue': return <Building className="h-5 w-5 text-muted-foreground" />;
      case 'thread': return <MessageSquare className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
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
