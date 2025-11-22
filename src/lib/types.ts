import type { Timestamp } from 'firebase/firestore';

export interface DocumentWithId {
  id: string;
}

export interface AppUser extends DocumentWithId {
  displayName: string;
  photoURL?: string;
  email?: string;
  bio?: string;
  homeCity?: string;
  interests?: string[];
  skills?: string[];
  locationPreferences?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type PriceType = 'free' | 'paid' | 'donation';
export type EventStatus = 'draft' | 'pending_review' | 'published' | 'archived';
export type EventVisibility = 'public' | 'unlisted';

export interface Event extends DocumentWithId {
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  tags?: string[];
  startTime: Timestamp;
  endTime?: Timestamp;
  timezone: string;
  city: string;
  location: {
    venueId?: string;
    address?: string;
    neighborhood?: string;
    lat?: number;
    lng?: number;
  };
  priceType: PriceType;
  minPrice?: number;
  maxPrice?: number;
  coverImageUrl?: string;
  ticketUrl?: string;
  hostId: string;
  hostType?: 'user' | 'organization';
  status: EventStatus;
  visibility: EventVisibility;
  isFeaturedOnLanding?: boolean;
  homepageSection?: 'hero' | 'this_weekend' | 'editors_pick';
  priorityScore?: number;
  stats: {
    interestedCount: number;
    goingCount: number;
    savedCount: number;
    viewCount?: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Venue extends DocumentWithId {
  name: string;
  slug?: string;
  description?: string;
  categories: string[];
  homepageTagline?: string;
  address: string;
  city: string;
  neighborhood?: string;
  lat?: number;
  lng?: number;
  website?: string;
  phone?: string;
  openingHours?: { day: string; open: string; close: string }[];
  priceLevel?: 1 | 2 | 3 | 4;
  coverImageUrl?: string;
  isFeaturedOnLanding?: boolean;
  stats: {
    ratingAverage?: number;
    ratingCount?: number;
    eventCount?: number;
  };
  createdBy: string;
  status?: 'pending_review' | 'approved';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Organization extends DocumentWithId {
  name: string;
  description?: string;
  city?: string;
  website?: string;
  social?: { platform: string; url: string }[];
  coverImageUrl?: string;
  ownerUserId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CommonsThread extends DocumentWithId {
  title: string;
  body: string;
  topic: string;
  city?: string;
  tags?: string[];
  authorId: string;
  authorInfo?: {
    // Denormalized author data for performance
    displayName: string;
    photoURL?: string;
  };
  relatedEventId?: string;
  relatedVenueId?: string;
  stats: {
    replyCount: number;
    viewCount: number;
    likeCount: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityAt: Timestamp;
}

export interface CommonsReply extends DocumentWithId {
  threadId: string;
  authorId: string;
  body: string;
  parentReplyId?: string;
  authorInfo?: {
    // Denormalized author data for performance
    displayName: string;
    photoURL?: string;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type EventInteractionType = 'saved' | 'interested' | 'going';

export interface EventInteraction extends DocumentWithId {
  eventId: string;
  userId: string;
  type: EventInteractionType;
  createdAt: Timestamp;
}

export type FollowTargetType = 'user' | 'organization' | 'venue' | 'topic';

export interface Follow extends DocumentWithId {
  followerUserId: string;
  targetType: FollowTargetType;
  targetId: string;
  createdAt: Timestamp;
}

export type NotificationType = 'thread_reply' | 'mention' | 'event_update';

export interface Notification extends DocumentWithId {
  userId: string;
  type: NotificationType;
  refId?: string;
  title: string;
  body: string;
  createdAt: Timestamp;
  read: boolean;
}

export interface LandingConfig {
  defaultCity: string;
  featuredEventIds?: string[];
  featuredVenueIds?: string[];
  highlightedTopics?: string[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  city?: string;
  createdAt: Timestamp;
}

export interface AppRoles {
  admins: { [uid: string]: boolean };
}

export type ReportType = 'thread' | 'comment';

export interface Report {
    id: string;
    type: ReportType;
    targetId: string;
    reason: string;
    createdBy: string;
    createdAt: Timestamp;
}

export interface Reaction {
    id: string;
    userId: string;
    targetId: string;
    targetType: 'thread' | 'comment';
    type: 'like';
    createdAt: Timestamp;
}
