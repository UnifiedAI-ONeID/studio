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

export interface CommonsPost {
  id: string;
  content: string;
  authorId: string;
  authorName:string;
  authorPhotoURL: string | null;
  timestamp: number; // Firestore server timestamp
  likes: string[]; // Array of user UIDs
}
