
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
import type { AppUser, Event, Venue, Thread, Comment, FollowTargetType, ReactionType, EventInteractionType } from '@/lib/types';
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
      uid,
      id: uid,
      email,
      displayName: displayName || email?.split('@')[0],
      photoURL,
      role: 'user' as const,
      interests: [],
      skills: [],
      locationPreferences: [],
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

type CreateEventData = Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'createdBy' | 'stats'>>;

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

  let venueName: string | undefined;
  let neighborhood: string | undefined;
  if (eventData.venueId) {
      const venueDoc = await getDoc(doc(firestore, 'venues', eventData.venueId));
      if (venueDoc.exists()) {
          const venueData = venueDoc.data() as Venue;
          venueName = venueData.name;
          neighborhood = venueData.neighborhood;
      }
  }

  const userProfile = await getUserProfile(userId);
  const newEventData = {
    ...eventData,
    createdBy: userId,
    hostName: userProfile?.displayName || 'Community Member',
    approvalStatus: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    venueName: venueName,
    neighborhood: neighborhood,
    stats: {
        interestedCount: 0,
        goingCount: 0,
        savedCount: 0,
    }
  };

  const eventCollection = collection(firestore, 'events');
  const docRef = doc(eventCollection);
  await setDoc(docRef, newEventData)
    .catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'create',
            requestResourceData: newEventData,
        }));
        throw serverError;
    });

  return docRef.id;
};

type CreateVenueData = Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'verified' | 'createdBy'>>;

export const createVenue = async (
  venueData: CreateVenueData,
  userId: string
): Promise<string> => {
    const errors: {[key: string]: string} = {};
    if (!venueData.name || venueData.name.length < 3) errors.name = 'Name must be at least 3 characters.';
    if (!venueData.type) errors.type = 'Please select a type.';
    if (!venueData.description || venueData.description.length < 10) errors.description = 'Description must be at least 10 characters.';
    if (!venueData.address || venueData.address.length < 5) errors.address = 'Please enter a valid address.';
    if (!venueData.neighborhood || venueData.neighborhood.length < 3) errors.neighborhood = 'Please enter a neighborhood.';
    if (!venueData.coverImageUrl) errors.coverImageUrl = 'Cover image is required.';
    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

  const venueCollection = collection(firestore, 'venues');
  const newVenueData = {
    ...venueData,
    createdBy: userId,
    verified: false,
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


type CreateThreadData = Partial<Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'replyCount' | 'authorInfo' | 'likeCount'>>;

export const createThread = async (threadData: CreateThreadData, user: AppUser): Promise<string> => {
    const errors: {[key: string]: string} = {};
    if (!threadData.title || threadData.title.length < 5) errors.title = 'Title must be at least 5 characters.';
    if (!threadData.body || threadData.body.length < 10) errors.body = 'Body must be at least 10 characters.';
    if (!threadData.topic) errors.topic = 'Please select a topic.';
    if (Object.keys(errors).length > 0) {
        throw new ValidationError('Validation failed', errors);
    }

    const threadCollection = collection(firestore, 'threads');
    const now = Timestamp.now();
    const newThreadData = {
        ...threadData,
        authorInfo: {
            displayName: user.displayName,
            photoURL: user.photoURL
        },
        replyCount: 0,
        likeCount: 0,
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

type CreateCommentData = Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'authorInfo' | 'likeCount'>;
type AuthorInfo = { displayName: string | null, photoURL: string | null };

export const createComment = async (commentData: CreateCommentData, authorInfo: AuthorInfo): Promise<string> => {
    const batch = writeBatch(firestore);
    const now = Timestamp.now();
    
    const commentCollection = collection(firestore, 'threads', commentData.threadId, 'comments');
    const newCommentRef = doc(commentCollection);

    const newCommentData = {
        ...commentData,
        authorInfo,
        likeCount: 0,
        createdAt: now,
        updatedAt: now,
    };
    batch.set(newCommentRef, newCommentData);

    const threadRef = doc(firestore, 'threads', commentData.threadId);
    batch.update(threadRef, {
        replyCount: increment(1),
        lastActivityAt: now,
    });

    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: newCommentRef.path,
            operation: 'create',
            requestResourceData: newCommentData,
        }));
        throw serverError;
    });

    return newCommentRef.id;
};


export const reportContent = async (type: 'thread' | 'comment', targetId: string, reason: string, userId: string) => {
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
    const followCollection = collection(firestore, `users/${userId}/follows`);
    const followData = {
        userId,
        targetId,
        targetType,
        createdAt: serverTimestamp(),
    };
    
    await addDoc(followCollection, followData)
      .catch(async (serverError) => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
              path: followCollection.path,
              operation: 'create',
              requestResourceData: followData,
          }));
          throw serverError;
      });
};

export const unfollowTarget = async (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followCollection = collection(firestore, `users/${userId}/follows`);
    const q = query(followCollection, where('targetId', '==', targetId), where('targetType', '==', targetType));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docToDelete = snapshot.docs[0];
        await deleteDoc(docToDelete.ref)
          .catch(async (serverError) => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: docToDelete.ref.path,
                  operation: 'delete',
              }));
              throw serverError;
          });
    }
};

export const getFollowedVenueIds = async (userId: string): Promise<string[]> => {
    const followCollection = collection(firestore, `users/${userId}/follows`);
    const q = query(followCollection, where('targetType', '==', 'venue'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().targetId);
};


// Reactions
const getReactionCollection = (targetType: 'thread' | 'comment', targetId: string) => {
    if (targetType === 'thread') {
        return collection(firestore, 'threads', targetId, 'reactions');
    }
    return collection(firestore, 'comments', targetId, 'reactions');
};

export const addReaction = async (
    userId: string,
    targetId: string,
    targetType: 'thread' | 'comment',
    reactionType: ReactionType = 'like'
) => {
    const batch = writeBatch(firestore);
    
    const reactionCollection = getReactionCollection(targetType, targetId);
    const reactionDocRef = doc(reactionCollection, userId); 
    const reactionData = {
        userId,
        targetId,
        targetType,
        type: reactionType,
        createdAt: serverTimestamp(),
    };
    batch.set(reactionDocRef, reactionData);

    if (targetType === 'thread') {
        const targetRef = doc(firestore, 'threads', targetId);
        batch.update(targetRef, { likeCount: increment(1) });
    }

    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: reactionDocRef.path,
            operation: 'create',
            requestResourceData: reactionData,
        }));
        throw serverError;
    });
};

export const addCommentReaction = async (
    userId: string,
    threadId: string,
    commentId: string,
    reactionType: ReactionType = 'like'
) => {
    const batch = writeBatch(firestore);

    const reactionDocRef = doc(firestore, 'threads', threadId, 'comments', commentId, 'reactions', userId);
    const reactionData = {
        userId,
        targetId: commentId,
        targetType: 'comment',
        type: reactionType,
        createdAt: serverTimestamp(),
    };
    batch.set(reactionDocRef, reactionData);

    const commentRef = doc(firestore, 'threads', threadId, 'comments', commentId);
    batch.update(commentRef, { likeCount: increment(1) });

    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: reactionDocRef.path,
            operation: 'create',
            requestResourceData: reactionData,
        }));
        throw serverError;
    });
}


export const removeReaction = async (
    userId: string,
    targetId: string,
    targetType: 'thread' | 'comment'
) => {
    const batch = writeBatch(firestore);

    const reactionCollection = getReactionCollection(targetType, targetId);
    const reactionDocRef = doc(reactionCollection, userId);
    batch.delete(reactionDocRef);

    if (targetType === 'thread') {
        const targetRef = doc(firestore, 'threads', targetId);
        batch.update(targetRef, { likeCount: increment(-1) });
    }
   
    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: reactionDocRef.path,
            operation: 'delete',
        }));
        throw serverError;
    });
};

export const removeCommentReaction = async (
    userId: string,
    threadId: string,
    commentId: string,
) => {
    const batch = writeBatch(firestore);

    const reactionDocRef = doc(firestore, 'threads', threadId, 'comments', commentId, 'reactions', userId);
    batch.delete(reactionDocRef);

    const commentRef = doc(firestore, 'threads', threadId, 'comments', commentId);
    batch.update(commentRef, { likeCount: increment(-1) });
    
    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: reactionDocRef.path,
            operation: 'delete',
        }));
        throw serverError;
    });
}

export const getUserReactionsForThread = async (userId: string, threadId: string): Promise<Set<string>> => {
    const reactions = new Set<string>();
    
    const threadReactionRef = doc(firestore, 'threads', threadId, 'reactions', userId);
    const threadReactionSnap = await getDoc(threadReactionRef);
    if (threadReactionSnap.exists()) {
        reactions.add(threadId);
    }
    
    const commentsCollection = collection(firestore, 'threads', threadId, 'comments');
    const commentsSnap = await getDocs(commentsCollection);
    const commentIds = commentsSnap.docs.map(d => d.id);

    if (commentIds.length > 0) {
        const reactionsQuery = query(collectionGroup(firestore, 'reactions'), where('userId', '==', userId), where('targetId', 'in', commentIds));
        const reactionsSnap = await getDocs(reactionsQuery);
        reactionsSnap.forEach(doc => reactions.add(doc.data().targetId));
    }

    return reactions;
};

// Event Interactions

export const addEventInteraction = async (userId: string, eventId: string, type: EventInteractionType, previousType: EventInteractionType | null) => {
    const batch = writeBatch(firestore);

    // If there was a previous interaction, remove it first
    if (previousType) {
        const q = query(
            collection(firestore, 'eventInteractions'),
            where('userId', '==', userId),
            where('eventId', '==', eventId),
            where('type', '==', previousType)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const interactionDoc = querySnapshot.docs[0];
            batch.delete(interactionDoc.ref);
            const oldStatField = `stats.${previousType}Count`;
            const eventRef = doc(firestore, 'events', eventId);
            batch.update(eventRef, { [oldStatField]: increment(-1) });
        }
    }

    const interactionRef = doc(collection(firestore, 'eventInteractions'));
    const interactionData = {
        userId,
        eventId,
        type,
        createdAt: serverTimestamp(),
    };
    batch.set(interactionRef, interactionData);

    const eventRef = doc(firestore, 'events', eventId);
    const statField = `stats.${type}Count`;
    batch.update(eventRef, { [statField]: increment(1) });
    
    await batch.commit().catch(async (serverError) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: interactionRef.path,
            operation: 'create',
            requestResourceData: interactionData,
        }));
        throw serverError;
    });
    return interactionRef.id;
};

export const removeEventInteraction = async (userId: string, eventId: string, type: EventInteractionType) => {
    const batch = writeBatch(firestore);

    const q = query(
        collection(firestore, 'eventInteractions'),
        where('userId', '==', userId),
        where('eventId', '==', eventId),
        where('type', '==', type)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const interactionDoc = querySnapshot.docs[0];
        batch.delete(interactionDoc.ref);

        const eventRef = doc(firestore, 'events', eventId);
        const statField = `stats.${type}Count`;
        batch.update(eventRef, { [statField]: increment(-1) });
        
        await batch.commit().catch(async (serverError) => {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: interactionDoc.ref.path,
                operation: 'delete',
            }));
            throw serverError;
        });
    }
};

// --- DATABASE SEEDING ---
export const seedDatabase = async () => {
  const batch = writeBatch(firestore);
  const now = Timestamp.now();

  const venueCollection = collection(firestore, 'venues');
  const eventCollection = collection(firestore, 'events');
  const threadCollection = collection(firestore, 'threads');
  
  // Check if data has already been seeded to prevent duplicates
  const q = query(venueCollection, where('createdBy', '==', 'system'), limit(1));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
      const message = "Database has already been seeded. Aborting.";
      console.log(message);
      return { success: true, message: message };
  }


  // Seed Venues and keep track of their new IDs
  const venueIdMap = new Map<string, string>();
  for (const venue of placeholderVenues) {
    const { id: oldId, ...venueData } = venue;
    const docRef = doc(venueCollection); // Auto-generate ID
    batch.set(docRef, {
        ...venueData,
        createdAt: now,
        updatedAt: now,
    });
    venueIdMap.set(oldId, docRef.id);
  }

  // Seed Events, updating venueId with the new IDs
  placeholderEvents.forEach(event => {
    const { venueId: oldVenueId, ...eventData } = event;
    const newVenueId = oldVenueId ? venueIdMap.get(oldVenueId) : undefined;
    
    const docRef = doc(eventCollection); // Auto-generate ID
    batch.set(docRef, {
        ...eventData,
        venueId: newVenueId,
        startTime: Timestamp.fromDate(new Date(event.startTime as unknown as string)),
        endTime: event.endTime ? Timestamp.fromDate(new Date(event.endTime as unknown as string)) : undefined,
        createdAt: now,
        updatedAt: now,
    });
  });
  
  // Seed Threads
  placeholderThreads.forEach(thread => {
      const { id, ...threadData } = thread;
      const docRef = doc(threadCollection); // Auto-generate ID
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
