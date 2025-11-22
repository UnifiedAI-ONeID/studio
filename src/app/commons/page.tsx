
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { collection, query, orderBy, where, limit, QueryConstraint } from 'firebase/firestore';
import { firestore } from '@/lib/firebase/index';
import { useCollection, useAuth, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import type { CommonsThread } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, MessageSquare, Clock, Heart, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';

const topics = ["all", "general", "neighborhoods", "buy-sell", "housing", "clubs", "events"];

function ThreadCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex items-center pt-2">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="ml-2 space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommonsPage() {
  const { user } = useAuth();
  const [activeTopic, setActiveTopic] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const threadsQuery = useMemoFirebase(() => {
    const baseQuery = collection(firestore, 'commonsThreads');
    const constraints: QueryConstraint[] = [orderBy('lastActivityAt', 'desc'), limit(20)];
    
    if (activeTopic !== 'all') {
      constraints.unshift(where('topic', '==', activeTopic));
    }
    
    return query(baseQuery, ...constraints);
  }, [activeTopic]);

  const { data: threads, loading, error } = useCollection<CommonsThread>(threadsQuery);

  const filteredThreads = useMemoFirebase(() => {
    if (!threads) return [];
    if (!searchTerm) return threads;
    return threads.filter(thread => 
        thread.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        thread.body.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [threads, searchTerm]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-headline text-3xl font-bold">Commons</h1>
        {user && (
          <Button asChild>
            <Link href="/commons/new">
              <Plus className="mr-2 h-4 w-4" /> Start a Thread
            </Link>
          </Button>
        )}
      </div>

       <div className="space-y-4 mb-8">
        <div className="relative md:hidden">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search threads..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2 border-b pb-4">
            {topics.map(topic => (
            <Button
                key={topic}
                variant={activeTopic === topic ? 'secondary' : 'ghost'}
                onClick={() => setActiveTopic(topic)}
                className="capitalize"
            >
                {topic}
            </Button>
            ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <ThreadCardSkeleton key={i} />)}
        </div>
      )}

      {error && <p className="text-destructive text-center py-10">Error loading threads: {error.message}</p>}

      {!loading && filteredThreads.length > 0 && (
        <div className="space-y-4">
          {filteredThreads.map(thread => (
            <Link href={`/commons/${thread.id}`} key={thread.id}>
              <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">{thread.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{thread.body}</p>
                   <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                       <Avatar className="h-6 w-6">
                        <AvatarImage src={thread.authorInfo?.photoURL || undefined} alt={thread.authorInfo?.displayName} />
                        <AvatarFallback>{thread.authorInfo?.displayName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span>{thread.authorInfo?.displayName}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1"><Heart className="h-4 w-4" /> {thread.stats.likeCount || 0}</span>
                      <span className="flex items-center gap-1"><MessageSquare className="h-4 w-4" /> {thread.stats.replyCount}</span>
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {thread.lastActivityAt && formatDistanceToNow(thread.lastActivityAt.toDate(), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {!loading && filteredThreads.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No threads found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your filters or search term.</p>
        </div>
      )}
    </div>
  );
}
