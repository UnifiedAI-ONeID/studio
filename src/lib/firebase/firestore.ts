
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
  limit,
  Firestore,
} from 'firebase/firestore';
import { db as firestore } from '@/lib/firebase';
import type { User } from 'firebase/auth';
import type { AppUser, Event, Venue, CommonsThread, CommonsReply, FollowTargetType, EventInteractionType, ApprovalStatus, ReportType } from '../types';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

export const createUserProfile = async (user: User) => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef).catch((serverError) => {
     errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'get',
    }));
    throw serverError; // Re-throw to inform the caller
  });

  if (!userDoc.exists()) {
    const { uid, email, displayName, photoURL } = user;
    const profileData: Omit<AppUser, 'id'> = {
      uid: uid,
      displayName: displayName || 'New User',
      photoURL: photoURL || `https://i.pravatar.cc/150?u=${uid}`,
      email: email,
      role: 'user',
      interests: ['Technology', 'Music', 'Art'],
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      homeCity: 'Taipei',
      isSampleData: false,
    };
    setDoc(userRef, profileData)
      .catch((e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: userRef.path,
            operation: 'create',
            requestResourceData: profileData
        }));
        throw e; // Re-throw to inform the caller
      });
  }
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

type CreateEventData = Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'hostId' | 'stats' | 'approvalStatus' | 'createdBy'>>;

export const createEvent = async (
  eventData: CreateEventData,
  user: AppUser,
): Promise<string> => {
  const newEventData = {
    ...eventData,
    hostId: user.id,
    createdBy: user.id,
    city: user.homeCity || 'Taipei', 
    status: 'published' as const, 
    visibility: 'public' as const,
    approvalStatus: 'approved' as ApprovalStatus,
    stats: {
        interestedCount: 0,
        goingCount: 0,
        savedCount: 0,
        viewCount: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const eventCollection = collection(firestore, 'events');
  try {
    const docRef = await addDoc(eventCollection, newEventData);
    return docRef.id;
  } catch (serverError) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: eventCollection.path,
          operation: 'create',
          requestResourceData: newEventData,
      }));
      throw serverError; // Re-throw to be caught by the calling UI
  }
};

type CreateVenueData = Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'createdBy' | 'stats' | 'city'>>;

export const createVenue = async (
  venueData: CreateVenueData,
  user: AppUser,
): Promise<string> => {
  const venueCollection = collection(firestore, 'venues');
  const newVenueData = {
    ...venueData,
    createdBy: user.id,
    city: user.homeCity || 'Taipei',
    status: 'approved' as const,
    stats: {
        ratingAverage: 0,
        ratingCount: 0,
        eventCount: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    const docRef = await addDoc(venueCollection, newVenueData);
    return docRef.id;
  } catch(serverError) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: venueCollection.path,
          operation: 'create',
          requestResourceData: newVenueData,
      }));
      throw serverError;
  }
};


type CreateThreadData = Partial<Omit<CommonsThread, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'stats' | 'authorId' | 'authorInfo'>>;

export const createThread = async (threadData: CreateThreadData, user: AppUser): Promise<string> => {
    const threadCollection = collection(firestore, 'threads');
    const now = Timestamp.now();
    const newThreadData = {
        ...threadData,
        authorId: user.id,
        city: user.homeCity || 'Taipei',
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
    
    try {
      const docRef = await addDoc(threadCollection, newThreadData);
      return docRef.id;
    } catch(serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: threadCollection.path,
            operation: 'create',
            requestResourceData: newThreadData,
        }));
        throw serverError;
    }
};

type CreateReplyData = Partial<Omit<CommonsReply, 'id' | 'createdAt' | 'updatedAt' | 'likeCount' | 'authorId' | 'authorInfo' | 'createdBy'>>;

export const createReply = async (replyData: CreateReplyData, user: AppUser): Promise<string> => {
    const batch = writeBatch(firestore);
    const now = Timestamp.now();
    
    const replyCollection = collection(firestore, `threads/${replyData.threadId}/comments`);
    const newReplyRef = doc(replyCollection);

    const newReplyData = {
        ...replyData,
        authorId: user.id,
        createdBy: user.id,
        authorInfo: {
            displayName: user.displayName,
            photoURL: user.photoURL,
        },
        createdAt: now,
        updatedAt: now,
        likeCount: 0,
    };
    batch.set(newReplyRef, newReplyData);

    const threadRef = doc(firestore, 'threads', replyData.threadId!);
    batch.update(threadRef, {
        'stats.replyCount': increment(1),
        lastActivityAt: now,
    });
    
    try {
        await batch.commit();
        return newReplyRef.id;
    } catch(serverError) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: newReplyRef.path,
            operation: 'create',
            requestResourceData: newReplyData,
        }));
        throw serverError;
    }
};


export const reportContent = (type: ReportType, targetId: string, reason: string, userId: string) => {
    const reportCollection = collection(firestore, 'reports');
    const reportData = {
        type,
        targetId,
        reason,
        createdBy: userId,
        createdAt: serverTimestamp(),
    };
    
    addDoc(reportCollection, reportData)
        .catch((serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: reportCollection.path,
                operation: 'create',
                requestResourceData: reportData,
            }));
            throw serverError;
        });
};

export const followTarget = (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followId = `${userId}_${targetType}_${targetId}`;
    const followRef = doc(firestore, 'follows', followId);
    const followData = {
        userId: userId,
        targetId,
        targetType,
        createdAt: serverTimestamp(),
    };
    
    setDoc(followRef, followData)
      .catch((serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: followRef.path,
              operation: 'create',
              requestResourceData: followData,
          }));
          throw serverError;
      });
};

export const unfollowTarget = (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followId = `${userId}_${targetType}_${targetId}`;
    const followRef = doc(firestore, 'follows', followId);
    deleteDoc(followRef)
        .catch((serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: followRef.path,
                operation: 'delete',
            }));
            throw serverError;
        });
};


export const addEventInteraction = (userId: string, eventId: string, type: EventInteractionType, previousType?: EventInteractionType | null) => {
    const interactionId = `${userId}_${eventId}`;
    const interactionRef = doc(firestore, 'eventInteractions', interactionId);
    const eventRef = doc(firestore, 'events', eventId);
    const batch = writeBatch(firestore);

    const interactionData = {
        userId,
        eventId,
        type,
        createdAt: serverTimestamp()
    };
    batch.set(interactionRef, interactionData, { merge: true });

    const updates: { [key: string]: any } = { [`stats.${type}Count`]: increment(1) };
    if (previousType) {
        updates[`stats.${previousType}Count`] = increment(-1);
    }
    batch.update(eventRef, updates);

    batch.commit().catch(serverError => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: interactionRef.path,
            operation: 'update',
            requestResourceData: interactionData,
        }));
        throw serverError;
    });
};

export const removeEventInteraction = (userId: string, eventId: string, type: EventInteractionType) => {
    const interactionId = `${userId}_${eventId}`;
    const interactionRef = doc(firestore, 'eventInteractions', interactionId);
    const eventRef = doc(firestore, 'events', eventId);
    const batch = writeBatch(firestore);
    
    batch.delete(interactionRef);
    batch.update(eventRef, { [`stats.${type}Count`]: increment(-1) });

    batch.commit().catch(serverError => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: interactionRef.path,
            operation: 'delete',
        }));
        throw serverError;
    });
};

export const addNewsletterSubscriber = (email: string, city: string = 'unknown') => {
    if (!email || !email.includes('@')) {
        throw new Error("A valid email is required.");
    }
    const subscriberCollection = collection(firestore, 'newsletterSubscribers');
    const subscriberData = {
        email,
        city,
        createdAt: serverTimestamp()
    };

    addDoc(subscriberCollection, subscriberData)
        .catch((serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: subscriberCollection.path,
                operation: 'create',
                requestResourceData: subscriberData
            }));
            throw serverError;
        });
};
