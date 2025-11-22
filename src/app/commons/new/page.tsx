'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createThread } from '@/lib/firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const topics = ["general", "neighborhoods", "buy-sell", "housing", "clubs"];

const threadFormSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100, 'Title is too long.'),
  body: z.string().min(10, 'Body must be at least 10 characters.').max(10000, 'Body is too long.'),
  topic: z.string({ required_error: 'Please select a topic.' }),
});

export default function NewThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const relatedEventId = searchParams.get('relatedEventId');
  const relatedVenueId = searchParams.get('relatedVenueId');
  const defaultTitle = searchParams.get('title') || '';
  const defaultTopic = searchParams.get('topic') || undefined;

  const form = useForm<z.infer<typeof threadFormSchema>>({
    resolver: zodResolver(threadFormSchema),
    defaultValues: {
      title: defaultTitle,
      body: '',
      topic: defaultTopic,
    },
  });

  const onSubmit = async (values: z.infer<typeof threadFormSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create a thread.' });
      return;
    }

    setIsLoading(true);
    try {
      const threadData = {
        ...values,
        createdBy: user.uid,
        relatedEventId: relatedEventId || undefined,
        relatedVenueId: relatedVenueId || undefined,
        tags: [], // Tags can be added later
      };
      
      const threadId = await createThread(threadData, user);

      toast({ title: 'Thread created!' });
      router.push(`/commons/${threadId}`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to create thread',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Start a New Thread</CardTitle>
          <FormDescription>Share something with the community.</FormDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="What's your thread about?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a topic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {topics.map(topic => (
                            <SelectItem key={topic} value={topic} className="capitalize">{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write your main post here..."
                        className="resize-y"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Posting...' : 'Post Thread'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
