import { Platform } from 'react-native';

import type { AppInfo } from '../types/blocking';

/**
 * Installed-apps layer.
 *
 * - Android: returns a curated list of well-known packages. There is no live
 *   package-name scan (matches the existing behavior — the list drives the
 *   Block setup screen).
 * - iOS: returns an empty list — iOS exposes no API to enumerate installed
 *   apps. Apps must be chosen through the system Screen Time picker
 *   (`AppUsageService.pickBlockedApps()`), which returns base64
 *   `ApplicationToken` identifiers instead of package names.
 */
export async function getInstalledApps(): Promise<AppInfo[]> {
  if (Platform.OS === 'ios') {
    return [];
  }
  return MOCK_INSTALLED_APPS;
}

export const MOCK_INSTALLED_APPS: AppInfo[] = [
  { packageName: 'com.instagram.android', appName: 'Instagram' },
  { packageName: 'com.zhiliaoapp.musically', appName: 'TikTok' },
  { packageName: 'com.twitter.android', appName: 'Twitter/X' },
  { packageName: 'com.reddit.frontpage', appName: 'Reddit' },
  { packageName: 'com.google.android.youtube', appName: 'YouTube' },
  { packageName: 'com.facebook.katana', appName: 'Facebook' },
  { packageName: 'com.snapchat.android', appName: 'Snapchat' },
  { packageName: 'com.discord', appName: 'Discord' },
  { packageName: 'com.whatsapp', appName: 'WhatsApp' },
  { packageName: 'com.android.chrome', appName: 'Chrome' },
];
