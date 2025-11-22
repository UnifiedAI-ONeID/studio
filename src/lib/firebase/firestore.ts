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
} from 'firebase/firestore';
import { firestore } from './index';
import type { User } from 'firebase/auth';
import type { AppUser, Event, Venue, Thread, Comment, FollowTargetType } from '@/lib/types';
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


type CreateThreadData = Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'replyCount' | 'authorInfo'>;

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
        createdAt: now,
        updatedAt: now,
        lastActivityAt: now,
    };
    const docRef = await addDoc(threadCollection, newThread);
    return docRef.id;
};

type CreateCommentData = Omit<Comment, 'id' | 'createdAt' | 'updatedAt' | 'authorInfo'>;

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
