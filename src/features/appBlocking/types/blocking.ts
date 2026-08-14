export type AppInfo = {
  packageName: string;
  appName: string;
  icon?: string;
};

export type BlockedApp = {
  packageName: string;
  appName: string;
};

export type BlockingSession = {
  id: string;
  blockedApps: BlockedApp[];
  startedAt: number;
  blockedUntil: number;
  durationMinutes: number;
  isActive: boolean;
};

export type DurationOptionId =
  '15' | '30' | '60' | '120' | 'custom' | 'unlimited';

export type DurationSelection = {
  id: DurationOptionId;
  label: string;
  minutes: number | null;
};

/** Local detection event — never sent to a backend. */
export type AppUsageDetection = {
  packageName: string;
  appName?: string;
  detectedAt: number;
  isBlocked: boolean;
};
