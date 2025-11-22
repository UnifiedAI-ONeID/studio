'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createVenue, uploadImage } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const venueTypes = ['cafe', 'bar', 'gallery', 'ngo', 'venue', 'other'];

const venueFormSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  type: z.string({ required_error: 'Please select a type.' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters.' }),
  address: z.string().min(5, { message: 'Please enter a valid address.' }),
  neighborhood: z.string().min(3, { message: 'Please enter a neighborhood.' }),
  priceLevel: z.coerce.number().min(1).max(4),
  coverImage: z.any().refine(file => file instanceof File, 'Cover image is required.'),
});

export default function NewVenuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);

  const form = useForm<z.infer<typeof venueFormSchema>>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: '',
      description: '',
      address: '',
      neighborhood: '',
      priceLevel: 2,
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

  const onSubmit = async (values: z.infer<typeof venueFormSchema>) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'You must be logged in to add a place.' });
      return;
    }

    setIsLoading(true);
    try {
      let coverImageUrl = '';
      if (values.coverImage) {
        const imageFile = values.coverImage as File;
        const imagePath = `venues/${user.uid}/${Date.now()}_${imageFile.name}`;
        coverImageUrl = await uploadImage(imagePath, imageFile);
      }

      const venueData = {
        name: values.name,
        type: values.type,
        description: values.description,
        address: values.address,
        neighborhood: values.neighborhood,
        priceLevel: values.priceLevel,
        coverImageUrl,
        // Mocked/default values
        location: { latitude: 0, longitude: 0 }, 
        openingHours: 'Not specified',
        tags: [],
      };

      const venueId = await createVenue(venueData, user.uid);

      toast({
        title: 'Place Submitted!',
        description: 'Your submission will be reviewed and will appear on the directory once verified.',
      });
      router.push(`/directory/${venueId}`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Failed to add place',
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
          <CardTitle className="font-headline text-3xl">Add a Place</CardTitle>
          <FormDescription>Fill out the details below to add a new place to the directory.</FormDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Place Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., The Daily Grind" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {venueTypes.map((cat) => (
                          <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
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
                    </FormControl>
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
                        placeholder="Tell us about this place..."
                        className="resize-y"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main St, San Francisco, CA 94105" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Neighborhood</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SoMa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Level (1-4)</FormLabel>
                     <Select onValueChange={(val) => field.onChange(Number(val))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">$ (Inexpensive)</SelectItem>
                        <SelectItem value="2">$$ (Moderate)</SelectItem>
                        <SelectItem value="3">$$$ (Pricey)</SelectItem>
                        <SelectItem value="4">$$$$ (Very Expensive)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Place for Review'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
