import type { User as FirebaseUser } from 'firebase/auth';

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
  name: string;
  description: string;
  date: string; // ISO 8601 format
  location: string;
  organizerId: string;
  imageUrl?: string;
  imageHint?: string;
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
  authorName: string;
  authorPhotoURL: string | null;
  timestamp: number; // Firestore server timestamp
  likes: string[]; // Array of user UIDs
}
