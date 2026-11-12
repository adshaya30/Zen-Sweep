import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  type User,
  type Unsubscribe,
} from 'firebase/auth';

import { auth } from './firebase';

export { auth };

/**
 * Sign in existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  pass: string,
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return cred.user;
}

/**
 * Sign up a new user with email, password, and optional full name
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  fullName?: string,
): Promise<User> {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  if (fullName && fullName.trim()) {
    await updateProfile(cred.user, { displayName: fullName.trim() });
  }
  return cred.user;
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in with Google
 */
export async function loginWithGoogle(idToken?: string): Promise<User> {
  if (idToken) {
    const credential = GoogleAuthProvider.credential(idToken);
    const res = await signInWithCredential(auth, credential);
    return res.user;
  }
  const res = await signInWithPopup(auth, googleProvider);
  return res.user;
}

/**
 * Alias functions
 */
export const registerUser = (email: string, pass: string, fullName?: string) =>
  signUpWithEmail(email, pass, fullName);

export const loginUser = (email: string, pass: string) =>
  signInWithEmail(email, pass);

export const logoutUser = () => signOutUser();

/**
 * Sign out current authenticated user
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(
  callback: (user: User | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, callback);
}
