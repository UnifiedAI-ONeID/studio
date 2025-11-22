'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import FeaturedEventsGrid from './featured-events-grid';

export default function LandingHero() {
  // Hard-coded city for now
  const city = 'San Francisco';
  const dateFilters = ['Today', 'Tomorrow', 'This weekend'];
  const categoryFilters = ['Music', 'Food & Drink', 'Arts'];

  return (
    <section className="border-b bg-slate-50/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:py-16 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            What's on in <span className="text-primary">{city}</span> this week
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Discover and connect with the best events, places, and people in your city.
          </p>

          <div className="mt-8 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search events, venues, and more..."
                className="h-11 rounded-xl border-none bg-slate-100 pl-10 focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {dateFilters.map(filter => (
                <Button key={filter} variant="outline" size="sm" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                  {filter}
                </Button>
              ))}
               {categoryFilters.map(filter => (
                <Button key={filter} variant="outline" size="sm" className="rounded-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          
           <div className="mt-6 flex items-center gap-4">
            <Button size="lg" className="rounded-xl px-8">Browse events</Button>
            <Button size="lg" variant="outline" className="rounded-xl bg-white px-8">Host an event</Button>
          </div>
        </div>
        <div className="flex items-center">
            <FeaturedEventsGrid />
        </div>
      </div>
    </section>
  );
}
