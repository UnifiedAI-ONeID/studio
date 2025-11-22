import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from './index';
import type { User } from 'firebase/auth';
import type { AppUser, Event, Venue } from '@/lib/types';
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
