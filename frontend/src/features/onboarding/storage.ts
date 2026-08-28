import AsyncStorage from '@react-native-async-storage/async-storage';

import type { UserPreferences } from './types';

export const USER_PREFERENCES_KEY = '@zen_sweep/user_preferences';

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const raw = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as UserPreferences;
  } catch {
    await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
    return null;
  }
}

export async function saveUserPreferences(
  prefs: UserPreferences,
): Promise<void> {
  await AsyncStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(prefs));
}

export async function clearUserPreferences(): Promise<void> {
  await AsyncStorage.removeItem(USER_PREFERENCES_KEY);
}
