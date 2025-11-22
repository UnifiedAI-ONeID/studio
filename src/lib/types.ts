import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  interests?: string[];
  skills?: string[];
  locationPreferences?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  startTime: Timestamp;
  endTime?: Timestamp;
  timezone: string;
  venueId?: string;
  hostId: string;
  coverImageUrl: string;
  priceType: 'free' | 'paid' | 'donation';
  priceMin?: number;
  priceMax?: number;
  status: 'draft' | 'published' | 'cancelled';
  visibility: 'public' | 'private';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // For UI display
  neighborhood?: string;
  hostName?: string;
  venueName?: string;
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  description:string;
  address: string;
  neighborhood: string;
  location: { latitude: number; longitude: number };
  openingHours: string;
  priceLevel: number;
  tags: string[];
  coverImageUrl: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  verified: boolean;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  contact?: string;
  imageUrl?: string;
  imageHint?: string;
}

export interface Thread {
    id: string;
    title: string;
    body: string;
    topic: string;
    tags: string[];
    relatedEventId?: string;
    relatedVenueId?: string;
    createdBy: string;
    authorInfo: {
        displayName: string;
        photoURL: string | null;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
    lastActivityAt: Timestamp;
    replyCount: number;
}

export interface Comment {
    id: string;
    threadId: string;
    parentId: string | null;
    body: string;
    createdBy: string;
    authorInfo: {
        displayName: string;
        photoURL: string | null;
    };
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface Report {
    id: string;
    type: 'thread' | 'comment';
    targetId: string;
    reason: string;
    createdBy: string;
    createdAt: Timestamp;
}
