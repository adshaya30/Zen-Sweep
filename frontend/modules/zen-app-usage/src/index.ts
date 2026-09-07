import { requireNativeModule, type EventSubscription } from 'expo-modules-core';
import { Platform } from 'react-native';

import type { ForegroundAppInfo } from './ZenAppUsage.types';

export type ForegroundAppEvent = {
  packageName: string;
  appName: string | null;
  detectedAt: number;
  isBlocked?: boolean;
};

/**
 * An app picked through the iOS Screen Time (FamilyActivityPicker) sheet.
 * `identifier` is the base64-encoded Apple `ApplicationToken`. on Android the
 * equivalent identifier is the package name (`com.instagram.android`).
 */
export type SelectedAppInfo = {
  identifier: string;
  name: string | null;
};

export type MonitoringConfig = {
  intervalMs?: number;
  blockedUntil?: number;
  blockedApps?: { packageName: string; appName: string }[];
};

type NativeModule = {
  isUsageAccessGranted(): Promise<boolean>;
  openUsageAccessSettings(): Promise<void>;
  canDrawOverlays(): Promise<boolean>;
  openOverlaySettings(): Promise<void>;
  getCurrentForegroundApp(): Promise<ForegroundAppInfo | null>;
  startMonitoring(
    intervalMs: number,
    blockedUntil: number,
    packageNames: string[],
    appNames: string[],
  ): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  isMonitoring(): Promise<boolean>;
  consumeOverlayStopRequest(): Promise<boolean>;
  syncMoodIntervention(
    packageNames: string[],
    appNames: string[],
    cooldownMs: number,
  ): Promise<boolean>;
  /** iOS only — requests FamilyControls / Screen Time authorization. */
  requestAuthorization?(): Promise<boolean>;
  /** iOS only — presents the system FamilyActivityPicker. */
  presentAppSelectionPicker?(): Promise<SelectedAppInfo[] | null>;
  addListener(
    eventName:
      | 'onForegroundAppChanged'
      | 'onBlockedAppIntercepted'
      | 'onMonitoringStoppedFromOverlay'
      | 'onMoodInterventionCompleted',
    listener: (event: ForegroundAppEvent) => void,
  ): EventSubscription;
};

const LINKING_ERROR =
  'ZenAppUsage native module is unavailable. Build a custom Android or iOS development client (Expo Go is not supported).';

function getNativeModule(): NativeModule {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    throw new Error('ZenAppUsage is only available on Android and iOS.');
  }

  try {
    return requireNativeModule<NativeModule>('ZenAppUsage');
  } catch {
    throw new Error(LINKING_ERROR);
  }
}

function tryGetNativeModule(): NativeModule | null {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return null;
  }
  try {
    return requireNativeModule<NativeModule>('ZenAppUsage');
  } catch {
    return null;
  }
}

export async function isUsageAccessGranted(): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  return native.isUsageAccessGranted();
}

export async function openUsageAccessSettings(): Promise<void> {
  await getNativeModule().openUsageAccessSettings();
}

export async function canDrawOverlays(): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  return native.canDrawOverlays();
}

export async function openOverlaySettings(): Promise<void> {
  await getNativeModule().openOverlaySettings();
}

/**
 * iOS only — request FamilyControls / Screen Time authorization.
 * No-op (always true) on Android so shared call-sites stay platform-neutral.
 */
export async function requestAuthorization(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return true;
  }
  const native = tryGetNativeModule();
  if (!native?.requestAuthorization) {
    return false;
  }
  return native.requestAuthorization();
}

/**
 * iOS only — present the system FamilyActivityPicker and return the selected
 * apps as base64-encoded ApplicationTokens. Returns null on Android (and when
 * the user cancels), so shared call-sites can fall back to platform lists.
 */
export async function presentAppSelectionPicker(): Promise<
  SelectedAppInfo[] | null
> {
  if (Platform.OS !== 'ios') {
    return null;
  }
  const native = tryGetNativeModule();
  if (!native?.presentAppSelectionPicker) {
    return null;
  }
  return native.presentAppSelectionPicker();
}

export async function getCurrentForegroundApp(): Promise<ForegroundAppInfo | null> {
  return getNativeModule().getCurrentForegroundApp();
}

export async function startMonitoring(
  config: MonitoringConfig = {},
): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  const apps = config.blockedApps ?? [];
  return native.startMonitoring(
    config.intervalMs ?? 1500,
    config.blockedUntil ?? 0,
    apps.map((app) => app.packageName),
    apps.map((app) => app.appName),
  );
}

export async function stopMonitoring(): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  return native.stopMonitoring();
}

export async function isMonitoring(): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  return native.isMonitoring();
}

export function addForegroundAppListener(
  listener: (event: ForegroundAppEvent) => void,
): EventSubscription {
  return getNativeModule().addListener('onForegroundAppChanged', listener);
}

export function addBlockedInterceptListener(
  listener: (event: ForegroundAppEvent) => void,
): EventSubscription {
  return getNativeModule().addListener('onBlockedAppIntercepted', listener);
}

export async function consumeOverlayStopRequest(): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  return native.consumeOverlayStopRequest();
}

export async function syncMoodIntervention(config: {
  packages: string[];
  names: string[];
  cooldownMs?: number;
}): Promise<boolean> {
  const native = tryGetNativeModule();
  if (!native) {
    return false;
  }
  return native.syncMoodIntervention(
    config.packages,
    config.names,
    config.cooldownMs ?? 45 * 1000,
  );
}

export function addMonitoringStoppedFromOverlayListener(
  listener: () => void,
): EventSubscription {
  return getNativeModule().addListener('onMonitoringStoppedFromOverlay', () => {
    listener();
  });
}

export function addMoodInterventionCompletedListener(
  listener: (event: { packageName: string }) => void,
): EventSubscription {
  return getNativeModule().addListener(
    'onMoodInterventionCompleted',
    (event) => {
      listener({ packageName: event.packageName });
    },
  );
}

export type { ForegroundAppInfo };
