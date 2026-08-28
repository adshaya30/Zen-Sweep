import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { saveUserPreferences } from './storage';
import {
  DEFAULT_PREFERENCES,
  type UserPreferences,
} from './types';

type Draft = Omit<UserPreferences, 'completedAt'>;

type OnboardingContextValue = {
  draft: Draft;
  update: (patch: Partial<Draft>) => void;
  complete: () => Promise<UserPreferences>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(DEFAULT_PREFERENCES);

  const update = useCallback((patch: Partial<Draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
  }, []);

  const complete = useCallback(async () => {
    const prefs: UserPreferences = {
      ...draft,
      name: draft.name.trim(),
      completedAt: Date.now(),
    };
    await saveUserPreferences(prefs);
    return prefs;
  }, [draft]);

  const value = useMemo(
    () => ({ draft, update, complete }),
    [draft, update, complete],
  );

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboardingDraft() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboardingDraft must be used inside OnboardingProvider');
  }
  return ctx;
}
