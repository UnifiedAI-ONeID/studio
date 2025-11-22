'use client';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { doc, collection, query, where, Timestamp, orderBy, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Venue, Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Copy, Tag, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

function UpcomingEvents({ venueId }: { venueId: string }) {
    const eventsQuery = query(
      collection(firestore, 'events'),
      where('venueId', '==', venueId),
      where('startTime', '>=', Timestamp.now()),
      where('status', '==', 'published'),
      where('approvalStatus', '==', 'approved'),
      orderBy('startTime', 'asc'),
      limit(5)
    );
    
    const [eventsSnapshot, loading, error] = useCollection(eventsQuery);

    if (loading) {
        return (
            <div className="mt-8">
                <h2 className="text-2xl font-bold font-headline mb-4">Upcoming Events Here</h2>
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        )
    }
        
    if (error || !eventsSnapshot || eventsSnapshot.empty) return null;

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Upcoming Events Here</h2>
            <div className="space-y-4">
                {eventsSnapshot.docs.map(doc => {
                    const event = { id: doc.id, ...doc.data() } as Event;
                    return (
                        <Link href={`/events/${event.id}`} key={event.id}>
                             <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-md">
                                <div className="flex-shrink-0 text-center w-16">
                                    <p className="text-sm text-primary font-bold">{format((event.startTime as Timestamp).toDate(), "MMM")}</p>
                                    <p className="text-2xl font-headline">{format((event.startTime as Timestamp).toDate(), "d")}</p>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="font-semibold line-clamp-1">{event.title}</h3>
                                    <p className="text-sm text-muted-foreground">{format((event.startTime as Timestamp).toDate(), "h:mm a")}</p>
                                </div>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;
  const { toast } = useToast();

  const venueRef = doc(firestore, 'venues', venueId);
  const [venueSnapshot, loading, error] = useDocument(venueRef);
  
  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl animate-pulse">
        <Skeleton className="h-64 w-full md:h-80 rounded-b-lg -mt-8 -mx-8" />
        <div className="p-4 transform -translate-y-16">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !venueSnapshot?.exists()) {
    return <div className="text-center py-10">Error loading venue or venue not found.</div>;
  }

  const venue = { id: venueSnapshot.id, ...venueSnapshot.data() } as Venue;
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(venue.address);
    toast({ title: 'Address copied to clipboard!' });
  };

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-4xl pb-12">
        <div className="relative h-64 w-full md:h-80 rounded-b-lg overflow-hidden -mt-8 -mx-4">
          <Image src={venue.coverImageUrl} alt={venue.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        <div className="p-4 transform -translate-y-20">
          <Card className="bg-card/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge className="capitalize">{venue.type}</Badge>
                {venue.tags && (
                  <div className="flex flex-wrap gap-2">
                    {venue.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl md:text-4xl font-headline mt-2">{venue.name}</CardTitle>
              <p className="text-lg text-muted-foreground">{venue.neighborhood}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-muted-foreground">
                  <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                      <div className="flex items-center">
                          <p className="font-semibold text-foreground">{venue.address}</p>
                          <Button variant="ghost" size="icon" className="ml-2 h-7 w-7" onClick={handleCopyAddress}>
                            <Copy className="h-4 w-4"/>
                          </Button>
                      </div>
                  </div>
                  <div className="flex items-start gap-4">
                      <Clock className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                      <div>
                          <p className="font-semibold text-foreground">{venue.openingHours}</p>
                      </div>
                  </div>
              </div>
              
              <div className="prose prose-sm dark:prose-invert max-w-none pt-2">
                  <p>{venue.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <UpcomingEvents venueId={venueId} />

        </div>
      </div>
    </div>
  );
}
