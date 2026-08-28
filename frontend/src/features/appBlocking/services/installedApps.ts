import type { AppInfo } from '../types/blocking';

/**
 * Mock installed-apps layer.
 * Later this can be swapped for a native Android package query
 * without changing UI consumers.
 */
export async function getInstalledApps(): Promise<AppInfo[]> {
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
