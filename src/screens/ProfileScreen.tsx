import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { TRAP_APP_OPTIONS } from '../features/onboarding/types';
import { getUserPreferences } from '../features/onboarding/storage';
import type { UserPreferences } from '../features/onboarding/types';

export function ProfileScreen() {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getUserPreferences().then(setPrefs);
    }, []),
  );

  const trapLabels =
    prefs?.trapApps
      .map(
        (pkg) =>
          TRAP_APP_OPTIONS.find((app) => app.packageName === pkg)?.label ?? pkg,
      )
      .join(', ') ?? '—';

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6 pb-8 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <Text className="mb-6 text-3xl font-bold text-zen-forest">Profile</Text>

        <View className="mb-4 rounded-3xl bg-white p-5">
          <Text className="text-sm text-zen-muted">Name</Text>
          <Text className="mt-1 text-xl font-semibold text-zen-forest">
            {prefs?.name || '—'}
          </Text>
          {prefs?.age ? (
            <Text className="mt-1 text-sm text-zen-muted">Age {prefs.age}</Text>
          ) : null}
        </View>

        <View className="mb-4 rounded-3xl bg-white p-5">
          <Text className="text-sm text-zen-muted">Dream</Text>
          <Text className="mt-1 text-base text-zen-forest">
            {prefs?.dream || '—'}
          </Text>
          {prefs?.goals ? (
            <>
              <Text className="mt-4 text-sm text-zen-muted">Goals</Text>
              <Text className="mt-1 text-base text-zen-forest">
                {prefs.goals}
              </Text>
            </>
          ) : null}
        </View>

        <View className="mb-4 rounded-3xl bg-white p-5">
          <Text className="text-sm text-zen-muted">Sleep</Text>
          <Text className="mt-1 text-base text-zen-forest">
            {prefs?.sleepTime} → {prefs?.wakeTime}
          </Text>
        </View>

        <View className="mb-6 rounded-3xl bg-white p-5">
          <Text className="text-sm text-zen-muted">Apps that trap you</Text>
          <Text className="mt-1 text-base text-zen-forest">{trapLabels}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="items-center rounded-full bg-zen-forest py-4"
          onPress={() =>
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: 'Onboarding' }],
            })
          }
        >
          <Text className="text-base font-bold text-white">Edit setup</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
