'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getPersonalizedDirectoryRecommendations } from '@/ai/flows/personalized-directory-recommendations';
import type { PersonalizedDirectoryRecommendationsOutput } from '@/ai/flows/personalized-directory-recommendations';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { MapPin, Star } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '../ui/badge';

function DirectoryCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-1" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

export default function RecommendedDirectory() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<PersonalizedDirectoryRecommendationsOutput>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const fetchRecommendations = async () => {
        try {
          setLoading(true);
          const result = await getPersonalizedDirectoryRecommendations({
            userProfile: {
              interests: user.interests || ['coffee', 'reading', 'startups'],
              skills: user.skills || ['development', 'design'],
              locationPreferences: user.locationPreferences || ['downtown'],
            },
            userLocation: 'San Francisco, CA',
            currentTime: new Date().toISOString(),
            numberOfRecommendations: 3,
          });
          setRecommendations(result);
        } catch (err) {
          console.error('Failed to get directory recommendations:', err);
          setError('Could not load directory recommendations at this time.');
        } finally {
          setLoading(false);
        }
      };
      fetchRecommendations();
    } else {
        setLoading(false);
    }
  }, [user]);

  const coffeeImage = PlaceHolderImages.find(p => p.id === 'directory-coffee-shop');
  const coworkingImage = PlaceHolderImages.find(p => p.id === 'directory-coworking');
  const bookstoreImage = PlaceHolderImages.find(p => p.id === 'directory-bookstore');
  const imageMap = [coffeeImage, coworkingImage, bookstoreImage];

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <section>
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Places to Check Out</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <DirectoryCardSkeleton />
          <DirectoryCardSkeleton />
          <DirectoryCardSkeleton />
        </div>
      </section>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Don't show the component if there's an error or no recommendations
  }

  return (
    <section>
      <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Places to Check Out</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item, index) => {
          const image = imageMap[index % imageMap.length];
          return (
            <Card key={item.name} className="flex flex-col overflow-hidden shadow-md transition-shadow hover:shadow-lg">
              {image && (
                <div className="relative h-40 w-full">
                  <Image
                    src={image.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    data-ai-hint={image.imageHint}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="font-headline text-xl">{item.name}</CardTitle>
                  <Badge variant="secondary" className="whitespace-nowrap">{item.category}</Badge>
                </div>
                <div className="flex items-center gap-1 pt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm text-muted-foreground">{item.suitabilityScore.toFixed(1)} suitability</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <CardDescription className="line-clamp-3">{item.description}</CardDescription>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> <span>{item.location}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
