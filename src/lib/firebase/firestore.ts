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
} from 'firebase/firestore';
import { firestore } from './index';
import type { User } from 'firebase/auth';
import type { AppUser, Event, Venue, Thread, Comment, FollowTargetType, Reaction, ReactionType } from '@/lib/types';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const createUserProfile = async (user: User) => {
  const userRef = doc(firestore, 'users', user.uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    const { uid, email, displayName, photoURL } = user;
    await setDoc(userRef, {
      uid,
      email,
      displayName: displayName || email?.split('@')[0],
      photoURL,
      role: 'user',
      interests: [],
      skills: [],
      locationPreferences: [],
    });
  }
};

export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const userRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    return userDoc.data() as AppUser;
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

type CreateEventData = Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'createdBy' | 'startTime'> & {
  startTime: Timestamp;
};

export const createEvent = async (
  eventData: CreateEventData,
  userId: string
): Promise<string> => {
  const eventCollection = collection(firestore, 'events');
  
  // Fetch venue details if venueId is provided
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

  const newEvent = {
    ...eventData,
    createdBy: userId,
    approvalStatus: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    venueName: venueName,
    neighborhood: neighborhood,
  };
  const docRef = await addDoc(eventCollection, newEvent);
  return docRef.id;
};

type CreateVenueData = Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'verified' | 'createdBy'>;

export const createVenue = async (
  venueData: CreateVenueData,
  userId: string
): Promise<string> => {
  const venueCollection = collection(firestore, 'venues');
  const newVenue = {
    ...venueData,
    createdBy: userId,
    verified: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(venueCollection, newVenue);
  return docRef.id;
};


type CreateThreadData = Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'replyCount' | 'authorInfo' | 'likeCount'>;

export const createThread = async (threadData: CreateThreadData, user: AppUser): Promise<string> => {
    const threadCollection = collection(firestore, 'threads');
    const now = serverTimestamp();
    const newThread = {
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
    const docRef = await addDoc(threadCollection, newThread);
    return docRef.id;
};

type CreateCommentData = Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'authorInfo' | 'likeCount'>;

export const createComment = async (commentData: CreateCommentData, user: AppUser): Promise<string> => {
    const batch = writeBatch(firestore);
    const now = serverTimestamp();
    
    // 1. Create the new comment
    const commentCollection = collection(firestore, 'threads', commentData.threadId, 'comments');
    const newCommentRef = doc(commentCollection);
    batch.set(newCommentRef, {
        ...commentData,
        authorInfo: {
            displayName: user.displayName,
            photoURL: user.photoURL,
        },
        likeCount: 0,
        createdAt: now,
        updatedAt: now,
    });

    // 2. Update the parent thread's metadata
    const threadRef = doc(firestore, 'threads', commentData.threadId);
    batch.update(threadRef, {
        replyCount: increment(1),
        lastActivityAt: now,
    });

    await batch.commit();
    return newCommentRef.id;
};


export const reportContent = async (type: 'thread' | 'comment', targetId: string, reason: string, userId: string) => {
    const reportCollection = collection(firestore, 'reports');
    await addDoc(reportCollection, {
        type,
        targetId,
        reason,
        createdBy: userId,
        createdAt: serverTimestamp(),
    });
};

export const followTarget = async (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followCollection = collection(firestore, `users/${userId}/follows`);
    await addDoc(followCollection, {
        userId,
        targetId,
        targetType,
        createdAt: serverTimestamp(),
    });
};

export const unfollowTarget = async (userId: string, targetId: string, targetType: FollowTargetType) => {
    const followCollection = collection(firestore, `users/${userId}/follows`);
    const q = query(followCollection, where('targetId', '==', targetId), where('targetType', '==', targetType));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
        const docToDelete = snapshot.docs[0];
        await deleteDoc(docToDelete.ref);
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
    // For comments, we use a root-level collection for easier querying of user's reactions
    return collection(firestore, 'comments', targetId, 'reactions');
};

const getTargetDocRef = (targetType: 'thread' | 'comment', targetId: string) => {
    if (targetType === 'thread') {
        return doc(firestore, 'threads', targetId);
    }
    // This is tricky because comments are in a subcollection. We need the threadId.
    // For simplicity in this function, we'll assume comment reactions don't need to update a parent doc
    // in the same way. The like count is on the comment doc itself.
    // A better implementation would pass the full path.
    // However, for this operation we only need threadRef.
    return null;
}

export const addReaction = async (
    userId: string,
    targetId: string,
    targetType: 'thread' | 'comment',
    reactionType: ReactionType = 'like'
) => {
    const batch = writeBatch(firestore);
    
    // 1. Add the reaction document
    const reactionCollection = getReactionCollection(targetType, targetId);
    const reactionDocRef = doc(reactionCollection, userId); // Use userId as doc ID to enforce one reaction per user
    batch.set(reactionDocRef, {
        userId,
        targetId,
        targetType,
        type: reactionType,
        createdAt: serverTimestamp(),
    });

    // 2. Increment the like count on the target document
    if (targetType === 'thread') {
        const targetRef = doc(firestore, 'threads', targetId);
        batch.update(targetRef, { likeCount: increment(1) });
    } else {
        // We can't get the thread ID from here easily. This needs to be handled differently.
        // Let's assume we can get the comment's parent thread somehow.
        // For now, let's just update the comment itself. We need its full path.
        // This is a simplification and would need the threadId in a real app.
        // Let's find the comment doc.
        const q = query(collectionGroup(firestore, 'comments'), where('__name__', '==', `threads/${targetId.split('/comments/')[0]}/comments/${targetId.split('/comments/')[1]}`));
    }
    // For now, let's assume we get the full path to the comment
    // In the component, we'll need to construct this path.

    await batch.commit();
};

export const addCommentReaction = async (
    userId: string,
    threadId: string,
    commentId: string,
    reactionType: ReactionType = 'like'
) => {
    const batch = writeBatch(firestore);

    // Reaction doc in /comments/{commentId}/reactions/{userId}
    const reactionDocRef = doc(firestore, 'comments', commentId, 'reactions', userId);
     batch.set(reactionDocRef, {
        userId,
        targetId: commentId,
        targetType: 'comment',
        type: reactionType,
        createdAt: serverTimestamp(),
    });

    // Update likeCount on the comment document
    const commentRef = doc(firestore, 'threads', threadId, 'comments', commentId);
    batch.update(commentRef, { likeCount: increment(1) });

    await batch.commit();
}


export const removeReaction = async (
    userId: string,
    targetId: string,
    targetType: 'thread' | 'comment'
) => {
    const batch = writeBatch(firestore);

    // 1. Delete the reaction document
    const reactionCollection = getReactionCollection(targetType, targetId);
    const reactionDocRef = doc(reactionCollection, userId);
    batch.delete(reactionDocRef);

    // 2. Decrement the like count
    if (targetType === 'thread') {
        const targetRef = doc(firestore, 'threads', targetId);
        batch.update(targetRef, { likeCount: increment(-1) });
    }
   
    await batch.commit();
};

export const removeCommentReaction = async (
    userId: string,
    threadId: string,
    commentId: string,
) => {
    const batch = writeBatch(firestore);

    const reactionDocRef = doc(firestore, 'comments', commentId, 'reactions', userId);
    batch.delete(reactionDocRef);

    const commentRef = doc(firestore, 'threads', threadId, 'comments', commentId);
    batch.update(commentRef, { likeCount: increment(-1) });
    
    await batch.commit();
}

export const getUserReactionsForThread = async (userId: string, threadId: string): Promise<Set<string>> => {
    const reactions = new Set<string>();
    
    // Get thread reaction
    const threadReactionRef = doc(firestore, 'threads', threadId, 'reactions', userId);
    const threadReactionSnap = await getDoc(threadReactionRef);
    if (threadReactionSnap.exists()) {
        reactions.add(threadId);
    }
    
    // Get comment reactions
    const commentsCollection = collection(firestore, 'threads', threadId, 'comments');
    const commentsSnap = await getDocs(commentsCollection);
    const commentIds = commentsSnap.docs.map(d => d.id);

    if (commentIds.length > 0) {
        // Query the top-level reactions collection for comments
        const reactionsQuery = query(collectionGroup(firestore, 'reactions'), where('userId', '==', userId), where('targetId', 'in', commentIds));
        const reactionsSnap = await getDocs(reactionsQuery);
        reactionsSnap.forEach(doc => reactions.add(doc.data().targetId));
    }

    return reactions;
};
