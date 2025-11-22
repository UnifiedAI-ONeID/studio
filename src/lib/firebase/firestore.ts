
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
  updateDoc,
  increment,
  writeBatch,
  query,
  where,
  getDocs,
  deleteDoc,
  collectionGroup,
  limit,
} from 'firebase/firestore';
import { firestore } from './index';
import type { User } from 'firebase/auth';
import type { AppUser, Event, Venue, CommonsThread, CommonsReply, FollowTargetType, EventInteractionType } from '@/lib/types';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { placeholderEvents, placeholderVenues, placeholderThreads } from './placeholder-data';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

// Custom error for validation
class ValidationError extends Error {
    code: string;
    details: {[key: string]: string};

    constructor(message: string, details: {[key: string]: string}) {
        super(message);
        this.name = 'ValidationError';
        this.code = 'validation-error';
        this.details = details;
    }
}


export const createUserProfile = async (user: User) => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { uid, email, displayName, photoURL } = user;
    const profileData = {
      displayName: displayName || email?.split('@')[0] || 'Anonymous',
      photoURL: photoURL || `https://i.pravatar.cc/150?u=${uid}`,
      email: email,
      bio: '',
      homeCity: 'San Francisco',
      interests: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    await setDoc(userRef, profileData)
    .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: profileData,
        }));
        throw serverError;
    });
  }
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() } as AppUser;
  }

  return null;
};

export const uploadImage = async (
  path: string,
  file: File
): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

type CreateEventData = Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'hostId' | 'stats' | 'city'>>;

export const createEvent = async (
  eventData: CreateEventData,
  userId: string
): Promise<string> => {
    const errors: {[key: string]: string} = {};
    if (!eventData.title || eventData.title.length < 3) errors.title = 'Title must be at least 3 characters.';
    if (!eventData.description || eventData.description.length < 10) errors.description = 'Description must be at least 10 characters.';
    if (!eventData.category) errors.category = 'Please select a category.';
    if (!eventData.startTime) errors.startTime = 'An event date and time is required.';
    if (!eventData.coverImageUrl) errors.coverImageUrl = 'Cover image is required.';
    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

  const newEventData = {
    ...eventData,
    hostId: userId,
    hostType: 'user' as const,
    city: 'San Francisco', // Defaulting city
    status: 'pending_review' as const,
    visibility: 'public' as const,
    stats: {
        interestedCount: 0,
        rsvpCount: 0,
        viewCount: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const eventCollection = collection(firestore, 'events');
  const docRef = await addDoc(eventCollection, newEventData)
    .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: eventCollection.path,
            operation: 'create',
            requestResourceData: newEventData,
        }));
        throw serverError;
    });

  return docRef.id;
};

type CreateVenueData = Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'stats' | 'city'>>;

export const createVenue = async (
  venueData: CreateVenueData,
  userId: string
): Promise<string> => {
    const errors: {[key: string]: string} = {};
    if (!venueData.name || venueData.name.length < 3) errors.name = 'Name must be at least 3 characters.';
    if (!venueData.categories || venueData.categories.length === 0) errors.type = 'Please select at least one category.';
    if (!venueData.address || venueData.address.length < 5) errors.address = 'Please enter a valid address.';
    
    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

  const venueCollection = collection(firestore, 'venues');
  const newVenueData = {
    ...venueData,
    createdBy: userId,
    city: 'San Francisco',
    status: 'pending_review' as const,
    stats: {
        ratingAverage: 0,
        ratingCount: 0,
        eventCount: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(venueCollection, newVenueData)
    .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: venueCollection.path,
            operation: 'create',
            requestResourceData: newVenueData,
        }));
        throw serverError;
    });

  return docRef.id;
};


type CreateThreadData = Partial<Omit<CommonsThread, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'stats' | 'authorId' | 'authorInfo'>>;

export const createThread = async (threadData: CreateThreadData, user: AppUser): Promise<string> => {
    const errors: {[key: string]: string} = {};
    if (!threadData.title || threadData.title.length < 5) errors.title = 'Title must be at least 5 characters.';
    if (!threadData.body || threadData.body.length < 10) errors.body = 'Body must be at least 10 characters.';
    if (!threadData.topic) errors.topic = 'Please select a topic.';
    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

    const threadCollection = collection(firestore, 'commonsThreads');
    const now = Timestamp.now();
    const newThreadData = {
        ...threadData,
        authorId: user.id,
        authorInfo: {
            displayName: user.displayName,
            photoURL: user.photoURL
        },
        stats: {
            replyCount: 0,
            viewCount: 0,
            likeCount: 0,
        },
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
    };
    
    const docRef = await addDoc(threadCollection, newThreadData)
      .catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: threadCollection.path,
              operation: 'create',
              requestResourceData: newThreadData,
          }));
          throw serverError;
      });

    return docRef.id;
};

type CreateReplyData = Omit<CommonsReply, 'id' | 'createdAt' | 'updatedAt' | 'authorId' | 'authorInfo'>;

export const createReply = async (replyData: CreateReplyData, user: AppUser): Promise<string> => {
    const batch = writeBatch(firestore);
    const now = Timestamp.now();
    
    const replyCollection = collection(firestore, 'commonsReplies');
    const newReplyRef = doc(replyCollection);

    const newReplyData = {
        ...replyData,
        authorId: user.id,
        authorInfo: {
            displayName: user.displayName,
            photoURL: user.photoURL,
        },
        createdAt: now,
        updatedAt: now,
    };
    batch.set(newReplyRef, newReplyData);

    const threadRef = doc(firestore, 'commonsThreads', replyData.threadId);
    batch.update(threadRef, {
        'stats.replyCount': increment(1),
        lastActivityAt: now,
    });

    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: newReplyRef.path,
            operation: 'create',
            requestResourceData: newReplyData,
        }));
        throw serverError;
    });

    return newReplyRef.id;
};


export const reportContent = async (type: 'thread' | 'reply', targetId: string, reason: string, userId: string) => {
    const reportCollection = collection(firestore, 'reports');
    const reportData = {
        type,
        targetId,
        reason,
        createdBy: userId,
        createdAt: serverTimestamp(),
    };
    
    await addDoc(reportCollection, reportData)
      .catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: reportCollection.path,
              operation: 'create',
              requestResourceData: reportData,
          }));
          throw serverError;
      });
};

export const followTarget = async (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followId = `${userId}_${targetType}_${targetId}`;
    const followRef = doc(firestore, 'follows', followId);
    const followData = {
        followerUserId: userId,
        targetId,
        targetType,
        createdAt: serverTimestamp(),
    };
    
    await setDoc(followRef, followData)
      .catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: followRef.path,
              operation: 'create',
              requestResourceData: followData,
          }));
          throw serverError;
      });
};

export const unfollowTarget = async (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followId = `${userId}_${targetType}_${targetId}`;
    const followRef = doc(firestore, 'follows', followId);
    await deleteDoc(followRef)
        .catch(async (serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: followRef.path,
                operation: 'delete',
            }));
            throw serverError;
        });
};


// Event Interactions
export const setEventInteraction = async (userId: string, eventId: string, type: EventInteractionType) => {
    const interactionId = `${userId}_${eventId}`;
    const interactionRef = doc(firestore, 'eventInteractions', interactionId);
    const interactionDoc = await getDoc(interactionRef);

    const batch = writeBatch(firestore);
    const eventRef = doc(firestore, 'events', eventId);

    // If interaction exists and is the same type, we are removing it (toggling off)
    if (interactionDoc.exists() && interactionDoc.data().type === type) {
        batch.delete(interactionRef);
        batch.update(eventRef, { [`stats.${type}Count`]: increment(-1) });
    } else {
        // If it exists but is a different type, or doesn't exist at all
        if (interactionDoc.exists()) {
            const oldType = interactionDoc.data().type as EventInteractionType;
            batch.update(eventRef, { [`stats.${oldType}Count`]: increment(-1) });
        }
        const interactionData = {
            userId,
            eventId,
            type,
            createdAt: serverTimestamp()
        };
        batch.set(interactionRef, interactionData);
        batch.update(eventRef, { [`stats.${type}Count`]: increment(1) });
    }
    
    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: interactionRef.path,
            operation: 'write', // can be create or update
        }));
        throw serverError;
    });
};

// --- DATABASE SEEDING ---
export const seedDatabase = async () => {
  const batch = writeBatch(firestore);
  const now = Timestamp.now();

  const venueCollection = collection(firestore, 'venues');
  const eventCollection = collection(firestore, 'events');
  const threadCollection = collection(firestore, 'commonsThreads');
  
  const q = query(venueCollection, where('createdBy', '==', 'system'), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
      const message = "Database has already been seeded. Aborting.";
      console.log(message);
      return { success: true, message: message };
  }

  const venueIdMap = new Map<string, string>();
  for (const venue of placeholderVenues) {
    const { id: oldId, ...venueData } = venue;
    const docRef = doc(venueCollection); 
    batch.set(docRef, {
        ...venueData,
        createdAt: now,
        updatedAt: now,
    });
    venueIdMap.set(oldId, docRef.id);
  }

  placeholderEvents.forEach(event => {
    const { venueId: oldVenueId, ...eventData } = event;
    const newVenueId = oldVenueId ? venueIdMap.get(oldVenueId) : undefined;
    
    const docRef = doc(eventCollection); 
    batch.set(docRef, {
        ...eventData,
        location: { ...eventData.location, venueId: newVenueId },
        startTime: Timestamp.fromDate(new Date(event.startTime as unknown as string)),
        endTime: event.endTime ? Timestamp.fromDate(new Date(event.endTime as unknown as string)) : undefined,
        createdAt: now,
        updatedAt: now,
    });
  });
  
  placeholderThreads.forEach(thread => {
      const { id, ...threadData } = thread;
      const docRef = doc(threadCollection);
      batch.set(docRef, {
          ...threadData,
          createdAt: now,
          updatedAt: now,
          lastActivityAt: now,
      });
  });

  try {
    await batch.commit();
    const message = 'Database seeded successfully!';
    console.log(message);
    return { success: true, message: message };
  } catch (error) {
    const message = `Error seeding database: ${error}`;
    console.error(message);
    return { success: false, message: message };
  }
};
