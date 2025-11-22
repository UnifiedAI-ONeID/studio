'use client';

import RecommendedEvents from '@/components/ai/recommended-events';
import RecommendedDirectory from '@/components/ai/recommended-directory';
import { useAuth } from '@/hooks/use-auth';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
          Welcome, {user?.displayName || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here’s what’s happening in your community.
        </p>
      </div>

      <RecommendedEvents />
      <RecommendedDirectory />
    </div>
  );
}
