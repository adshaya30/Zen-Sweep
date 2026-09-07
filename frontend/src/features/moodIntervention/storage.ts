import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  DEFAULT_MOOD_COOLDOWN_MS,
  MOOD_INTERVENTION_KEY,
  type MoodInterventionApp,
  type MoodInterventionConfig,
} from './types';

export async function getMoodInterventionConfig(): Promise<MoodInterventionConfig> {
  const raw = await AsyncStorage.getItem(MOOD_INTERVENTION_KEY);
  if (!raw) {
    return { apps: [], cooldownMs: DEFAULT_MOOD_COOLDOWN_MS };
  }
  try {
    const parsed = JSON.parse(raw) as MoodInterventionConfig;
    return {
      apps: parsed.apps ?? [],
      cooldownMs: parsed.cooldownMs ?? DEFAULT_MOOD_COOLDOWN_MS,
    };
  } catch {
    return { apps: [], cooldownMs: DEFAULT_MOOD_COOLDOWN_MS };
  }
}

export async function saveMoodInterventionConfig(
  config: MoodInterventionConfig,
): Promise<void> {
  await AsyncStorage.setItem(MOOD_INTERVENTION_KEY, JSON.stringify(config));
}

export async function setMoodEnabledForApp(
  packageName: string,
  appName: string,
  enabled: boolean,
): Promise<MoodInterventionConfig> {
  const current = await getMoodInterventionConfig();
  const without = current.apps.filter((app) => app.packageName !== packageName);
  const nextApps: MoodInterventionApp[] = enabled
    ? [...without, { packageName, appName, enabled: true }]
    : without;
  const next = { ...current, apps: nextApps };
  await saveMoodInterventionConfig(next);
  return next;
}

export async function isMoodEnabled(packageName: string): Promise<boolean> {
  const config = await getMoodInterventionConfig();
  return config.apps.some(
    (app) => app.packageName === packageName && app.enabled,
  );
}

export async function getEnabledMoodApps(): Promise<MoodInterventionApp[]> {
  const config = await getMoodInterventionConfig();
  return config.apps.filter((app) => app.enabled);
}
