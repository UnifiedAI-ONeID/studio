'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPersonalizedEventRecommendations } from '@/ai/flows/personalized-event-recommendations';
import type { PersonalizedEventRecommendationsOutput } from '@/ai/flows/personalized-event-recommendations';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { MapPin, Calendar, Percent } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>
      <CardFooter className="flex-col items-start gap-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </CardFooter>
    </Card>
  );
}

export default function RecommendedEvents() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<PersonalizedEventRecommendationsOutput['recommendations']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchRecommendations = async () => {
        try {
          setLoading(true);
          const result = await getPersonalizedEventRecommendations({
            userProfile: {
              interests: user.interests || ['live music', 'technology'],
              age: 28,
              location: user.locationPreferences?.[0] || 'San Francisco, CA',
            },
            userLocation: 'San Francisco, CA', // Mocked as per guidance
            currentTime: new Date().toISOString(),
          });
          setRecommendations(result.recommendations);
        } catch (err) {
          console.error('Failed to get event recommendations:', err);
          setError('Could not load event recommendations at this time.');
        } finally {
          setLoading(false);
        }
      };
      fetchRecommendations();
    }
  }, [user]);

  const concertImage = PlaceHolderImages.find(p => p.id === 'event-concert');
  const techImage = PlaceHolderImages.find(p => p.id === 'event-tech-meetup');

  if (loading) {
    return (
      <section>
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Events</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Events</h2>
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-center text-destructive">
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Events</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((event, index) => {
          const image = index % 2 === 0 ? concertImage : techImage;
          return (
            <Card key={event.eventName} className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
              {image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={image.imageUrl}
                    alt={event.eventName}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="font-headline text-xl">{event.eventName}</CardTitle>
                <CardDescription className="line-clamp-2">{event.eventDescription}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> <span>{new Date(event.eventTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> <span>{event.eventLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" /> <span>{Math.round(event.relevanceScore * 100)}% Match</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-accent hover:bg-accent/90">View Details</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
