export type UserPreferences = {
  name: string;
  age: string;
  dream: string;
  goals: string;
  interests: string[];
  trapApps: string[];
  sleepTime: string;
  wakeTime: string;
  completedAt: number;
};

export const INTEREST_OPTIONS = [
  'Coding',
  'Drawing',
  'Music',
  'Reading',
  'Sports',
  'Cooking',
  'Writing',
  'Photography',
] as const;

export const TRAP_APP_OPTIONS = [
  { label: 'Instagram', packageName: 'com.instagram.android' },
  { label: 'TikTok', packageName: 'com.zhiliaoapp.musically' },
  { label: 'Twitter/X', packageName: 'com.twitter.android' },
  { label: 'Reddit', packageName: 'com.reddit.frontpage' },
  { label: 'YouTube', packageName: 'com.google.android.youtube' },
  { label: 'Facebook', packageName: 'com.facebook.katana' },
  { label: 'Snapchat', packageName: 'com.snapchat.android' },
  { label: 'Discord', packageName: 'com.discord' },
  { label: 'WhatsApp', packageName: 'com.whatsapp' },
] as const;

export const DEFAULT_PREFERENCES: Omit<UserPreferences, 'completedAt'> = {
  name: '',
  age: '',
  dream: '',
  goals: '',
  interests: [],
  trapApps: [],
  sleepTime: '10:00 PM',
  wakeTime: '07:00 AM',
};
