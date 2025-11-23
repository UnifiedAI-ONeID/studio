
'use client';

import { useAuth, useCollection, useMemoFirebase, useDoc } from '@/hooks/use-firebase-hooks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Event, EventInteraction, Follow, CommonsThread, Venue } from '@/lib/types';
import { collection, query, where, orderBy, limit, doc } from 'firebase/firestore';
import { db as firestore } from '@/src/lib/firebase';
import { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Building, BookText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

function MyEvents() {
    const { user } = useAuth();
    const interactionsQuery = useMemoFirebase(() => 
        user ? query(
            collection(firestore, 'eventInteractions'),
            where('userId', '==', user.id),
            where('type', 'in', ['going', 'saved'])
        ) : null
    , [user]);

    const { data: interactions, loading: interactionsLoading } = useCollection<EventInteraction>(interactionsQuery);

    const eventIds = useMemo(() => interactions?.map(i => i.eventId), [interactions]);

    const eventsQuery = useMemoFirebase(() => 
        eventIds && eventIds.length > 0 ? query(
            collection(firestore, 'events'),
            where('__name__', 'in', eventIds)
        ) : null
    , [eventIds]);

    const { data: events, loading: eventsLoading } = useCollection<Event>(eventsQuery);

    if (interactionsLoading || eventsLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        );
    }
    if (!events || events.length === 0) return <p>You haven't saved or RSVP'd to any events yet.</p>

    return (
        <div className="space-y-4">
            {events.map(event => (
                <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="hover:bg-muted/50">
                        <CardContent className="p-4 flex gap-4">
                            <div className="flex-shrink-0 text-center w-16">
                                <p className="text-sm text-primary font-bold">{format(event.startTime.toDate(), "MMM")}</p>
                                <p className="text-2xl font-headline">{format(event.startTime.toDate(), "d")}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">{event.location?.neighborhood}</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    )
}

function FollowedItem({ follow }: { follow: Follow }) {
    const { targetId, targetType } = follow;

    const isVenue = targetType === 'venue';
    const collectionName = isVenue ? 'venues' : null;
    const linkPath = isVenue ? '/directory' : '/commons'; // Fallback for topic

    const docRef = useMemoFirebase(() => 
        collectionName ? doc(firestore, collectionName, targetId) : null
    , [collectionName, targetId]);

    // The 'useDoc' hook is only used for Firestore documents (venues in this case).
    // For topics, which are not documents, we handle them differently.
    const { data: docData, loading } = useDoc<Venue>(docRef);

    if (loading) {
        return <Skeleton className="h-14 w-full" />;
    }
    
    // Determine the name and icon based on the target type
    let name = 'Unknown';
    let icon = <BookText className="h-5 w-5 text-muted-foreground" />;
    
    if (isVenue && docData) {
        name = docData.name;
        icon = <Building className="h-5 w-5 text-muted-foreground" />;
    } else if (targetType === 'topic') {
        name = targetId; // For topics, the ID is the name itself
    } else if (!isVenue) {
      // Could be a user or organization in the future
      return null;
    }

    // Construct the final link href
    const finalLink = targetType === 'topic' ? `${linkPath}?topic=${targetId}` : `${linkPath}/${targetId}`;

    return (
        <Link href={finalLink}>
            <Card className="hover:bg-muted/50">
                <CardContent className="p-3 flex items-center gap-3">
                    {icon}
                    <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{targetType}</p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}


function MyFollows() {
    const { user } = useAuth();
    const followsQuery = useMemoFirebase(() =>
        user ? query(collection(firestore, 'follows'), where('userId', '==', user.id)) : null
    , [user]);
    const { data: follows, loading } = useCollection<Follow>(followsQuery);

    if (loading) {
        return (
             <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        );
    }
    if (!follows || follows.length === 0) return <p>You are not following anything yet.</p>

    return (
        <div className="space-y-2">
            {follows.map(follow => (
                <FollowedItem key={follow.id} follow={follow} />
            ))}
        </div>
    );
}

function MyThreads() {
    const { user } = useAuth();
    const threadsQuery = useMemoFirebase(() =>
        user ? query(
            collection(firestore, 'threads'),
            where('authorId', '==', user.id),
            orderBy('createdAt', 'desc'),
            limit(20)
        ) : null
    , [user]);
    const { data: threads, loading } = useCollection<CommonsThread>(threadsQuery);

    if (loading) {
        return (
            <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }
    if (!threads || threads.length === 0) return <p>You haven't posted any threads.</p>

    return (
        <div className="space-y-3">
            {threads.map(thread => (
                <Link key={thread.id} href={`/commons/${thread.id}`}>
                    <Card className="hover:bg-muted/50">
                        <CardContent className="p-4">
                            <h3 className="font-semibold">{thread.title}</h3>
                            <p className="text-sm text-muted-foreground">{thread.stats.replyCount} replies</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const userInitial = user?.displayName?.charAt(0).toUpperCase() || '?';

  if (!user) return null;

  return (
    <div className="container mx-auto">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
              <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.displayName}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="events">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="events">My Events</TabsTrigger>
                    <TabsTrigger value="threads">My Threads</TabsTrigger>
                    <TabsTrigger value="follows">My Follows</TabsTrigger>
                </TabsList>
                <TabsContent value="events" className="py-4">
                    <MyEvents />
                </TabsContent>
                <TabsContent value="threads" className="py-4">
                    <MyThreads />
                </TabsContent>
                <TabsContent value="follows" className="py-4">
                    <MyFollows />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
