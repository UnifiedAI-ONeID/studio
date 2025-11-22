'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  PersonalizedDirectoryRecommendationsInput,
  PersonalizedDirectoryRecommendationsOutput,
  getPersonalizedDirectoryRecommendations,
} from '@/ai/flows/personalized-directory-recommendations';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

function DirectoryCard({
  item,
}: {
  item: PersonalizedDirectoryRecommendationsOutput[0];
}) {
    const placeholder = PlaceHolderImages.find(p => p.id.includes('directory')) || PlaceHolderImages[0];
  return (
    <Link href="#">
      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
        <Image
          src={placeholder.imageUrl}
          alt={item.name}
          width={400}
          height={225}
          className="aspect-video w-full object-cover"
          data-ai-hint={placeholder.imageHint}
        />
        <div className="p-4">
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-muted-foreground">{item.category}</p>
        </div>
      </div>
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
      if (!user) return;

      try {
        const input: PersonalizedDirectoryRecommendationsInput = {
          userProfile: {
            interests: user.interests || [],
            skills: user.skills || [],
            locationPreferences: user.locationPreferences || [],
          },
          userLocation: 'San Francisco, CA', // Replace with dynamic location if available
          currentTime: new Date().toISOString(),
          numberOfRecommendations: 3,
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

  if (loading) {
    return (
      <section>
        <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Directory</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
          <Skeleton className="h-60 w-full" />
        </div>
      </section>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="font-headline text-2xl font-bold tracking-tight mb-4">For You: Directory</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((item, index) => (
          <DirectoryCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
}
