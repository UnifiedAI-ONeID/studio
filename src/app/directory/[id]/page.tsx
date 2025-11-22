'use client';
import { useParams, useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { doc, collection, query, where, Timestamp, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import type { Venue, Event } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Copy, Tag, Calendar, MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { followTarget, unfollowTarget } from '@/lib/firebase/firestore';
import { useEffect, useState, useMemo } from 'react';

function UpcomingEvents({ venueId }: { venueId: string }) {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const eventsQuery = useMemo(() => query(
      collection(firestore, 'events'),
      where('venueId', '==', venueId),
      where('startTime', '>=', Timestamp.now()),
      where('status', '==', 'published'),
      where('approvalStatus', '==', 'approved'),
      orderBy('startTime', 'asc'),
      limit(5)
    ), [venueId]);
    
    useEffect(() => {
      const unsubscribe = onSnapshot(eventsQuery, 
        (snapshot) => {
          setEvents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Event)));
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }, [eventsQuery]);

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
        
    if (error || !events || events.length === 0) return null;

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold font-headline mb-4">Upcoming Events Here</h2>
            <div className="space-y-4">
                {events.map(event => {
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
  const { user, setPrompted } = useAuth();
  const router = useRouter();

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(true);

  useEffect(() => {
    if (venueId) {
      const venueRef = doc(firestore, 'venues', venueId);
      const unsubscribe = onSnapshot(venueRef, 
        (doc) => {
          if (doc.exists()) {
            setVenue({ id: doc.id, ...doc.data() } as Venue);
          }
          setLoading(false);
        },
        (err) => {
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [venueId]);

  const userFollowQuery = useMemo(() => 
    user ? query(collection(firestore, `users/${user.uid}/follows`), where('targetId', '==', venueId), where('targetType', '==', 'venue')) : null
  , [user, venueId]);

  useEffect(() => {
    if (userFollowQuery) {
        setFollowLoading(true);
        const unsubscribe = onSnapshot(userFollowQuery, (snapshot) => {
            setIsFollowing(!snapshot.empty);
            setFollowLoading(false);
        });
        return () => unsubscribe();
    } else if (!user) {
        setIsFollowing(false);
        setFollowLoading(false);
    }
  }, [userFollowQuery, user]);
  
  const handleFollow = async () => {
    if (!user) {
      setPrompted(true);
      const continueUrl = `/directory/${venueId}`;
      router.push(`/login?continueUrl=${encodeURIComponent(continueUrl)}`);
      return;
    }

    setFollowLoading(true);
    try {
        if(isFollowing) {
            await unfollowTarget(user.uid, venueId, 'venue');
            toast({ title: 'Unfollowed!' });
        } else {
            await followTarget(user.uid, venueId, 'venue');
            toast({ title: 'Followed!' });
        }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Something went wrong.' });
    } finally {
       // Let the useEffect handle the state update by re-triggering the snapshot listener
       setFollowLoading(false);
    }
  };

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

  if (error || !venue) {
    return <div className="text-center py-10">Error loading venue or venue not found.</div>;
  }
  
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(venue.address);
    toast({ title: 'Address copied to clipboard!' });
  };
  
  const discussionLink = `/commons/new?relatedVenueId=${venue.id}&title=${encodeURIComponent(`About: ${venue.name}`)}&topic=neighborhoods`;

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
                {user && (
                    <Button variant={isFollowing ? 'default' : 'outline'} onClick={handleFollow} disabled={followLoading}>
                        <Plus className={`mr-2 h-4 w-4 ${isFollowing ? 'rotate-45' : ''} transition-transform`} />
                        {isFollowing ? 'Following' : 'Follow'}
                    </Button>
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
              
              {user && (
                 <div className="border-t pt-6">
                    <Button variant="outline" asChild>
                      <Link href={discussionLink}>
                        <MessageSquare className="mr-2 h-4 w-4"/> Discuss this place
                      </Link>
                    </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          <UpcomingEvents venueId={venueId} />

        </div>
      </div>
    </div>
  );
}
