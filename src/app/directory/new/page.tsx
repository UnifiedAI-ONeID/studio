
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload } from 'lucide-react';

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
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { createVenue, uploadImage } from '@/lib/firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AppUser } from '@/lib/types';

const venueCategories = ["Live music", "Bar", "Restaurant", "Cafe", "Art Gallery", "Theater", "Club", "Park", "Other"];


export default function NewVenuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [priceLevel, setPriceLevel] = useState(2);
  const [coverImage, setCoverImage] = useState<File | null>(null);
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
      toast({ variant: 'destructive', title: 'You must be logged in to add a place.' });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      let coverImageUrl = '';
      if (coverImage) {
        const imageFile = coverImage as File;
        const imagePath = `venueCovers/${user.id}/${Date.now()}_${imageFile.name}`;
        coverImageUrl = await uploadImage(imagePath, imageFile);
      }

      const venueData = {
        name,
        categories,
        description,
        address,
        neighborhood,
        city: user.homeCity,
        priceLevel,
        coverImageUrl,
      };

      const venueId = await createVenue(venueData, user as AppUser);

      toast({
        title: 'Place Submitted!',
        description: 'Your submission will be reviewed and will appear on the directory once verified.',
      });
      router.push(`/directory/${venueId}`);
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
          title: 'Failed to add place',
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
          <CardTitle className="font-headline text-3xl">Add a Place</CardTitle>
          <CardDescription>Fill out the details below to add a new place to the directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className='space-y-2'>
              <Label htmlFor='name'>Place Name</Label>
              <Input id='name' placeholder="e.g., The Daily Grind" value={name} onChange={(e) => setName(e.target.value)} />
              {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Categories</Label>
               <Select onValueChange={(val) => setCategories(val ? [val] : [])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a primary category" />
                </SelectTrigger>
                <SelectContent>
                  {venueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categories && <p className="text-sm font-medium text-destructive">{errors.categories}</p>}
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

             <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                placeholder="Tell us about this place..."
                className="resize-y"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              {errors.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='address'>Address</Label>
              <Input id='address' placeholder="123 Main St, San Francisco, CA 94105" value={address} onChange={(e) => setAddress(e.target.value)} />
              {errors.address && <p className="text-sm font-medium text-destructive">{errors.address}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='neighborhood'>Neighborhood</Label>
              <Input id='neighborhood' placeholder="e.g., SoMa" value={neighborhood} onChange={(e) => setNeighborhood(e.target.value)} />
              {errors.neighborhood && <p className="text-sm font-medium text-destructive">{errors.neighborhood}</p>}
            </div>

            <div className='space-y-2'>
              <Label>Price Level (1-4)</Label>
               <Select onValueChange={(val) => setPriceLevel(Number(val))} defaultValue={String(priceLevel)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select price level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">$ (Inexpensive)</SelectItem>
                  <SelectItem value="2">$$ (Moderate)</SelectItem>
                  <SelectItem value="3">$$$ (Pricey)</SelectItem>
                  <SelectItem value="4">$$$$ (Very Expensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit Place for Review'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
