
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal } from 'lucide-react';

export default function SeedPage() {
  
  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <Card className="max-w-xl w-full">
        <CardHeader>
          <CardTitle>Seed Firestore Database</CardTitle>
          <CardDescription>
            To populate your database with sample data, please run the following command from your project&apos;s terminal.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full bg-muted/50 p-4 rounded-lg border flex items-center gap-4">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <code className="text-sm font-mono">
                    npm run seed
                </code>
            </div>
            <p className="text-sm text-muted-foreground text-left w-full mt-2">
                This script uses the Firebase Admin SDK to safely add placeholder events, venues, and threads to your Firestore database. It is designed for initial setup and will not run if placeholder data is already detected.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
