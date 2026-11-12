import { StatusBar } from 'expo-status-bar';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppSelectionCard } from '../components/AppSelectionCard';
import { BlockPrimaryButton } from '../components/BlockPrimaryButton';
import { BlockingAppList } from '../components/BlockingAppList';
import { CustomDurationPicker } from '../components/CustomDurationPicker';
import {
  DurationSelector,
  type DurationChip,
} from '../components/DurationSelector';
import { useBlockingSession } from '../hooks/useBlockingSession';
import { getUserPreferences } from '../../onboarding/storage';
import {
  getMoodInterventionConfig,
  setMoodEnabledForApp,
} from '../../moodIntervention/storage';
import { syncMoodInterventionToNative } from '../../moodIntervention/sync';
import { getInstalledApps } from '../services/installedApps';
import {
  AppUsageService,
  promptEnforcementPermissions,
} from '../services/appUsageService';
import type { AppInfo, DurationOptionId } from '../types/blocking';

const DURATION_OPTIONS: DurationChip[] = [
  { id: '15', label: '15\nMINS', minutes: 15, kind: 'clock' },
  { id: '30', label: '30\nMINS', minutes: 30, kind: 'clock' },
  { id: '60', label: '1\nHR', minutes: 60, kind: 'clock' },
  { id: '120', label: '2\nHRS', minutes: 120, kind: 'clock' },
  { id: 'custom', label: '+', minutes: null, kind: 'add' },
];

export function AppBlockingSetupScreen() {
  const navigation = useNavigation();
  const { isLoading, isActive, session, startSession, refresh } =
    useBlockingSession();

  const [apps, setApps] = useState<AppInfo[]>([]);
  const [selectedPackageNames, setSelectedPackageNames] = useState<string[]>(
    [],
  );
  const [selectedDurationId, setSelectedDurationId] =
    useState<DurationOptionId | null>('60');
  const [customMinutes, setCustomMinutes] = useState(90);
  const [customHours, setCustomHours] = useState(1);
  const [customMins, setCustomMins] = useState(30);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [showAppPicker, setShowAppPicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moodEnabledByPackage, setMoodEnabledByPackage] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    void (async () => {
      const installed = await getInstalledApps();
      setApps(installed);
      const prefs = await getUserPreferences();
      if (prefs?.trapApps?.length) {
        const known = prefs.trapApps.filter((pkg) =>
          installed.some((app) => app.packageName === pkg),
        );
        if (known.length > 0) {
          setSelectedPackageNames(known);
        }
      }
      const moodConfig = await getMoodInterventionConfig();
      const map: Record<string, boolean> = {};
      moodConfig.apps.forEach((app) => {
        map[app.packageName] = app.enabled;
      });
      // Seed mood watching from onboarding trap apps so the overlay
      // appears without hunting for a hidden toggle.
      if (moodConfig.apps.length === 0 && prefs?.trapApps?.length) {
        for (const pkg of prefs.trapApps) {
          const match = installed.find((app) => app.packageName === pkg);
          if (match) {
            map[pkg] = true;
            await setMoodEnabledForApp(pkg, match.appName, true);
          }
        }
      }
      setMoodEnabledByPackage(map);
      await syncMoodInterventionToNative();
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void syncMoodInterventionToNative();
    }, [refresh]),
  );

  useEffect(() => {
    if (!isLoading && isActive) {
      navigation.navigate('ActiveBlocking');
    }
  }, [isLoading, isActive, navigation]);

  const selectedApps = useMemo(
    () => apps.filter((app) => selectedPackageNames.includes(app.packageName)),
    [apps, selectedPackageNames],
  );

  const durationMinutes = useMemo(() => {
    if (selectedDurationId === 'custom') {
      return customMinutes;
    }
    const match = DURATION_OPTIONS.find((o) => o.id === selectedDurationId);
    return match?.minutes ?? null;
  }, [selectedDurationId, customMinutes]);

  const toggleApp = useCallback((packageName: string) => {
    setError(null);
    setSelectedPackageNames((current) => {
      if (current.includes(packageName)) {
        return current.filter((name) => name !== packageName);
      }
      return [...current, packageName];
    });
  }, []);

  /**
   * Android: opens the in-screen picker modal (curated list).
   * iOS: presents the system Screen Time picker and merges the selected
   * apps (base64 ApplicationTokens) into the current selection.
   */
  const handleAddApps = useCallback(async () => {
    setError(null);
    if (Platform.OS !== 'ios') {
      setShowAppPicker(true);
      return;
    }
    const picked = await AppUsageService.pickBlockedApps();
    if (picked.length === 0) {
      return;
    }
    const known = picked.filter(
      (candidate) =>
        !apps.some((app) => app.packageName === candidate.packageName),
    );
    setApps((current) => [...current, ...known]);
    setSelectedPackageNames((current) => [
      ...current,
      ...known.map((app) => app.packageName),
    ]);
  }, [apps]);

  const handleMoodToggle = useCallback(
    async (app: AppInfo, enabled: boolean) => {
      setMoodEnabledByPackage((current) => ({
        ...current,
        [app.packageName]: enabled,
      }));
      await setMoodEnabledForApp(app.packageName, app.appName, enabled);
      await syncMoodInterventionToNative();
    },
    [],
  );

  const handleDurationSelect = (option: DurationChip) => {
    setError(null);
    if (option.id === 'custom') {
      setShowCustomPicker(true);
      return;
    }
    setSelectedDurationId(option.id);
  };

  const confirmCustomDuration = () => {
    const total = customHours * 60 + customMins;
    if (total <= 0) {
      Alert.alert(
        'Invalid duration',
        'Please select a valid blocking duration.',
      );
      return;
    }
    setCustomMinutes(total);
    setSelectedDurationId('custom');
    setShowCustomPicker(false);
  };

  const handleStart = async () => {
    if (selectedApps.length === 0) {
      if (Platform.OS === 'ios') {
        setError(
          'Use the Screen Time picker to choose apps to block on this iPhone.',
        );
        await handleAddApps();
        return;
      }
      setError('Please select at least one app.');
      setShowAppPicker(true);
      return;
    }

    if (durationMinutes == null || durationMinutes <= 0) {
      setError('Please select a valid blocking duration.');
      return;
    }

    const ready = await promptEnforcementPermissions();
    if (!ready) {
      setError(
        'On a phone, enable Usage Access and Display over other apps to block WhatsApp.',
      );
    }

    const result = await startSession(selectedApps, durationMinutes);
    if (!result.ok) {
      Alert.alert(
        'Session already active',
        'You already have an active blocking session. Open it or stop it first.',
        [
          {
            text: 'Open session',
            onPress: () => navigation.navigate('ActiveBlocking'),
          },
          { text: 'OK', style: 'cancel' },
        ],
      );
      return;
    }

    if (ready) {
      await AppUsageService.startMonitoring(result.session);
    }

    navigation.navigate('ActiveBlocking');
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-zen-cream">
        <ActivityIndicator color="#1B3B2B" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8 flex-row items-center justify-between">
          <Text className="text-4xl font-bold text-zen-forest">Block</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open app detection test"
            hitSlop={12}
            onPress={() => navigation.navigate('AppUsageTest')}
          >
            <Text className="text-2xl text-zen-forest">⋮</Text>
          </Pressable>
        </View>

        <View className="mb-6">
          <DurationSelector
            options={DURATION_OPTIONS}
            selectedId={selectedDurationId}
            onSelect={handleDurationSelect}
          />
        </View>

        {selectedDurationId === 'custom' ? (
          <Text className="mb-5 text-center text-sm text-zen-growth">
            Custom: {Math.floor(customMinutes / 60)}h {customMinutes % 60}m
          </Text>
        ) : null}

        <View className="mb-6">
          <BlockingAppList
            apps={selectedApps}
            compact
            showAddButton
            onAddPress={() => {
              void handleAddApps();
            }}
          />
        </View>

        <View className="mb-6 rounded-3xl bg-white p-5">
          <Text className="mb-1 text-base font-semibold text-zen-forest">
            Choose apps to block
          </Text>
          <Text className="mb-3 text-sm leading-5 text-zen-muted">
            {Platform.OS === 'ios'
              ? 'Use the Screen Time picker to choose the apps Zen Sweep should shield during focus sessions.'
              : 'Turn Mood Intervention ON for an app, leave the timer off, then open that app. A pause screen will appear. Timer block hides mood until you stop it.'}
          </Text>
          {Platform.OS === 'ios' ? (
            <Pressable
              accessibilityRole="button"
              className="items-center rounded-2xl border border-dashed border-zen-border bg-zen-cream/60 py-4"
              onPress={() => {
                void handleAddApps();
              }}
            >
              <Text className="text-sm font-semibold text-zen-forest">
                + Pick apps to block (Screen Time)
              </Text>
            </Pressable>
          ) : apps.length === 0 ? (
            <Text className="text-sm text-zen-muted">Loading apps…</Text>
          ) : (
            apps.map((app) => (
              <AppSelectionCard
                key={app.packageName}
                app={app}
                selected={selectedPackageNames.includes(app.packageName)}
                onPress={() => toggleApp(app.packageName)}
                moodEnabled={Boolean(moodEnabledByPackage[app.packageName])}
                onMoodToggle={(enabled) => {
                  void handleMoodToggle(app, enabled);
                }}
              />
            ))
          )}
        </View>

        <View className="mb-8 rounded-3xl bg-white p-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-zen-forest">
              Strict Block
            </Text>
            <View className="flex-row items-center rounded-full bg-zen-forest px-3 py-1">
              <Text className="mr-1 text-xs">★</Text>
              <Text className="text-xs font-bold text-white">PRO</Text>
            </View>
          </View>
          <Text className="text-sm leading-5 text-zen-muted">
            If Strict Block is enabled, you won&apos;t be able to pause/stop an
            active block. On top of that, you can&apos;t turn off the strict
            mode.
          </Text>
        </View>

        {error ? (
          <Text className="mb-4 text-center text-sm text-red-700">{error}</Text>
        ) : null}

        {session && !session.isActive ? (
          <Text className="mb-4 text-center text-sm text-zen-muted">
            Last session ended. Start a new block when you&apos;re ready.
          </Text>
        ) : null}

        <BlockPrimaryButton
          label="Start Block"
          onPress={() => void handleStart()}
        />

        <Pressable
          className="mt-5 items-center py-2"
          onPress={() => navigation.navigate('AppUsageTest')}
        >
          <Text className="text-sm text-zen-growth">
            Dev: App Detection Test
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={showAppPicker}
        onRequestClose={() => setShowAppPicker(false)}
      >
        <View className="flex-1 justify-end bg-zen-forest/50">
          <View className="max-h-[80%] rounded-t-3xl bg-zen-cream px-5 pb-8 pt-5">
            <Text className="mb-1 text-2xl font-bold text-zen-forest">
              Choose Apps to Block
            </Text>
            <Text className="mb-5 text-sm leading-5 text-zen-muted">
              Select the apps you want Zen Sweep to block during your focus
              session.
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {apps.map((app) => (
                <AppSelectionCard
                  key={app.packageName}
                  app={app}
                  selected={selectedPackageNames.includes(app.packageName)}
                  onPress={() => toggleApp(app.packageName)}
                  moodEnabled={Boolean(moodEnabledByPackage[app.packageName])}
                  onMoodToggle={(enabled) => {
                    void handleMoodToggle(app, enabled);
                  }}
                />
              ))}
            </ScrollView>
            <View className="mt-4">
              <BlockPrimaryButton
                label="Continue"
                onPress={() => {
                  if (selectedPackageNames.length === 0) {
                    setError('Please select at least one app.');
                    return;
                  }
                  setError(null);
                  setShowAppPicker(false);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={showCustomPicker}
        onRequestClose={() => setShowCustomPicker(false)}
      >
        <View className="flex-1 justify-center bg-black/70 px-5">
          <CustomDurationPicker
            hours={customHours}
            minutes={customMins}
            onChangeHours={setCustomHours}
            onChangeMinutes={setCustomMins}
            onConfirm={confirmCustomDuration}
            onCancel={() => setShowCustomPicker(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
