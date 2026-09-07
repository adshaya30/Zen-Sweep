import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { auth } from './firebase/firebase';

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const registerUser = async (
  email: string,
  password: string,
  fullName?: string,
) => {
  const result = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );

  if (fullName && fullName.trim()) {
    await updateProfile(result.user, { displayName: fullName.trim() });
  }

  return result.user;
};

export const loginUser = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);

  return result.user;
};

export const loginWithGoogleCredential = async (
  idToken: string,
  accessToken?: string,
): Promise<User> => {
  const credential = GoogleAuthProvider.credential(idToken, accessToken);
  const result = await signInWithCredential(auth, credential);
  return result.user;
};

export const loginWithGoogle = async (idToken?: string): Promise<User> => {
  if (idToken) {
    return await loginWithGoogleCredential(idToken);
  }

  if (Platform.OS === 'web' && typeof signInWithPopup === 'function') {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  }

  throw new Error(
    'Google Sign-In on mobile requires Google authentication token.',
  );
};

export const logoutUser = async () => {
  await signOut(auth);
};
