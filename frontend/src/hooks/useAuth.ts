import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';

import {
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  sendPasswordReset,
} from '../services/firebase/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    setError(null);
    try {
      return await signInWithEmail(email, pass);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    }
  };

  const register = async (email: string, pass: string, fullName?: string) => {
    setError(null);
    try {
      return await signUpWithEmail(email, pass, fullName);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOutUser();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign out failed';
      setError(message);
      throw err;
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
  };
}
