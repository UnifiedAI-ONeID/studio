
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createThread } from '@/lib/firebase/firestore';
import { useDebounce } from '@/hooks/use-debounce';
import { enrichThreadContent, EnrichThreadContentOutput } from '@/ai/flows/enrich-thread-content';

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
import { Badge } from '@/components/ui/badge';
import { Wand2 } from 'lucide-react';

const topics = ["general", "neighborhoods", "buy-sell", "housing", "clubs", "events"];

export default function NewThreadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const relatedEventId = searchParams.get('relatedEventId');
  const relatedVenueId = searchParams.get('relatedVenueId');
  
  const [title, setTitle] = useState(searchParams.get('title') || '');
  const [body, setBody] = useState('');
  const [topic, setTopic] = useState(searchParams.get('topic') || '');
  const [tags, setTags] = useState<string[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<EnrichThreadContentOutput | null>(null);

  const debouncedBody = useDebounce(body, 1000);
  
  const [errors, setErrors] = useState<{title?: string, body?: string, topic?: string}>({});
  
  useEffect(() => {
    if (!authLoading && !user) {
        const currentPath = `/commons/new?${searchParams.toString()}`;
        router.push(`/login?continueUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, router, searchParams]);
  
  useEffect(() => {
      if (debouncedBody && debouncedBody.length > 50) {
          async function getSuggestions() {
            setIsAiLoading(true);
            try {
                const suggestions = await enrichThreadContent(debouncedBody);
                setAiSuggestions(suggestions);
                if (!title && suggestions.title) {
                    setTitle(suggestions.title);
                }
            } catch (error) {
                console.error("AI suggestion failed:", error);
            } finally {
                setIsAiLoading(false);
            }
          }
          getSuggestions();
      }
  }, [debouncedBody, title]);
  
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    if (aiSuggestions?.tags) {
       setAiSuggestions({...aiSuggestions, tags: aiSuggestions.tags.filter(t => t !== tag) });
    }
  }
  
  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  }

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
        relatedEventId: relatedEventId || undefined,
        relatedVenueId: relatedVenueId || undefined,
        tags: tags,
        city: user.homeCity,
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

  if (authLoading || !user) {
      return (
        <div className="container mx-auto max-w-2xl py-8">
            <Card>
                <CardHeader>
                  <CardTitle className="font-headline text-3xl">Start a New Thread</CardTitle>
                  <CardDescription>Share something with the community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Authenticating...</p>
                </CardContent>
            </Card>
        </div>
      )
  }

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
               <Select onValueChange={setTopic} value={topic}>
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
                placeholder="Write your main post here... the AI will suggest a title and tags after you write a bit."
                className="resize-y"
                rows={8}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
              {errors.body && <p className="text-sm font-medium text-destructive">{errors.body}</p>}
            </div>
            
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wand2 className={`h-4 w-4 ${isAiLoading ? 'animate-pulse' : ''}`} />
                    <span>AI Suggestions</span>
                </div>
                {aiSuggestions?.tags && aiSuggestions.tags.length > 0 && (
                     <div className="space-y-2">
                         <Label>Suggested Tags</Label>
                         <div className="flex flex-wrap gap-2">
                             {aiSuggestions.tags.map(tag => (
                                 <Button key={tag} type="button" variant="outline" size="sm" onClick={() => addTag(tag)}>
                                     + {tag}
                                 </Button>
                             ))}
                         </div>
                     </div>
                )}
                 {tags.length > 0 && (
                    <div className="space-y-2">
                        <Label>Your Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-sm">
                                    {tag}
                                    <button type="button" onClick={() => removeTag(tag)} className="ml-2 rounded-full hover:bg-white/20 p-0.5">
                                        &times;
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                 )}
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
