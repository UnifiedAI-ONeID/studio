'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  PersonalizedEventRecommendationsInput,
  PersonalizedEventRecommendationsOutput,
} from '@/ai/flows/personalized-event-recommendations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function EventCard({
  rec,
}: {
  rec: PersonalizedEventRecommendationsOutput['recommendations'][0];
}) {
  const placeholder = PlaceHolderImages.find(p => p.id.includes('event')) || PlaceHolderImages[0];
  return (
    <Link href="#">
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-40 w-full">
          <Image
            src={placeholder.imageUrl}
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
          <p className="font-semibold">{rec.eventTime}</p>
          <p className="text-sm text-muted-foreground">{rec.eventLocation}</p>
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
      if (!user) return;
      try {
        const input: PersonalizedEventRecommendationsInput = {
          userProfile: {
            interests: user.interests || ['live music', 'tech'],
            age: 30, // Mock age
            location: user.locationPreferences?.[0] || 'San Francisco',
          },
          userLocation: 'San Francisco, CA', // Replace with dynamic location
          currentTime: new Date().toISOString(),
        };

        const response = await fetch('/api/genkit/personalizedEventRecommendationsFlow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch recommendations');
        }

        const result = await response.json();
        setRecommendations(result);
      } catch (error) {
        console.error('Failed to get event recommendations:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [user]);

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

  if (!recommendations || recommendations.recommendations.length === 0) {
    return null;
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
