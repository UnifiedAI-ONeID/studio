
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useCollection, useMemoFirebase } from '@/hooks/use-firebase-hooks';
import { createEvent, uploadImage } from '@/lib/firebase/firestore';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Venue } from '@/lib/types';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';


const categories = ['Music', 'Food & Drink', 'Talks', 'Sports', 'Arts', 'Networking', 'Other'];

export default function NewEventPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const venuesQuery = useMemoFirebase(() => query(collection(firestore, 'venues'), where('status', '==', 'approved'), orderBy('name')), []);
  const { data: venues } = useCollection<Venue>(venuesQuery);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState<Date | undefined>();
  const [priceType, setPriceType] = useState<'free' | 'paid' | 'donation'>('free');
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [venueId, setVenueId] = useState<string | undefined>();
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<{[key:string]: string}>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to create an event.' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      let coverImageUrl = '';
      if (coverImage) {
        const imageFile = coverImage as File;
        const imagePath = `eventCovers/${user.id}/${Date.now()}_${imageFile.name}`;
        coverImageUrl = await uploadImage(imagePath, imageFile);
      } else {
          // A cover image is required, handle error
          setErrors({ coverImageUrl: "Cover image is required." });
          setIsLoading(false);
          return;
      }

      const selectedVenue = venues?.find(v => v.id === venueId);

      const eventData = {
        title,
        description,
        category,
        startTime: startTime ? Timestamp.fromDate(startTime) : undefined,
        priceType,
        minPrice,
        coverImageUrl,
        location: {
            venueId: venueId,
            neighborhood: selectedVenue?.neighborhood,
            address: selectedVenue?.address
        },
        tags: [],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const eventId = await createEvent(eventData, user.id);

      toast({
        title: 'Event Submitted!',
        description: 'Your event has been submitted for approval and will be live shortly.',
      });
      router.push(`/events/${eventId}`);
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
            title: 'Failed to create event',
            description: error.message || 'An unexpected error occurred.',
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
          <CardTitle className="font-headline text-3xl">Create an Event</CardTitle>
          <CardDescription>Fill out the details below to post your event.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className='space-y-2'>
              <Label htmlFor='title'>Event Title</Label>
              <Input id='title' placeholder="e.g., Summer Music Festival" value={title} onChange={e => setTitle(e.target.value)} />
              {errors.title && <p className="text-sm font-medium text-destructive">{errors.title}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Category</Label>
              <Select onValueChange={setCategory} defaultValue={category}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm font-medium text-destructive">{errors.category}</p>}
            </div>
            
            <div className='space-y-2'>
              <Label>Cover Image</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {coverImagePreview ? (
                      <img src={coverImagePreview} alt="Cover preview" className="mx-auto h-48 w-auto rounded-md object-cover" />
                    ) : (
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    )}
                    <div className="flex text-sm text-muted-foreground justify-center">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:text-primary/80"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              {errors.coverImageUrl && <p className="text-sm font-medium text-destructive">{errors.coverImageUrl}</p>}
            </div>

            <div className='flex flex-col space-y-2'>
              <Label>Start Date and Time</Label>
              <Popover>
                <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startTime && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startTime ? (
                        format(startTime, 'PPP p')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startTime}
                    onSelect={setStartTime}
                    disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                    initialFocus
                  />
                   <div className="p-3 border-t border-border">
                      <Input
                          type="time"
                          defaultValue={startTime ? format(startTime, 'HH:mm') : ''}
                          onChange={(e) => {
                              const time = e.target.value;
                              const [hours, minutes] = time.split(':').map(Number);
                              const newDate = startTime ? new Date(startTime) : new Date();
                              newDate.setHours(hours, minutes);
                              setStartTime(newDate);
                          }}
                      />
                  </div>
                </PopoverContent>
              </Popover>
              {errors.startTime && <p className="text-sm font-medium text-destructive">{errors.startTime}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Venue</Label>
              <Select onValueChange={setVenueId} defaultValue={venueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a venue (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No specific venue</SelectItem>
                  {venues?.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id}>{venue.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Link your event to a place in the directory.</p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder="Tell us more about your event..."
                className="resize-y"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Price</Label>
               <Select onValueChange={(value) => setPriceType(value as any)} defaultValue={priceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="donation">Donation-based</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {priceType === 'paid' && (
              <div className='space-y-2'>
                <Label htmlFor='minPrice'>Price Amount ($)</Label>
                <Input id='minPrice' type="number" placeholder="25.00" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} step="0.01" min="0" />
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Event for Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

    