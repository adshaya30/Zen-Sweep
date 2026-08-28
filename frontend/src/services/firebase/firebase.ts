import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth, type Auth } from 'firebase/auth';
// @ts-expect-error React Native persistence entrypoint in @firebase/auth
import { getReactNativePersistence } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Platform } from 'react-native';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyC50RT54Vp5185sNt-Ilvb_JmfvLCJy3ic",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "zen-sweep.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "zen-sweep",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "zen-sweep.firebasestorage.app",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "456000385900",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:456000385900:web:6adcefb1c80f5e6f00b949",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-LFJFVF833H",
};

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistent AsyncStorage for React Native
export const auth: Auth = (() => {
  if (Platform.OS === 'web') {
    return getAuth(app);
  }
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch {
    return getAuth(app);
  }
})();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Initialize Analytics (Safe for Web / React Native)
export const getFirebaseAnalytics = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getAnalytics } = require('firebase/analytics');
    return getAnalytics(app);
  }
  return null;
};

export const analytics = getFirebaseAnalytics();

export default app;
