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
import { EventPlaceholder } from '../ui/placeholders';


function EventCard({
  rec,
}: {
  rec: PersonalizedEventRecommendationsOutput['recommendations'][0];
}) {
  return (
    <Link href="#">
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-40 w-full bg-muted flex items-center justify-center">
          <EventPlaceholder className="w-16 h-16 text-muted-foreground/30" />
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
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const input: PersonalizedEventRecommendationsInput = {
          userProfile: {
            interests: user.interests || [],
            age: 30, // Mock age, can be replaced with real data if available
            location: user.locationPreferences?.[0],
          },
          userLocation: user.locationPreferences?.[0] || 'San Francisco, CA', // Use user's preferred location or a default
          currentTime: new Date().toISOString(),
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

  if (!user) {
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
