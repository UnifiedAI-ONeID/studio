
'use client';

import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { CommonsThread } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, MessageSquare, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import { formatDistanceToNow } from 'date-fns';

function ThreadRow({ thread }: { thread: CommonsThread }) {
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-slate-100 transition hover:bg-slate-50/70 hover:ring-slate-200">
      <Link href={`/commons/${thread.id}`} className="block">
        <div className="flex items-start justify-between">
            <h4 className="font-headline font-semibold text-slate-800">{thread.title}</h4>
            <Badge variant="outline" className="hidden sm:block capitalize border-slate-200 text-slate-600">{thread.topic}</Badge>
        </div>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{thread.body}</p>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span>By {thread.authorInfo?.displayName || 'User'}</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="h-3 w-3" /> {thread.stats.replyCount} replies</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {thread.lastActivityAt && formatDistanceToNow(thread.lastActivityAt.toDate(), { addSuffix: true })}</span>
        </div>
      </Link>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="mt-6 space-y-3">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function HotThreadsSection() {
  const [threads, setThreads] = useState<CommonsThread[]>([]);
  const [loading, setLoading] = useState(true);

  const threadsQuery = useMemo(() => query(
    collection(firestore, 'commonsThreads'),
    orderBy('stats.replyCount', 'desc'),
    orderBy('createdAt', 'desc'),
    limit(5)
  ), []);

  useEffect(() => {
    const unsubscribe = onSnapshot(threadsQuery, (snapshot) => {
      setThreads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommonsThread)));
      setLoading(false);
    }, (error) => {
        console.error("Error fetching hot threads:", error);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [threadsQuery]);

  return (
    <section id="community" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-slate-800">
            What locals are talking about
          </h2>
          <Button variant="link" asChild>
            <Link href="/commons">
              Explore community <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
        {loading ? (
            <SectionSkeleton />
        ) : (
            <div className="mt-6 space-y-3">
            {threads?.map(thread => (
                <ThreadRow key={thread.id} thread={thread} />
            ))}
            </div>
        )}
      </div>
    </section>
  );
}
