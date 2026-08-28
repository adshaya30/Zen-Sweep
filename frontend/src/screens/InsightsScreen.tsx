import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Share, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBrandIcon } from '../components/AppBrandIcon';
import { getInsightsStats, type InsightsStats } from '../features/insights/storage';
import { getUserPreferences } from '../features/onboarding/storage';
import { TRAP_APP_OPTIONS } from '../features/onboarding/types';
import type { UserPreferences } from '../features/onboarding/types';

export function InsightsScreen() {
  const navigation = useNavigation();
  const [stats, setStats] = useState<InsightsStats>({
    prevented: 0,
    timeSavedMinutes: 0,
  });
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getInsightsStats().then(setStats);
      void getUserPreferences().then(setPrefs);
    }, []),
  );

  const trapApps = (prefs?.trapApps ?? [])
    .map((pkg) => TRAP_APP_OPTIONS.find((app) => app.packageName === pkg))
    .filter((app): app is (typeof TRAP_APP_OPTIONS)[number] => Boolean(app));

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-10 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-4xl font-bold text-zen-forest">Insights</Text>
        <Text className="mt-2 text-base leading-6 text-zen-muted">
          Your tree grows as you do. Focus trends update after each block.
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-8 rounded-3xl bg-zen-forest p-6"
          onPress={() =>
            navigation.navigate('Main', { screen: 'Blocks' } as never)
          }
        >
          <View className="mb-5 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-zen-cream">
              Summary
            </Text>
            <Text className="text-xl text-zen-cream">›</Text>
          </View>
          <View className="flex-row">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">
                {stats.prevented} x
              </Text>
              <Text className="mt-1 text-sm text-zen-cream/80">Prevented</Text>
            </View>
            <View className="flex-1">
              <Text className="text-3xl font-bold text-white">
                {stats.timeSavedMinutes} min
              </Text>
              <Text className="mt-1 text-sm text-zen-cream/80">Time saved</Text>
            </View>
          </View>
        </Pressable>

        <Text className="mb-4 mt-8 text-xl font-bold text-zen-forest">
          Apps
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="items-center"
        >
          {trapApps.map((app) => (
            <View key={app.packageName} className="mr-5 items-center">
              <AppBrandIcon
                packageName={app.packageName}
                appName={app.label}
                size={64}
              />
              <Text className="mt-2 max-w-[72px] text-center text-xs text-zen-muted">
                {app.label}
              </Text>
            </View>
          ))}
          <Pressable
            accessibilityRole="button"
            className="h-[76px] w-[76px] items-center justify-center rounded-3xl bg-white"
            onPress={() =>
              navigation.navigate('Main', { screen: 'Blocks' } as never)
            }
            style={{
              shadowColor: '#1A3626',
              shadowOpacity: 0.12,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <Text className="text-4xl leading-10 text-zen-forest">+</Text>
            <Text className="mt-0.5 text-xs font-bold text-zen-forest">Add</Text>
          </Pressable>
        </ScrollView>

        <View className="mt-8 rounded-3xl bg-white p-5">
          <Text className="text-lg font-bold text-zen-forest">
            Spread the word!
          </Text>
          <Text className="mt-2 text-sm leading-5 text-zen-muted">
            Share Zen Sweep with people you care about.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="mt-4 self-end"
            onPress={() => {
              void Share.share({
                message:
                  'I am using Zen Sweep to turn scrolling into growth. Try a focus block with me.',
              });
            }}
          >
            <Text className="text-base font-bold text-zen-growth">Share</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
