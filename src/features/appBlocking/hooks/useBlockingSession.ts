import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import {
  clearBlockingSession,
  restoreBlockingSession,
  saveBlockingSession,
} from '../services/blockingStorage';
import { AppUsageService, onMonitoringStoppedFromOverlay } from '../services/appUsageService';
import type { AppInfo, BlockingSession } from '../types/blocking';

function createSessionId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function getRemainingSeconds(session: BlockingSession | null): number {
  if (!session?.isActive) {
    return 0;
  }
  return Math.max(0, Math.ceil((session.blockedUntil - Date.now()) / 1000));
}

export function remainingFromUntil(blockedUntil: number): number {
  return Math.max(0, Math.ceil((blockedUntil - Date.now()) / 1000));
}

export function formatRemainingTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatEndTime(blockedUntil: number): string {
  return new Date(blockedUntil).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function useBlockingSession() {
  const [session, setSession] = useState<BlockingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const sessionRef = useRef<BlockingSession | null>(null);

  const refresh = useCallback(async () => {
    if (Platform.OS === 'android') {
      const stoppedFromOverlay =
        await AppUsageService.consumeOverlayStopRequest();
      if (stoppedFromOverlay) {
        await clearBlockingSession();
        sessionRef.current = null;
        setSession(null);
        setRemainingSeconds(0);
        return null;
      }
    }
    const restored = await restoreBlockingSession();
    sessionRef.current = restored;
    setSession(restored);
    setRemainingSeconds(getRemainingSeconds(restored));
    return restored;
  }, []);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (Platform.OS === 'android') {
        const stoppedFromOverlay =
          await AppUsageService.consumeOverlayStopRequest();
        if (stoppedFromOverlay) {
          await clearBlockingSession();
          if (!mounted) {
            return;
          }
          sessionRef.current = null;
          setSession(null);
          setRemainingSeconds(0);
          setIsLoading(false);
          return;
        }
      }
      const restored = await restoreBlockingSession();
      if (!mounted) {
        return;
      }
      sessionRef.current = restored;
      setSession(restored);
      setRemainingSeconds(getRemainingSeconds(restored));
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const syncFromClock = () => {
      const current = sessionRef.current;
      if (!current?.isActive) {
        setRemainingSeconds(0);
        return 0;
      }
      const remaining = remainingFromUntil(current.blockedUntil);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        const completed: BlockingSession = { ...current, isActive: false };
        sessionRef.current = completed;
        setSession(completed);
        void saveBlockingSession(completed);
      }
      return remaining;
    };

    if (!session?.isActive) {
      setRemainingSeconds(0);
      return;
    }

    syncFromClock();
    const intervalId = setInterval(syncFromClock, 250);

    const appSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncFromClock();
      }
    });

    const onVisibility = () => {
      if (Platform.OS === 'web' && document.visibilityState === 'visible') {
        syncFromClock();
      }
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibility);
    }

    return () => {
      clearInterval(intervalId);
      appSub.remove();
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibility);
      }
    };
  }, [session?.id, session?.isActive, session?.blockedUntil]);

  const startSession = useCallback(
    async (apps: AppInfo[], durationMinutes: number) => {
      const current = await restoreBlockingSession();
      if (current?.isActive) {
        return {
          ok: false as const,
          reason: 'active_session_exists' as const,
          session: current,
        };
      }

      const startedAt = Date.now();
      const next: BlockingSession = {
        id: createSessionId(),
        blockedApps: apps.map(({ packageName, appName }) => ({
          packageName,
          appName,
        })),
        startedAt,
        blockedUntil: startedAt + durationMinutes * 60 * 1000,
        durationMinutes,
        isActive: true,
      };

      await saveBlockingSession(next);
      sessionRef.current = next;
      setSession(next);
      setRemainingSeconds(getRemainingSeconds(next));
      return { ok: true as const, session: next };
    },
    [],
  );

  const stopSession = useCallback(async () => {
    await clearBlockingSession();
    sessionRef.current = null;
    setSession(null);
    setRemainingSeconds(0);
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const overlaySub = onMonitoringStoppedFromOverlay(() => {
      void stopSession();
    });

    const appSub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        return;
      }
      void (async () => {
        const stopped = await AppUsageService.consumeOverlayStopRequest();
        if (stopped) {
          await stopSession();
        }
      })();
    });

    return () => {
      overlaySub.remove();
      appSub.remove();
    };
  }, [stopSession]);

  return {
    session,
    isLoading,
    remainingSeconds,
    isActive: Boolean(session?.isActive),
    isCompleted: Boolean(session && !session.isActive && session.blockedUntil),
    refresh,
    startSession,
    stopSession,
  };
}
