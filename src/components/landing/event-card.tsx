'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Event } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { addEventInteraction } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';

function getPriceDisplay(event: Event) {
  if (event.priceType === 'free') return 'Free';
  if (event.priceType === 'donation') return 'Donation';
  if (event.minPrice) {
    return `$${event.minPrice}${event.maxPrice && event.maxPrice > event.minPrice ? ` - $${event.maxPrice}` : ''}`;
  }
  return 'Paid';
}

export default function EventCard({ event }: { event: Event }) {
  const { user, setPrompted } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to event page
    if (!user) {
      setPrompted(true);
      const continueUrl = `/events/${event.id}`;
      router.push(`/login?continueUrl=${encodeURIComponent(continueUrl)}`);
    } else {
      try {
        await addEventInteraction(user.id, event.id, 'saved');
        toast({ title: "Event saved!" });
      } catch (error) {
        toast({ variant: 'destructive', title: "Could not save event." });
      }
    }
  };
  
  if (!event.startTime) return null;

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <Link href={`/events/${event.id}`}>
          <div className="aspect-[16/9] w-full">
            {event.coverImageUrl && (
              <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                className="object-cover"
              />
            )}
          </div>
        </Link>
        <Badge variant="secondary" className="absolute top-3 left-3">
          {format(event.startTime.toDate(), 'MMM d')}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-primary">{event.category.toUpperCase()}</p>
          <Link href={`/events/${event.id}`}>
            <h3 className="mt-1 font-headline text-lg font-semibold leading-tight text-slate-800 group-hover:text-primary">
              {event.title}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-slate-500">{event.location?.neighborhood || event.city}</p>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-sm font-medium text-slate-700">
              {getPriceDisplay(event)}
            </p>
            <p className="text-xs text-slate-500">
              {format(event.startTime.toDate(), 'h:mm a')}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleSave}>
            <Bookmark className="mr-1.5 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
