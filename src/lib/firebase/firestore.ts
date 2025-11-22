import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from './index';
import type { User } from 'firebase/auth';
import type { AppUser, Event } from '@/lib/types';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

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
  dataUrl: string
): Promise<string> => {
  const storage = getStorage();
  const storageRef = ref(storage, path);
  await uploadString(storageRef, dataUrl, 'data_url');
  return await getDownloadURL(storageRef);
};

export const createEvent = async (
  eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'approvalStatus' | 'createdBy'>,
  userId: string
): Promise<string> => {
  const eventCollection = collection(firestore, 'events');
  const newEvent = {
    ...eventData,
    createdBy: userId,
    approvalStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(eventCollection, newEvent);
  return docRef.id;
};
