'use client';

import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto">
      <h1 className="font-headline text-3xl font-bold mb-6">Settings</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
           <CardDescription>
            Manage your account and application settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More settings for notifications, privacy, and personalization will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
