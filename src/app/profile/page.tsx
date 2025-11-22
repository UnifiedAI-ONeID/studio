'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ProfilePage() {
  const { user } = useAuth();
  const userInitial = user?.displayName?.charAt(0).toUpperCase() || '?';

  return (
    <div className="container mx-auto">
      <h1 className="font-headline text-3xl font-bold mb-6">Profile</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
              <AvatarFallback className="text-3xl">{userInitial}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.displayName}</CardTitle>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            More profile settings and details will be available here soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
