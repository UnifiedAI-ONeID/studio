
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAuth, useDoc, useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import { doc, collection, query, orderBy, Timestamp, where } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import { createReply, reportContent } from '@/lib/firebase/firestore';
import type { CommonsThread, CommonsReply, Event, Venue } from '@/lib/types';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Flag, MessageSquare, Send, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

function RelatedItem({ type, id }: { type: 'event' | 'venue', id: string }) {
    const itemRef = useMemoFirebase(() => doc(firestore, `${type}s`, id), [id, type]);
    const { data: item, loading } = useDoc<Event | Venue>(itemRef);

    if (loading || !item) return null;

    if (type === 'event') {
        const event = item as Event;
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">Related Event</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/events/${event.id}`} className="flex items-center gap-4">
                        {event.coverImageUrl && <Image src={event.coverImageUrl} alt={event.title} width={80} height={45} className="rounded-md object-cover aspect-video" />}
                        <div>
                            <p className="font-semibold">{event.title}</p>
                            <p className="text-sm text-muted-foreground">{format((event.startTime as Timestamp).toDate(), "MMM d, yyyy")}</p>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        );
    }
    
    if (type === 'venue') {
        const venue = item as Venue;
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">Related Venue</CardTitle>
                </CardHeader>
                <CardContent>
                    <Link href={`/directory/${venue.id}`} className="flex items-center gap-4">
                        {venue.coverImageUrl && <Image src={venue.coverImageUrl} alt={venue.name} width={80} height={45} className="rounded-md object-cover aspect-video" />}
                        <div>
                            <p className="font-semibold">{venue.name}</p>
                            <p className="text-sm text-muted-foreground">{venue.neighborhood}</p>
                        </div>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    return null;
}

function ReplyItem({ reply }: { reply: CommonsReply }) {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const handleReport = async () => {
        if (!user) return;
        try {
            await reportContent('reply', reply.id, 'User reported this reply.', user.id);
            toast({ title: 'Reply reported', description: 'Thank you for helping keep the community safe.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to report' });
        }
    }

    return (
        <div className="flex gap-4 py-4 border-b">
            <Avatar className="h-10 w-10">
                <AvatarImage src={reply.authorInfo?.photoURL || undefined} />
                <AvatarFallback>{reply.authorInfo?.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold">{reply.authorInfo?.displayName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                            {reply.createdAt && format((reply.createdAt as Timestamp).toDate(), "MMM d, yyyy")}
                        </span>
                    </div>
                    {user && user.id !== reply.authorId && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReport}>
                            <Flag className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <p className="text-sm mt-1">{reply.body}</p>
            </div>
        </div>
    )
}

export default function ThreadDetailPage() {
    const params = useParams();
    const threadId = params.id as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const threadRef = useMemoFirebase(() => threadId ? doc(firestore, 'threads', threadId) : null, [threadId]);
    const { data: thread, loading: threadLoading } = useDoc<CommonsThread>(threadRef);

    const repliesQuery = useMemoFirebase(() => 
        threadId ? query(collection(firestore, `threads/${threadId}/comments`), orderBy('createdAt', 'asc')) : null
    , [threadId]);
    const { data: replies, loading: repliesLoading } = useCollection<CommonsReply>(repliesQuery);
    
    const handlePostReply = async () => {
        if (!user || !replyText.trim()) return;

        setIsSubmitting(true);
        try {
            await createReply({
                threadId,
                body: replyText,
            }, user);
            setReplyText('');
            toast({ title: 'Reply posted!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to post reply.' });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }
    
     const handleReportThread = async () => {
        if (!user) return;
        try {
            await reportContent('thread', threadId, 'User reported this thread.', user.id);
            toast({ title: 'Thread reported', description: 'Thank you for your feedback.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to report thread' });
        }
    }

    if (threadLoading) {
        return (
            <div className="container mx-auto max-w-3xl">
                <Skeleton className="h-10 w-3/4 mb-4" />
                <Skeleton className="h-5 w-1/4 mb-8" />
                <Skeleton className="h-24 w-full mb-8" />
                <Skeleton className="h-16 w-full" />
            </div>
        );
    }

    if (!thread) {
        return <div className="text-center py-10">Thread not found.</div>;
    }

    return (
        <div className="container mx-auto max-w-3xl pb-12">
            {thread.relatedEventId && <RelatedItem type="event" id={thread.relatedEventId} />}
            {thread.relatedVenueId && <RelatedItem type="venue" id={thread.relatedVenueId} />}
            
            <div className="mb-8">
                <Badge variant="secondary" className="capitalize mb-2">{thread.topic}</Badge>
                <h1 className="font-headline text-3xl font-bold">{thread.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={thread.authorInfo?.photoURL || undefined} />
                        <AvatarFallback>{thread.authorInfo?.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{thread.authorInfo?.displayName}</span>
                    <span>·</span>
                    <span>{thread.createdAt && format((thread.createdAt as Timestamp).toDate(), "MMM d, yyyy")}</span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
                <p>{thread.body}</p>
            </div>
            
            <div className="flex justify-between items-center mb-8 border-t border-b py-2">
                 <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5"/>
                      <span className="font-semibold">{thread.stats.likeCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5"/>
                      <span className="font-semibold">{thread.stats.replyCount}</span>
                    </div>
                 </div>
                 {user && user.id !== thread.authorId && (
                    <Button variant="ghost" onClick={handleReportThread}>
                        <Flag className="mr-2 h-4 w-4"/> Report Thread
                    </Button>
                 )}
            </div>

            <div className="space-y-4">
                {repliesLoading ? (
                    <>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </>
                ) : (
                    replies?.map(reply => <ReplyItem key={reply.id} reply={reply} />)
                )}
            </div>

            {user && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Add a reply</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea 
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                />
                                <Button 
                                    onClick={handlePostReply} 
                                    disabled={isSubmitting || !replyText.trim()}
                                    className="mt-2"
                                >
                                    {isSubmitting ? "Posting..." : "Post Reply"}
                                    <Send className="ml-2 h-4 w-4"/>
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
