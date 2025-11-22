import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from './index';
import type { User } from 'firebase/auth';
import type { AppUser } from '@/lib/types';

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
}
