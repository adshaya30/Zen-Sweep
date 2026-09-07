import { Alert, Platform } from 'react-native';
import * as ZenAppUsage from 'zen-app-usage';

import type {
  BlockingSession,
  AppUsageDetection,
  AppInfo,
} from '../types/blocking';

import {
  endBlockingSession,
  getActiveBlockingSession,
} from './blockingStorage';
import { getInstalledApps } from './installedApps';
import { syncMoodInterventionToNative } from '../../moodIntervention/sync';

export type AppUsageService = {
  isUsageAccessGranted(): Promise<boolean>;
  openUsageAccessSettings(): Promise<void>;
  canDrawOverlays(): Promise<boolean>;
  openOverlaySettings(): Promise<void>;
  getCurrentForegroundApp(): Promise<string | null>;
  getCurrentForegroundAppDetails(): Promise<{
    packageName: string;
    appName: string | null;
  } | null>;
  startMonitoring(session?: BlockingSession | null): Promise<boolean>;
  stopMonitoring(): Promise<boolean>;
  isMonitoring(): Promise<boolean>;
  consumeOverlayStopRequest(): Promise<boolean>;
  /**
   * Select apps to block.
   * - Android: returns the curated installed-app list (no native scan).
   * - iOS: presents the system Screen Time (FamilyActivityPicker) sheet and
   *   returns base64 ApplicationTokens as identifiers.
   */
  pickBlockedApps(): Promise<AppInfo[]>;
  evaluateForegroundAgainstSession(
    packageName: string,
    appName?: string | null,
  ): Promise<AppUsageDetection | null>;
  ensureEnforcementPermissions(): Promise<{
    usageAccess: boolean;
    overlay: boolean;
  }>;
};

function unsupported(): never {
  throw new Error(
    'App blocking requires an Android or iOS development build (not Expo Go / web).',
  );
}

export const AppUsageService: AppUsageService = {
  async isUsageAccessGranted() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }
    return ZenAppUsage.isUsageAccessGranted();
  },

  async openUsageAccessSettings() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      unsupported();
    }
    await ZenAppUsage.openUsageAccessSettings();
  },

  async canDrawOverlays() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }
    return ZenAppUsage.canDrawOverlays();
  },

  async openOverlaySettings() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      unsupported();
    }
    await ZenAppUsage.openOverlaySettings();
  },

  async getCurrentForegroundApp() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return null;
    }
    const info = await ZenAppUsage.getCurrentForegroundApp();
    return info?.packageName ?? null;
  },

  async getCurrentForegroundAppDetails() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return null;
    }
    return ZenAppUsage.getCurrentForegroundApp();
  },

  async startMonitoring(session) {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }
    return ZenAppUsage.startMonitoring({
      intervalMs: 1500,
      blockedUntil: session?.blockedUntil ?? 0,
      blockedApps: session?.blockedApps ?? [],
    });
  },

  async stopMonitoring() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }
    return ZenAppUsage.stopMonitoring();
  },

  async isMonitoring() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }
    return ZenAppUsage.isMonitoring();
  },

  async consumeOverlayStopRequest() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return false;
    }
    return ZenAppUsage.consumeOverlayStopRequest();
  },

  async pickBlockedApps() {
    if (Platform.OS === 'ios') {
      const picked = await ZenAppUsage.presentAppSelectionPicker();
      if (!picked?.length) {
        return [];
      }
      return picked.map((app, index) => ({
        packageName: app.identifier,
        appName: app.name ?? `Selected App ${index + 1}`,
      }));
    }
    return getInstalledApps();
  },

  async evaluateForegroundAgainstSession(packageName, appName) {
    const session = await getActiveBlockingSession();
    if (!session) {
      return null;
    }

    if (Date.now() >= session.blockedUntil) {
      await endBlockingSession();
      await ZenAppUsage.stopMonitoring();
      await syncMoodInterventionToNative();
      return null;
    }

    const blockedApp = session.blockedApps.find(
      (app) => app.packageName === packageName,
    );

    const detection: AppUsageDetection = {
      packageName,
      appName: blockedApp?.appName ?? appName ?? undefined,
      detectedAt: Date.now(),
      isBlocked: Boolean(blockedApp),
    };

    if (detection.isBlocked) {
      console.log(`Blocked app detected: ${detection.appName ?? packageName}`);
    }

    return detection;
  },

  async ensureEnforcementPermissions() {
    if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
      return { usageAccess: false, overlay: false };
    }

    const usageAccess = await ZenAppUsage.isUsageAccessGranted();
    const overlay = await ZenAppUsage.canDrawOverlays();
    return { usageAccess, overlay };
  },
};

export async function promptEnforcementPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    Alert.alert(
      'Device required',
      'App blocking only works on a real mobile device (Android or iOS) with the Zen Sweep development build installed. The web preview cannot stop other apps.',
    );
    return false;
  }

  if (Platform.OS === 'ios') {
    // Request FamilyControls authorization up front — if granted, the native
    // module can immediately apply Screen-Time shields for the session.
    const approved = await ZenAppUsage.requestAuthorization();
    if (approved) {
      return true;
    }
  }

  const { usageAccess, overlay } =
    await AppUsageService.ensureEnforcementPermissions();

  if (!usageAccess) {
    Alert.alert(
      Platform.OS === 'ios'
        ? 'Screen Time Permission required'
        : 'Usage Access required',
      Platform.OS === 'ios'
        ? 'Zen Sweep needs Screen Time permission to shield blocked apps during focus sessions.'
        : 'Zen Sweep needs Usage Access to know when you open WhatsApp or other apps.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Open settings',
          onPress: () => {
            void AppUsageService.openUsageAccessSettings();
          },
        },
      ],
    );
    return false;
  }

  if (!overlay && Platform.OS === 'android') {
    Alert.alert(
      'Display over other apps',
      'To cover WhatsApp when it opens, allow Zen Sweep to display over other apps.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Open settings',
          onPress: () => {
            void AppUsageService.openOverlaySettings();
          },
        },
      ],
    );
    return false;
  }

  return true;
}

export function onAppDetected(
  listener: (detection: AppUsageDetection) => void,
) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return { remove: () => undefined };
  }

  return ZenAppUsage.addForegroundAppListener((event) => {
    void (async () => {
      const detection = await AppUsageService.evaluateForegroundAgainstSession(
        event.packageName,
        event.appName,
      );
      listener(
        detection ?? {
          packageName: event.packageName,
          appName: event.appName ?? undefined,
          detectedAt: event.detectedAt,
          isBlocked: Boolean(event.isBlocked),
        },
      );
    })();
  });
}

export function onBlockedAppIntercepted(
  listener: (detection: AppUsageDetection) => void,
) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return { remove: () => undefined };
  }

  return ZenAppUsage.addBlockedInterceptListener((event) => {
    listener({
      packageName: event.packageName,
      appName: event.appName ?? undefined,
      detectedAt: event.detectedAt,
      isBlocked: true,
    });
  });
}

export function onMonitoringStoppedFromOverlay(listener: () => void) {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return { remove: () => undefined };
  }

  return ZenAppUsage.addMonitoringStoppedFromOverlayListener(listener);
}
