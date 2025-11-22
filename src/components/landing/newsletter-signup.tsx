'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addNewsletterSubscriber } from '@/lib/firebase/firestore';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        toast({
            variant: 'destructive',
            title: 'Please enter your email.',
        });
        return;
    }
    
    setLoading(true);
    try {
        await addNewsletterSubscriber(email);
        toast({
            title: 'Subscribed!',
            description: "Thanks for joining our mailing list. You'll be the first to know what's new.",
        });
        setEmail('');
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Subscription failed.',
            description: 'Please try again later.',
        });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-primary/10 p-6 sm:p-8">
      <div className="mx-auto max-w-xl text-center">
        <h3 className="font-headline text-2xl font-bold text-white">
          Get the best of the week, in your inbox.
        </h3>
        <p className="mt-2 text-slate-300">
          Stay up to date with the latest events and community happenings.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Input
            type="email"
            placeholder="Enter your email"
            className="h-12 border-slate-500 bg-slate-700/50 text-white placeholder:text-slate-400 focus:border-primary focus:ring-primary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Button type="submit" size="lg" className="h-12" disabled={loading}>
            {loading ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </div>
    </div>
  );
}
