
import type { Timestamp } from 'firebase/firestore';

export interface DocumentWithId {
  id: string;
}

export interface AppUser extends DocumentWithId {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  interests?: string[];
  skills?: string[];
  locationPreferences?: string[];
  homeCity?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSampleData?: boolean;
}

export type PriceType = "free" | "paid" | "donation";
export type EventStatus = "draft" | "published" | "cancelled";
export type EventVisibility = "public" | "private";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Event extends DocumentWithId {
  title: string;
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
  };
  hostId: string;
  coverImageUrl?: string;
  priceType: PriceType;
  priceMin?: number;
  priceMax?: number;
  status: EventStatus;
  visibility: EventVisibility;
  approvalStatus: ApprovalStatus;
  stats: {
    interestedCount: number;
    goingCount: number;
    savedCount: number;
    viewCount: number;
  };
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isFeaturedOnLanding?: boolean;
  priorityScore?: number;
}

export interface Venue extends DocumentWithId {
  name: string;
  categories: string[];
  description?: string;
  address: string;
  neighborhood: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: string;
  priceLevel?: number;
  tags?: string[];
  coverImageUrl?: string;
  status: 'pending_review' | 'approved';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isFeaturedOnLanding?: boolean;
  homepageTagline?: string; // This was in seed data but not schema, adding for consistency
}

export type ThreadTopic = "general" | "neighborhoods" | "buy-sell" | "housing" | "clubs" | "events";

export interface CommonsThread extends DocumentWithId {
  title: string;
  body: string;
  bodyPreview?: string;
  topic: ThreadTopic;
  city?: string;
  tags?: string[];
  relatedEventId?: string;
  relatedVenueId?: string;
  authorId: string;
  authorInfo?: {
    displayName: string;
    photoURL?: string;
  };
  lastActivityAt: Timestamp;
  stats: {
    replyCount: number;
    likeCount: number;
    viewCount: number;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSampleData?: boolean;
}

export interface CommonsReply extends DocumentWithId {
  threadId: string;
  parentId?: string;
  body: string;
  createdBy: string;
  authorId: string; // for consistency with threads
  authorInfo?: {
      displayName: string;
      photoURL?: string;
  };
  likeCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isSampleData?: boolean;
}

export type ReportType = "thread" | "comment";

export interface Report extends DocumentWithId {
  type: ReportType;
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
export type ReactionTargetType = 'thread' | 'comment';

export interface Reaction extends DocumentWithId {
  userId: string;
  targetId: string;
  targetType: ReactionTargetType;
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

export interface LandingConfig {
  defaultCity: string;
  featuredEventIds?: string[];
  featuredVenueIds?: string[];
  highlightedTopics?: string[];
  isSampleData?: boolean;
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
