
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { seedDatabase } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SeedPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);
    const seedResult = await seedDatabase();
    setResult(seedResult);
    setIsLoading(false);
    toast({
      title: seedResult.success ? 'Success!' : 'Error!',
      description: seedResult.message,
      variant: seedResult.success ? 'default' : 'destructive',
    });
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Seed Firestore Database</CardTitle>
          <CardDescription>
            Click the button below to populate your Firestore database with placeholder data. This will add documents to the 'events', 'venues', and 'threads' collections.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-sm text-destructive font-medium p-3 bg-destructive/10 rounded-md border border-destructive/20">
            <AlertTriangle className="inline h-4 w-4 mr-2" />
            Warning: This action will overwrite existing documents with the same IDs. This is intended for initial setup only.
          </p>
          <Button onClick={handleSeed} disabled={isLoading} size="lg" className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              'Seed Database'
            )}
          </Button>
          {result && (
             <div className={`flex items-center gap-2 p-3 rounded-md text-sm w-full ${result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {result.success ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                <span>{result.message}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
