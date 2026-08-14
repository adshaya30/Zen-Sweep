import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BlockPrimaryButton } from '../components/BlockPrimaryButton';
import { useAppUsageMonitoring } from '../hooks/useAppUsageMonitoring';

export function AppUsageTestScreen() {
  const navigation = useNavigation();
  const {
    usageAccessGranted,
    monitoring,
    currentPackageName,
    currentAppName,
    lastDetection,
    activeSession,
    nativeAvailable,
    error,
    refreshPermission,
    start,
    stop,
    openUsageAccessSettings,
  } = useAppUsageMonitoring({ autoStart: false, intervalMs: 2000 });

  useFocusEffect(
    useCallback(() => {
      void refreshPermission();
    }, [refreshPermission]),
  );

  const detectionLabel = !currentPackageName
    ? 'WAITING FOR APP SWITCH'
    : lastDetection?.isBlocked
      ? 'BLOCKED APP DETECTED'
      : 'ALLOWED APP';

  return (
    <SafeAreaView className="flex-1 bg-block-bg" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text className="mb-4 text-base text-block-lavender">← Back</Text>
        </Pressable>

        <Text className="text-2xl font-bold text-white">
          Zen Sweep — App Detection Test
        </Text>
        <Text className="mt-2 text-sm leading-5 text-block-muted">
          Detection only. Opening a blocked app will be logged here — it will
          not be closed yet.
        </Text>

        {!nativeAvailable || error ? (
          <View className="mt-5 rounded-3xl bg-block-card p-5">
            <Text className="text-base font-semibold text-red-300">
              Development build required
            </Text>
            <Text className="mt-2 text-sm leading-5 text-block-muted">
              {error ??
                'Expo Go cannot access UsageStatsManager. Run a custom Android build.'}
            </Text>
          </View>
        ) : null}

        <View className="mt-5 rounded-3xl bg-block-card p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-block-muted">
            Usage Access
          </Text>
          {usageAccessGranted ? (
            <Text className="mt-3 text-lg font-bold text-block-lavender">
              ✓ Enabled
            </Text>
          ) : (
            <>
              <Text className="mt-3 text-lg font-bold text-white">
                Usage Access Required
              </Text>
              <Text className="mt-2 text-sm leading-5 text-block-muted">
                Zen Sweep needs Usage Access to detect which app is currently
                being used.
              </Text>
              <View className="mt-4">
                <BlockPrimaryButton
                  label="Enable Usage Access"
                  onPress={() => {
                    void openUsageAccessSettings();
                  }}
                />
              </View>
            </>
          )}
        </View>

        <View className="mt-4 rounded-3xl bg-block-card p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-block-muted">
            Monitoring
          </Text>
          <Text className="mt-3 text-lg font-bold text-white">
            {monitoring ? '● Running' : '○ Stopped'}
          </Text>
          <View className="mt-4 flex-row gap-3">
            <View className="flex-1">
              <BlockPrimaryButton
                label="Start"
                disabled={!usageAccessGranted || monitoring}
                onPress={() => {
                  void start();
                }}
              />
            </View>
            <View className="flex-1">
              <BlockPrimaryButton
                label="Stop"
                variant="ghost"
                disabled={!monitoring}
                onPress={() => {
                  void stop();
                }}
              />
            </View>
          </View>
        </View>

        <View className="mt-4 rounded-3xl bg-block-card p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-block-muted">
            Current App
          </Text>
          <Text className="mt-3 text-2xl font-bold text-white">
            {currentAppName ?? '—'}
          </Text>
          <Text className="mt-4 text-sm font-semibold uppercase tracking-wide text-block-muted">
            Package
          </Text>
          <Text className="mt-2 font-mono text-sm text-block-lavender">
            {currentPackageName ?? '—'}
          </Text>
        </View>

        <View className="mt-4 rounded-3xl bg-block-card p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-block-muted">
            Blocking Session
          </Text>
          <Text className="mt-3 text-lg font-bold text-white">
            {activeSession ? 'ACTIVE' : 'NONE'}
          </Text>
          {activeSession ? (
            <>
              <Text className="mt-4 text-sm font-semibold uppercase tracking-wide text-block-muted">
                Blocked Apps
              </Text>
              {activeSession.blockedApps.map((app) => (
                <Text
                  key={app.packageName}
                  className="mt-2 text-base text-white"
                >
                  ✓ {app.appName}
                </Text>
              ))}
            </>
          ) : (
            <Text className="mt-2 text-sm text-block-muted">
              Start a session from the Blocks tab first (e.g. Instagram · 15
              min).
            </Text>
          )}
        </View>

        <View className="mt-4 rounded-3xl bg-block-card p-5">
          <Text className="text-sm font-semibold uppercase tracking-wide text-block-muted">
            Detection Result
          </Text>
          <Text
            className={`mt-3 text-xl font-bold ${
              lastDetection?.isBlocked ? 'text-red-300' : 'text-block-lavender'
            }`}
          >
            {detectionLabel}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
