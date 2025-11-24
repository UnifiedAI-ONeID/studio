
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getPersonalizedEventRecommendations,
  PersonalizedEventRecommendationsInput,
  PersonalizedEventRecommendationsOutput,
} from '@/ai/flows/personalized-event-recommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import PlaceHolderImages from '@/lib/placeholder-images';


function EventCard({
  rec,
}: {
  rec: PersonalizedEventRecommendationsOutput['recommendations'][0];
}) {
  const placeholder = PlaceHolderImages.find(p => p.id.includes('event')) || PlaceHolderImages[0];
  return (
    <Link href={`/events/${rec.eventId}`}>
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-40 w-full bg-muted flex items-center justify-center">
            <Image
                src={rec.coverImageUrl || placeholder.imageUrl}
                alt={rec.eventName}
                fill
                className="object-cover"
                data-ai-hint={placeholder.imageHint}
            />
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-lg line-clamp-2">
            {rec.eventName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">&quot;{rec.reason}&quot;</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function RecommendedEvents() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] =
    useState<PersonalizedEventRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const input: PersonalizedEventRecommendationsInput = {
          userProfile: {
            interests: user.interests || [],
            homeCity: user.homeCity,
          },
          count: 4,
        };

        const result = await getPersonalizedEventRecommendations(input);
        setRecommendations(result);
      } catch (error) {
        console.error('Failed to get event recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user]);

  if (!user || (!loading && (!recommendations || recommendations.recommendations.length === 0))) {
      return null;
  }

  if (loading) {
    return (
      <section>
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Events</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Events</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recommendations.recommendations.map((rec, index) => (
          <EventCard key={index} rec={rec} />
        ))}
      </div>
    </section>
  );
}
