export type MoodOption = {
  id: string;
  emoji: string;
  label: string;
};

export type DummyApp = {
  id: string;
  name: string;
  icon: string;
};

export type DurationOption = {
  id: string;
  label: string;
  minutes: number | null;
};

export const MOODS: MoodOption[] = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'lonely', emoji: '😶', label: 'Lonely' },
  { id: 'stressed', emoji: '😩', label: 'Stressed' },
  { id: 'bored', emoji: '😐', label: 'Bored' },
];

export const DUMMY_APPS: DummyApp[] = [
  { id: 'instagram', name: 'Instagram', icon: '📷' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'facebook', name: 'Facebook', icon: 'f' },
];

export const DURATIONS: DurationOption[] = [
  { id: '15', label: '15 minutes', minutes: 15 },
  { id: '30', label: '30 minutes', minutes: 30 },
  { id: '60', label: '1 hour', minutes: 60 },
  { id: '120', label: '2 hours', minutes: 120 },
  { id: 'custom', label: 'Custom', minutes: null },
];

/** Custom duration placeholder until a picker is added. */
export const CUSTOM_DURATION_MINUTES = 45;

export function durationToSeconds(
  durationId: string,
  durationLabel: string,
): number {
  const match = DURATIONS.find((d) => d.id === durationId);
  if (match?.minutes != null) {
    return match.minutes * 60;
  }
  if (durationId === 'custom') {
    return CUSTOM_DURATION_MINUTES * 60;
  }
  const parsed = Number.parseInt(durationLabel, 10);
  return Number.isFinite(parsed) ? parsed * 60 : 30 * 60;
}

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
