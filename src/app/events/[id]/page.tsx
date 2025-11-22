'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDocument, useCollection } from 'react-firebase-hooks/firestore';
import { doc, collection, query, where, limit, Timestamp, orderBy } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { Event, EventInteractionType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Share2, User, Building, MessageSquare, CheckCircle, Star, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { addEventInteraction, removeEventInteraction, getUserEventInteraction } from '@/lib/firebase/firestore';

function RelatedEvents({ category, currentEventId }: { category: string; currentEventId: string }) {
    const eventsQuery = query(
      collection(firestore, 'events'),
      where('status', '==', 'published'),
      where('approvalStatus', '==', 'approved'),
      where('category', '==', category),
      limit(4)
    );
    
    const [eventsSnapshot, loading] = useCollection(eventsQuery);

    const relatedEvents = eventsSnapshot?.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Event))
        .filter(event => event.id !== currentEventId)
        .slice(0, 3);
        
    if (loading) {
        return (
            <div className="mt-12">
                <h2 className="text-2xl font-bold font-headline mb-4">More events you might like</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }
        
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
                                <p className="text-sm text-primary font-semibold">{format((event.startTime as Timestamp).toDate(), "MMM d")}</p>
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
  const router = useRouter();
  const eventId = params.id as string;
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, setPrompted } = useAuth();
  const { toast } = useToast();

  const [interaction, setInteraction] = useState<EventInteractionType | null>(null);
  const [interactionLoading, setInteractionLoading] = useState(true);

  const eventRef = doc(firestore, 'events', eventId);
  const [eventSnapshot, loading, error] = useDocument(eventRef);

  useEffect(() => {
    if (user && eventId) {
      setInteractionLoading(true);
      getUserEventInteraction(user.uid, eventId).then(type => {
        setInteraction(type);
        setInteractionLoading(false);
      });
    } else {
      setInteractionLoading(false);
    }
  }, [user, eventId]);

  const handleInteraction = async (type: EventInteractionType) => {
    if (!user) {
      setPrompted(true);
      router.push(`/login?continueUrl=/events/${eventId}`);
      return;
    }
    
    setInteractionLoading(true);
    try {
      if (interaction === type) {
        // User is toggling off the current interaction
        await removeEventInteraction(user.uid, eventId, type);
        setInteraction(null);
        toast({ title: `No longer ${type}` });
      } else {
        // Switching interaction or setting a new one
        if (interaction) {
          // In a real app, you might want to confirm if they want to switch (e.g. from 'going' to 'interested')
          // For now, we just remove the old one and add the new one.
          await removeEventInteraction(user.uid, eventId, interaction);
        }
        await addEventInteraction(user.uid, eventId, type);
        setInteraction(type);
        toast({ title: `You are ${type}!` });
      }
    } catch (e) {
      console.error(e);
      toast({ variant: 'destructive', title: 'Something went wrong' });
    } finally {
        // The useDocument hook will update the UI with new stats, so we can just set loading to false.
        setInteractionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl animate-pulse">
        <Skeleton className="h-64 w-full md:h-96 rounded-b-lg -mt-8 -mx-8" />
        <div className="p-4 transform -translate-y-16">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-28" />
              </div>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !eventSnapshot?.exists()) {
    return <div className="text-center py-10">Error loading event or event not found.</div>;
  }

  const event = { id: eventSnapshot.id, ...eventSnapshot.data() } as Event;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copied to clipboard!' });
    }
  };
  
  const discussionLink = `/commons/new?relatedEventId=${event.id}&title=${encodeURIComponent(`Discuss: ${event.title}`)}&topic=general`;

  return (
    <div className="bg-background">
      <div className="container mx-auto max-w-4xl pb-12">
        <div className="relative h-64 w-full md:h-96 rounded-b-lg overflow-hidden -mt-8 -mx-4">
          <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        <div className="p-4 transform -translate-y-20">
          <Card className="bg-card/90 backdrop-blur-sm">
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
                      <Calendar className="h-6 w-6 text-primary mt-1 flex-shrink-0"/>
                      <div>
                          <p className="font-semibold text-foreground">{format((event.startTime as Timestamp).toDate(), "eeee, MMMM d, yyyy")}</p>
                          <p>{format((event.startTime as Timestamp).toDate(), "h:mm a")} {event.endTime && ` - ${format((event.endTime as Timestamp).toDate(), "h:mm a")}`} ({event.timezone})</p>
                      </div>
                  </div>
                  {event.venueId ? (
                    <Link href={`/directory/${event.venueId}`} className="flex items-start gap-4 hover:bg-muted/50 p-2 -m-2 rounded-md">
                        <Building className="h-6 w-6 text-primary mt-1 flex-shrink-0"/>
                        <div>
                            <p className="font-semibold text-foreground">{event.venueName}</p>
                            <p>{event.neighborhood}</p>
                        </div>
                    </Link>
                  ) : (
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-primary mt-1 flex-shrink-0"/>
                      <div>
                          <p className="font-semibold text-foreground">{event.neighborhood || 'Location To Be Announced'}</p>
                          <p>Venue details coming soon.</p>
                      </div>
                    </div>
                  )}
              </div>

              <div className="flex items-center gap-2">
                <Button size="lg" variant={interaction === 'going' ? 'default' : 'outline'} className="flex-1" onClick={() => handleInteraction('going')} disabled={interactionLoading}>
                  <CheckCircle className="mr-2"/> {interaction === 'going' ? 'You are going' : 'I\'m Going'} ({event.stats?.goingCount || 0})
                </Button>
                <Button size="lg" variant={interaction === 'interested' ? 'default' : 'outline'} className="flex-1" onClick={() => handleInteraction('interested')} disabled={interactionLoading}>
                  <Heart className="mr-2"/> {interaction === 'interested' ? 'You\'re Interested' : 'Interested'} ({event.stats?.interestedCount || 0})
                </Button>
                <Button size="lg" variant={interaction === 'saved' ? 'default' : 'outline'} onClick={() => handleInteraction('saved')} disabled={interactionLoading}>
                  <Star className="mr-2"/> {interaction === 'saved' ? 'Saved' : 'Save'}
                </Button>
                <Button size="lg" variant="outline" onClick={handleShare}><Share2/></Button>
              </div>
              
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <div className={cn("prose prose-sm dark:prose-invert max-w-none relative", !isExpanded && "max-h-24 overflow-hidden")}>
                  <p>
                      {event.description}
                  </p>
                  {!isExpanded && <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-card to-transparent"/>}
                </div>
                <CollapsibleTrigger asChild>
                  <Button variant="link" className="px-0 -mt-2">
                    {isExpanded ? 'Read less' : 'Read more...'}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="prose prose-sm dark:prose-invert max-w-none pt-2">
                      {/* More details could go here */}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center gap-4">
                      <div className="bg-muted rounded-full h-12 w-12 flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground"/>
                      </div>
                      <div>
                          <p className="text-muted-foreground text-sm">Hosted by</p>
                          <p className="font-semibold text-foreground">{event.hostName || 'Community Organizer'}</p>
                      </div>
                  </div>
                  {user && (
                    <Button variant="outline" asChild>
                      <Link href={discussionLink}>
                        <MessageSquare className="mr-2 h-4 w-4"/> Discuss in Commons
                      </Link>
                    </Button>
                  )}
              </div>
              
            </CardContent>
          </Card>
          
          <RelatedEvents category={event.category} currentEventId={eventId} />

        </div>
      </div>
    </div>
  );
}
