'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useDoc, useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import { doc, collection, query, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import { createComment, reportContent, addReaction, removeReaction, addCommentReaction, removeCommentReaction, getUserReactionsForThread } from '@/lib/firebase/firestore';
import type { Thread, Comment, Event, Venue } from '@/lib/types';

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
                        <Image src={event.coverImageUrl} alt={event.title} width={80} height={45} className="rounded-md object-cover aspect-video" />
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
                        <Image src={venue.coverImageUrl} alt={venue.name} width={80} height={45} className="rounded-md object-cover aspect-video" />
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

function CommentItem({ comment, userHasReacted, onReaction }: { comment: Comment, userHasReacted: boolean, onReaction: (commentId: string, hasReacted: boolean) => void }) {
    const { toast } = useToast();
    const { user } = useAuth();
    
    const handleReport = async () => {
        if (!user) return;
        try {
            await reportContent('comment', comment.id, 'User reported this comment.', user.uid);
            toast({ title: 'Comment reported', description: 'Thank you for helping keep the community safe.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to report' });
        }
    }

    const handleLike = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Please sign in to like comments.' });
            return;
        }
        onReaction(comment.id, userHasReacted);
    };

    return (
        <div className="flex gap-4 py-4 border-b">
            <Avatar className="h-10 w-10">
                <AvatarImage src={comment.authorInfo.photoURL || undefined} />
                <AvatarFallback>{comment.authorInfo.displayName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold">{comment.authorInfo.displayName}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                            {format((comment.createdAt as Timestamp).toDate(), "MMM d, yyyy")}
                        </span>
                    </div>
                    {user && user.uid !== comment.createdBy && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReport}>
                            <Flag className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <p className="text-sm mt-1">{comment.body}</p>
                 <div className="flex items-center gap-2 mt-2">
                    <Button variant="ghost" size="sm" onClick={handleLike} className="-ml-2">
                        <Heart className={cn("h-4 w-4 mr-1", userHasReacted && "fill-red-500 text-red-500")} />
                        <span>{comment.likeCount || 0}</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ThreadDetailPage() {
    const params = useParams();
    const threadId = params.id as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [userReactions, setUserReactions] = useState<Set<string>>(new Set());

    const threadRef = useMemoFirebase(() => threadId ? doc(firestore, 'threads', threadId) : null, [threadId]);
    const { data: thread, loading: threadLoading } = useDoc<Thread>(threadRef);

    const commentsQuery = useMemoFirebase(() => 
        threadId ? query(collection(firestore, 'threads', threadId, 'comments'), orderBy('createdAt', 'asc')) : null
    , [threadId]);
    const { data: comments, loading: commentsLoading } = useCollection<Comment>(commentsQuery);
    
    useState(() => {
        if(user && threadId) {
            getUserReactionsForThread(user.uid, threadId).then(setUserReactions);
        }
    }, [user, threadId, comments]);

    const handlePostComment = async () => {
        if (!user || !commentText.trim()) return;

        setIsSubmitting(true);
        try {
            await createComment({
                threadId,
                body: commentText,
                parentId: null,
                createdBy: user.uid,
            }, {
                displayName: user.displayName,
                photoURL: user.photoURL,
            });
            setCommentText('');
            toast({ title: 'Comment posted!' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Failed to post comment.' });
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    }
    
     const handleReportThread = async () => {
        if (!user) return;
        try {
            await reportContent('thread', threadId, 'User reported this thread.', user.uid);
            toast({ title: 'Thread reported', description: 'Thank you for your feedback.' });
        } catch (e) {
            toast({ variant: 'destructive', title: 'Failed to report thread' });
        }
    }

    const handleThreadReaction = async () => {
        if (!user) {
            toast({ variant: "destructive", title: "Please sign in to like posts" });
            return;
        }

        const hasReacted = userReactions.has(threadId);
        const newReactions = new Set(userReactions);

        try {
            if (hasReacted) {
                await removeReaction(user.uid, threadId, 'thread');
                newReactions.delete(threadId);
            } else {
                await addReaction(user.uid, threadId, 'thread');
                newReactions.add(threadId);
            }
            setUserReactions(newReactions);
        } catch (error) {
            console.error("Failed to update reaction:", error);
            toast({ variant: "destructive", title: "Something went wrong" });
        }
    };
    
    const handleCommentReaction = async (commentId: string, hasReacted: boolean) => {
        if (!user) return;
        
        const newReactions = new Set(userReactions);
        try {
            if (hasReacted) {
                await removeCommentReaction(user.uid, threadId, commentId);
                newReactions.delete(commentId);
            } else {
                await addCommentReaction(user.uid, threadId, commentId);
                newReactions.add(commentId);
            }
            setUserReactions(newReactions);
        } catch (error) {
             console.error("Failed to update comment reaction:", error);
            toast({ variant: "destructive", title: "Something went wrong" });
        }
    };

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
                        <AvatarImage src={thread.authorInfo.photoURL || undefined} />
                        <AvatarFallback>{thread.authorInfo.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{thread.authorInfo.displayName}</span>
                    <span>·</span>
                    <span>{format((thread.createdAt as Timestamp).toDate(), "MMM d, yyyy")}</span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none mb-8">
                <p>{thread.body}</p>
            </div>
            
            <div className="flex justify-between items-center mb-8 border-t border-b py-2">
                 <div className="flex items-center gap-4 text-muted-foreground">
                    <Button variant="ghost" size="sm" onClick={handleThreadReaction} className="-ml-3">
                         <Heart className={cn("h-5 w-5 mr-1.5", userReactions.has(threadId) && "fill-red-500 text-red-500")} />
                         <span className="font-semibold">{thread.likeCount || 0}</span>
                    </Button>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5"/>
                      <span className="font-semibold">{thread.replyCount}</span>
                    </div>
                 </div>
                 {user && user.uid !== thread.createdBy && (
                    <Button variant="ghost" onClick={handleReportThread}>
                        <Flag className="mr-2 h-4 w-4"/> Report Thread
                    </Button>
                 )}
            </div>

            <div className="space-y-4">
                {commentsLoading ? (
                    <>
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </>
                ) : (
                    comments?.map(comment => <CommentItem key={comment.id} comment={comment} userHasReacted={userReactions.has(comment.id)} onReaction={handleCommentReaction} />)
                )}
            </div>

            {user && (
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle className="text-lg">Add a comment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={user.photoURL || undefined} />
                                <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Textarea 
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    placeholder="Share your thoughts..."
                                    rows={3}
                                />
                                <Button 
                                    onClick={handlePostComment} 
                                    disabled={isSubmitting || !commentText.trim()}
                                    className="mt-2"
                                >
                                    {isSubmitting ? "Posting..." : "Post Comment"}
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
