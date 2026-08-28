import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { AppUsageService, onAppDetected } from '../services/appUsageService';
import { getActiveBlockingSession } from '../services/blockingStorage';
import type { AppUsageDetection, BlockingSession } from '../types/blocking';

type UseAppUsageMonitoringOptions = {
  /** Poll / emit interval for the native foreground service. */
  intervalMs?: number;
  /** Auto-start native monitoring when usage access is granted. */
  autoStart?: boolean;
};

export function useAppUsageMonitoring(
  options: UseAppUsageMonitoringOptions = {},
) {
  const { intervalMs = 2000, autoStart = false } = options;

  const [usageAccessGranted, setUsageAccessGranted] = useState(false);
  const [monitoring, setMonitoring] = useState(false);
  const [currentPackageName, setCurrentPackageName] = useState<string | null>(
    null,
  );
  const [currentAppName, setCurrentAppName] = useState<string | null>(null);
  const [lastDetection, setLastDetection] = useState<AppUsageDetection | null>(
    null,
  );
  const [activeSession, setActiveSession] = useState<BlockingSession | null>(
    null,
  );
  const [nativeAvailable, setNativeAvailable] = useState(
    Platform.OS === 'android',
  );
  const [error, setError] = useState<string | null>(null);

  const listenerRef = useRef<ReturnType<typeof onAppDetected> | null>(null);

  const refreshPermission = useCallback(async () => {
    try {
      const granted = await AppUsageService.isUsageAccessGranted();
      setUsageAccessGranted(granted);
      setNativeAvailable(true);
      setError(null);
      return granted;
    } catch (err) {
      setNativeAvailable(false);
      setUsageAccessGranted(false);
      setError(
        err instanceof Error
          ? err.message
          : 'Native usage module is unavailable. Use a development build.',
      );
      return false;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const session = await getActiveBlockingSession();
    setActiveSession(session);
    return session;
  }, []);

  const refreshCurrentApp = useCallback(async () => {
    try {
      const details = await AppUsageService.getCurrentForegroundAppDetails();
      if (details) {
        setCurrentPackageName(details.packageName);
        setCurrentAppName(details.appName);
        const detection =
          await AppUsageService.evaluateForegroundAgainstSession(
            details.packageName,
            details.appName,
          );
        if (detection) {
          setLastDetection(detection);
        }
      }
    } catch {
      // Ignore when permission not granted / module missing.
    }
  }, []);

  const start = useCallback(async () => {
    const granted = await refreshPermission();
    if (!granted) {
      return false;
    }
    const session = await refreshSession();
    const started = await AppUsageService.startMonitoring(session);
    setMonitoring(started);
    await refreshCurrentApp();
    return started;
  }, [refreshPermission, refreshSession, refreshCurrentApp]);

  const stop = useCallback(async () => {
    await AppUsageService.stopMonitoring();
    setMonitoring(false);
  }, []);

  useEffect(() => {
    void refreshPermission();
    void refreshSession();
  }, [refreshPermission, refreshSession]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermission();
        void refreshSession();
        void refreshCurrentApp();
        void AppUsageService.isMonitoring().then(setMonitoring);
      }
    });
    return () => sub.remove();
  }, [refreshPermission, refreshSession, refreshCurrentApp]);

  useEffect(() => {
    if (!autoStart) {
      return;
    }
    void (async () => {
      const granted = await refreshPermission();
      if (granted) {
        await start();
      }
    })();
  }, [autoStart, refreshPermission, start]);

  useEffect(() => {
    if (!usageAccessGranted) {
      return;
    }

    listenerRef.current = onAppDetected((detection) => {
      setCurrentPackageName(detection.packageName);
      setCurrentAppName(detection.appName ?? null);
      setLastDetection(detection);
      void refreshSession();
    });

    return () => {
      listenerRef.current?.remove();
      listenerRef.current = null;
    };
  }, [usageAccessGranted, refreshSession]);

  return {
    usageAccessGranted,
    monitoring,
    currentPackageName,
    currentAppName,
    lastDetection,
    activeSession,
    nativeAvailable,
    error,
    refreshPermission,
    refreshSession,
    refreshCurrentApp,
    start,
    stop,
    openUsageAccessSettings: AppUsageService.openUsageAccessSettings,
  };
}
