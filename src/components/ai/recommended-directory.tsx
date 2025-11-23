
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  getPersonalizedDirectoryRecommendations,
  PersonalizedDirectoryRecommendationsInput,
  PersonalizedDirectoryRecommendationsOutput,
} from '@/ai/flows/personalized-directory-recommendations';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import PlaceHolderImages from '@/lib/placeholder-images';
import Image from 'next/image';

function DirectoryCard({
  item,
}: {
  item: PersonalizedDirectoryRecommendationsOutput['recommendations'][0];
}) {
    const placeholder = PlaceHolderImages.find(p => p.id.includes('directory')) || PlaceHolderImages[0];
  return (
    <Link href={`/directory/${item.venueId}`}>
      <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg hover:-translate-y-1">
        <div className="relative h-40 w-full bg-muted flex items-center justify-center">
            <Image
                src={item.coverImageUrl || placeholder.imageUrl}
                alt={item.name}
                fill
                className="object-cover"
                data-ai-hint={placeholder.imageHint}
            />
        </div>
        <CardHeader>
          <CardTitle className="font-headline text-lg line-clamp-2">{item.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground italic">&quot;{item.reason}&quot;</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function RecommendedDirectory() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] =
    useState<PersonalizedDirectoryRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!user || !user.interests || user.interests.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const input: PersonalizedDirectoryRecommendationsInput = {
          userProfile: {
            interests: user.interests || [],
            homeCity: user.homeCity,
          },
          count: 3,
        };
        const result = await getPersonalizedDirectoryRecommendations(input);
        setRecommendations(result);
      } catch (error) {
        console.error('Failed to get directory recommendations:', error);
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
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Directory</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Directory</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.recommendations.map((item, index) => (
          <DirectoryCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
}
