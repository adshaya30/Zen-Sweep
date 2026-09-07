import { Platform } from 'react-native';
import * as ZenAppUsage from 'zen-app-usage';

import { getUserPreferences } from '../onboarding/storage';
import { TRAP_APP_OPTIONS } from '../onboarding/types';
import {
  getEnabledMoodApps,
  getMoodInterventionConfig,
  setMoodEnabledForApp,
} from './storage';
import { DEFAULT_MOOD_COOLDOWN_MS } from './types';

/**
 * Push mood-enabled packages to native monitoring.
 * Does not change timer-block packages / blockedUntil.
 */
export async function syncMoodInterventionToNative(): Promise<boolean> {
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') {
    return false;
  }
  try {
    const config = await getMoodInterventionConfig();
    let enabled = await getEnabledMoodApps();
    if (enabled.length === 0) {
      const prefs = await getUserPreferences();
      for (const pkg of prefs?.trapApps ?? []) {
        const match = TRAP_APP_OPTIONS.find((app) => app.packageName === pkg);
        if (match) {
          await setMoodEnabledForApp(match.packageName, match.label, true);
        }
      }
      enabled = await getEnabledMoodApps();
    }
    return ZenAppUsage.syncMoodIntervention({
      packages: enabled.map((app) => app.packageName),
      names: enabled.map((app) => app.appName),
      cooldownMs: config.cooldownMs ?? DEFAULT_MOOD_COOLDOWN_MS,
    });
  } catch {
    return false;
  }
}
