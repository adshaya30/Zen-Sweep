import AsyncStorage from '@react-native-async-storage/async-storage';

export type InsightsStats = {
  prevented: number;
  timeSavedMinutes: number;
};

const KEY = '@zen_sweep/insights_stats';

export async function getInsightsStats(): Promise<InsightsStats> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) {
    return { prevented: 0, timeSavedMinutes: 0 };
  }
  try {
    const parsed = JSON.parse(raw) as InsightsStats;
    return {
      prevented: parsed.prevented ?? 0,
      timeSavedMinutes: parsed.timeSavedMinutes ?? 0,
    };
  } catch {
    return { prevented: 0, timeSavedMinutes: 0 };
  }
}

async function saveInsightsStats(stats: InsightsStats): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(stats));
}

export async function incrementPrevented(): Promise<InsightsStats> {
  const current = await getInsightsStats();
  const next = { ...current, prevented: current.prevented + 1 };
  await saveInsightsStats(next);
  return next;
}

export async function addTimeSaved(minutes: number): Promise<InsightsStats> {
  const current = await getInsightsStats();
  const next = {
    ...current,
    timeSavedMinutes: current.timeSavedMinutes + Math.max(0, minutes),
  };
  await saveInsightsStats(next);
  return next;
}
