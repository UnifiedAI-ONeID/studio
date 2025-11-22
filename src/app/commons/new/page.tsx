'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createThread } from '@/lib/firebase/firestore';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const topics = ["general", "neighborhoods", "buy-sell", "housing", "clubs"];

export default function NewThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const relatedEventId = searchParams.get('relatedEventId');
  const relatedVenueId = searchParams.get('relatedVenueId');
  
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  
  const [errors, setErrors] = useState<{title?: string, body?: string, topic?: string}>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a thread.' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const threadData = {
        title,
        body,
        topic,
        createdBy: user.uid,
        relatedEventId: relatedEventId || undefined,
        relatedVenueId: relatedVenueId || undefined,
        tags: [],
      };
      
      const threadId = await createThread(threadData, user);

      toast({ title: 'Thread created!' });
      router.push(`/commons/${threadId}`);
    } catch (error: any) {
      console.error(error);
      if (error.code === 'validation-error') {
        setErrors(error.details);
        toast({
            variant: 'destructive',
            title: 'Please fix the errors below',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to create thread',
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Start a New Thread</CardTitle>
          <CardDescription>Share something with the community.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor='title'>Title</Label>
              <Input id='title' placeholder="What's your thread about?" value={title} onChange={(e) => setTitle(e.target.value)} />
              {errors.title && <p className="text-sm font-medium text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label>Topic</Label>
               <Select onValueChange={setTopic} defaultValue={topic}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a topic" />
                  </SelectTrigger>
                <SelectContent>
                  {topics.map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.topic && <p className="text-sm font-medium text-destructive">{errors.topic}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor='body'>Content</Label>
              <Textarea
                id='body'
                placeholder="Write your main post here..."
                className="resize-y"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {errors.body && <p className="text-sm font-medium text-destructive">{errors.body}</p>}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Posting...' : 'Post Thread'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
