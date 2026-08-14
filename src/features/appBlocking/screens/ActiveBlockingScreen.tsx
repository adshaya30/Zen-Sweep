import { StatusBar } from 'expo-status-bar';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  ScrollView,
  StatusBar as RNStatusBar,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockedAppOverlay } from '../components/BlockedAppOverlay';
import { BlockPrimaryButton } from '../components/BlockPrimaryButton';
import { BlockingAppList } from '../components/BlockingAppList';
import { BlockingTimer } from '../components/BlockingTimer';
import { formatEndTime, useBlockingSession } from '../hooks/useBlockingSession';
import { incrementPrevented, addTimeSaved } from '../../insights/storage';
import { syncMoodInterventionToNative } from '../../moodIntervention/sync';
import {
  AppUsageService,
  onBlockedAppIntercepted,
} from '../services/appUsageService';

export function ActiveBlockingScreen() {
  const navigation = useNavigation();
  const {
    session,
    isLoading,
    isActive,
    remainingSeconds,
    refresh,
    stopSession,
  } = useBlockingSession();
  const [completed, setCompleted] = useState(false);
  const [interceptedApp, setInterceptedApp] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);
  const savedTimeRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refresh();
      }
    });
    return () => sub.remove();
  }, [refresh]);

  useEffect(() => {
    if (!isLoading && !session && !stopping) {
      goToFrontPage();
    }
  }, [isLoading, session, stopping]);

  useEffect(() => {
    if (session && !session.isActive && !savedTimeRef.current) {
      savedTimeRef.current = true;
      setCompleted(true);
      void addTimeSaved(session.durationMinutes);
      void (async () => {
        await AppUsageService.stopMonitoring();
        await syncMoodInterventionToNative();
      })();
    }
  }, [session]);

  useEffect(() => {
    if (!session?.isActive) {
      return;
    }
    void AppUsageService.startMonitoring(session);
  }, [session?.id, session?.isActive, session?.blockedUntil]);

  useEffect(() => {
    const sub = onBlockedAppIntercepted((detection) => {
      setInterceptedApp(detection.appName ?? detection.packageName);
      void incrementPrevented();
      void refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const goToFrontPage = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main', params: { screen: 'Blocks' } }],
      }),
    );
  };

  const handleStop = async () => {
    if (stopping) {
      return;
    }
    setStopping(true);
    await AppUsageService.stopMonitoring();
    await stopSession();
    await syncMoodInterventionToNative();
    goToFrontPage();
  };

  const appsWithIcons = session?.blockedApps ?? [];

  if (isLoading || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-zen-cream">
        <ActivityIndicator color="#1B3B2B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top', 'bottom']}>
      {/* Dark icons + cream bar — readable on light screens */}
      <StatusBar style="dark" />
      <RNStatusBar
        barStyle="dark-content"
        backgroundColor="#FDFBE4"
        translucent={false}
      />
      <View className="flex-1 px-5 pt-2">
        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-2"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <Text className="text-center text-[26px] font-bold text-zen-forest">
            {completed || !isActive ? 'Session Complete' : 'Blocking Active'}
          </Text>
          {isActive ? (
            <Text className="mt-0.5 text-center text-[13px] font-semibold text-zen-growth">
              Timer is running
            </Text>
          ) : null}

          <View className="mt-3">
            <BlockingAppList
              apps={appsWithIcons}
              compact={appsWithIcons.length > 6}
              onAppPress={(app) => {
                if (!isActive) {
                  return;
                }
                setInterceptedApp(app.appName);
              }}
            />
          </View>

          <View className="mt-2.5">
            <BlockingTimer
              remainingSeconds={remainingSeconds}
              endsAtLabel={formatEndTime(session.blockedUntil)}
              completed={completed || !isActive}
            />
          </View>

          <Text className="mt-2.5 text-center text-[12px] leading-5 text-zen-muted">
            Opening a blocked app covers it with Zen Sweep. The timer keeps
            counting until you stop.
          </Text>
        </ScrollView>

        <View className="gap-2.5 pb-3 pt-2">
          <BlockPrimaryButton
            label={stopping ? 'Stopping…' : 'Stop Blocking'}
            variant="danger"
            disabled={stopping}
            onPress={() => {
              void handleStop();
            }}
          />
          <BlockPrimaryButton
            label="Back to Block"
            variant="ghost"
            disabled={stopping}
            onPress={() => {
              void handleStop();
            }}
          />
        </View>
      </View>

      <BlockedAppOverlay
        visible={Boolean(interceptedApp) && isActive}
        appName={interceptedApp ?? 'This app'}
        remainingSeconds={remainingSeconds}
        endsAtLabel={formatEndTime(session.blockedUntil)}
        onStayFocused={() => setInterceptedApp(null)}
      />
    </SafeAreaView>
  );
}
