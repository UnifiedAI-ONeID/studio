import type { User as FirebaseUser } from 'firebase/auth';
import type { Timestamp } from 'firebase/firestore';

export interface AppUser extends DocumentWithId {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  interests?: string[];
  skills?: string[];
  locationPreferences?: string[];
}
export interface DocumentWithId {
  id: string;
}

export interface Event extends DocumentWithId {
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
  isFeaturedOnLanding?: boolean;
  priorityScore?: number;
  // For UI display
  neighborhood?: string;
  hostName?: string;
  venueName?: string;
  stats: {
    interestedCount: number;
    goingCount: number;
    savedCount: number;
  };
}

export interface Venue extends DocumentWithId {
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
  isFeaturedOnLanding?: boolean;
}

export interface DirectoryPlaceholder {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  contact?: string;
  imageUrl?: string;
  imageHint?: string;
}

export interface Thread extends DocumentWithId {
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
    likeCount?: number;
}

export interface Comment extends DocumentWithId {
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
    likeCount?: number;
}

export interface Report {
    id: string;
    type: 'thread' | 'comment';
    targetId: string;
    reason: string;
    createdBy: string;
    createdAt: Timestamp;
}

export type FollowTargetType = 'venue' | 'topic' | 'organization' | 'user';

export interface Follow extends DocumentWithId {
    userId: string;
    targetId: string;
    targetType: FollowTargetType;
    createdAt: Timestamp;
}

export type ReactionType = 'like';

export interface Reaction extends DocumentWithId {
    userId: string;
    targetId: string;
    targetType: 'thread' | 'comment';
    type: ReactionType;
    createdAt: Timestamp;
}

export type EventInteractionType = 'interested' | 'going' | 'saved';

export interface EventInteraction extends DocumentWithId {
    userId: string;
    eventId: string;
    type: EventInteractionType;
    createdAt: Timestamp;
}

    