import AsyncStorage from '@react-native-async-storage/async-storage';

import type { BlockingSession } from '../types/blocking';

const SESSION_KEY = '@zen_sweep/blocking_session';

export async function getBlockingSession(): Promise<BlockingSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as BlockingSession;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export async function saveBlockingSession(
  session: BlockingSession,
): Promise<void> {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearBlockingSession(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/**
 * Restores a session using blockedUntil as the source of truth.
 * Marks inactive when the end timestamp has already passed.
 */
export async function restoreBlockingSession(): Promise<BlockingSession | null> {
  const session = await getBlockingSession();
  if (!session) {
    return null;
  }

  if (!session.isActive) {
    return session;
  }

  if (session.blockedUntil <= Date.now()) {
    const completed: BlockingSession = { ...session, isActive: false };
    await saveBlockingSession(completed);
    return completed;
  }

  return session;
}

/** Active session only — ends expired sessions using blockedUntil. */
export async function getActiveBlockingSession(): Promise<BlockingSession | null> {
  const session = await restoreBlockingSession();
  if (!session?.isActive) {
    return null;
  }
  return session;
}

export async function endBlockingSession(): Promise<BlockingSession | null> {
  const session = await getBlockingSession();
  if (!session) {
    return null;
  }
  const ended: BlockingSession = { ...session, isActive: false };
  await saveBlockingSession(ended);
  return ended;
}
