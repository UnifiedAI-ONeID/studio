'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

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
import { Input } from '@/componentsui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createEvent, uploadImage } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const categories = ['Music', 'Food & Drink', 'Talks', 'Sports', 'Arts', 'Networking', 'Other'];

const eventFormSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  category: z.string({ required_error: 'Please select a category.' }),
  startTime: z.date({ required_error: 'An event date is required.' }),
  priceType: z.enum(['free', 'paid', 'donation']),
  priceMin: z.coerce.number().optional(),
  coverImage: z.any().refine(file => file, 'Cover image is required.'),
});

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: '',
      description: '',
      priceType: 'free',
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue('coverImage', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create an event.' });
      return;
    }

    setIsLoading(true);
    try {
      let coverImageUrl = '';
      if (coverImagePreview) {
        const imagePath = `events/${user.uid}/${Date.now()}_${values.coverImage.name}`;
        coverImageUrl = await uploadImage(imagePath, coverImagePreview);
      }

      const eventData = {
        title: values.title,
        description: values.description,
        category: values.category,
        startTime: Timestamp.fromDate(values.startTime),
        priceType: values.priceType,
        priceMin: values.priceMin,
        coverImageUrl,
        tags: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hostId: user.uid,
        status: 'published' as const,
        visibility: 'public' as const,
      };

      const eventId = await createEvent(eventData, user.uid);

      toast({
        title: 'Event Created!',
        description: 'Your event has been submitted for approval.',
      });
      router.push(`/events/${eventId}`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to create event',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Create a New Event</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Music Festival" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image</FormLabel>
                    <FormControl>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {coverImagePreview ? (
                            <img src={coverImagePreview} alt="Cover preview" className="mx-auto h-48 w-auto" />
                          ) : (
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                          )}
                          <div className="flex text-sm text-muted-foreground">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                            >
                              <span>Upload a file</span>
                              <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP HH:mm')
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                        <div className="p-3 border-t">
                            <Input
                                type="time"
                                onChange={(e) => {
                                    const [hours, minutes] = e.target.value.split(':');
                                    const newDate = new Date(field.value);
                                    newDate.setHours(parseInt(hours), parseInt(minutes));
                                    field.onChange(newDate);
                                }}
                            />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more about your event..."
                        className="resize-y"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="donation">Donation</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch('priceType') === 'paid' && (
                <FormField
                  control={form.control}
                  name="priceMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="25.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
