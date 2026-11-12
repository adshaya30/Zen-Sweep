export const MOOD_INTERVENTION_KEY = '@zen_sweep/mood_intervention';

export const DEFAULT_MOOD_COOLDOWN_MS = 45 * 1000;

export type MoodId =
  'happy' | 'calm' | 'neutral' | 'stressed' | 'lonely' | 'sad' | 'tired';

export type MoodInterventionApp = {
  packageName: string;
  appName: string;
  enabled: boolean;
};

export type MoodInterventionConfig = {
  apps: MoodInterventionApp[];
  cooldownMs: number;
};

export const INTERVENTION_MOODS: {
  id: MoodId;
  emoji: string;
  label: string;
}[] = [
  { id: 'happy', emoji: '😊', label: 'Happy' },
  { id: 'calm', emoji: '😌', label: 'Calm' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'stressed', emoji: '😣', label: 'Stressed' },
  { id: 'lonely', emoji: '🥺', label: 'Lonely' },
  { id: 'sad', emoji: '😔', label: 'Sad' },
  { id: 'tired', emoji: '😴', label: 'Tired' },
];
