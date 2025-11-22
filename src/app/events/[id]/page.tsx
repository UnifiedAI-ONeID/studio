'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Share2, Tag, User, Users } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';

function RelatedEvents({ category, currentEventId }: { category: string; currentEventId: string }) {
    const eventsQuery = query(
      collection(firestore, 'events'),
      where('status', '==', 'published'),
      where('approvalStatus', '==', 'approved'),
      where('category', '==', category),
      limit(4)
    );
    
    const [eventsSnapshot] = useDocument(eventsQuery as any);

    const relatedEvents = eventsSnapshot?.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Event))
        .filter(event => event.id !== currentEventId)
        .slice(0, 3);
        
    if (!relatedEvents || relatedEvents.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold font-headline mb-4">More events you might like</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedEvents.map(event => (
                    <Link href={`/events/${event.id}`} key={event.id}>
                        <Card className="overflow-hidden h-full flex flex-col transition-shadow hover:shadow-lg">
                             <div className="relative h-32 w-full">
                                <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover"/>
                            </div>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg line-clamp-2">{event.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-primary font-semibold">{format(event.startTime.toDate(), "MMM d")}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;
  const [isExpanded, setIsExpanded] = useState(false);

  const eventRef = doc(firestore, 'events', eventId);
  const [eventSnapshot, loading, error] = useDocument(eventRef);
  const event = eventSnapshot?.data() as Event;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl">
        <Skeleton className="h-64 w-full md:h-96 rounded-lg" />
        <div className="p-4">
          <Skeleton className="h-8 w-3/4 mt-4" />
          <Skeleton className="h-5 w-1/4 mt-2" />
          <div className="flex gap-4 mt-6">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-24 w-full mt-6" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return <div className="text-center py-10">Error loading event or event not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-4xl pb-12">
      <div className="relative h-64 w-full md:h-96 rounded-b-lg overflow-hidden -mt-8 -mx-8">
        <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      <div className="p-4 transform -translate-y-16">
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <Badge>{event.category}</Badge>
              {event.tags && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                </div>
              )}
            </div>
            <CardTitle className="text-3xl md:text-4xl font-headline mt-2">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-muted-foreground">
                <div className="flex items-start gap-4">
                    <Calendar className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold text-foreground">{format(event.startTime.toDate(), "eeee, MMMM d, yyyy")}</p>
                        <p>{format(event.startTime.toDate(), "h:mm a")} {event.endTime && ` - ${format(event.endTime.toDate(), "h:mm a")}`} ({event.timezone})</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary mt-1"/>
                    <div>
                        <p className="font-semibold text-foreground">{event.neighborhood || 'Location To Be Announced'}</p>
                        <p>Venue details coming soon.</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
              <Button size="lg" className="flex-1">Interested</Button>
              <Button size="lg" variant="outline" onClick={handleShare}><Share2 className="mr-2"/> Share</Button>
            </div>
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className={cn(!isExpanded && "line-clamp-3")}>
                    {event.description}
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="link" className="px-0">
                  {isExpanded ? 'Read less' : 'Read more...'}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="prose prose-sm dark:prose-invert max-w-none pt-2">
                    {/* You can add more detailed description here if needed */}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="border-t pt-6">
                <div className="flex items-center gap-4">
                    <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center">
                        <User className="h-6 w-6 text-muted-foreground"/>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">Hosted by</p>
                        <p className="font-semibold text-foreground">{event.hostName || 'Community Organizer'}</p>
                    </div>
                </div>
            </div>
            
          </CardContent>
        </Card>
        
        <RelatedEvents category={event.category} currentEventId={eventId} />

      </div>
    </div>
  );
}
