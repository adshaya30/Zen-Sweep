import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBrandIcon } from '../components/AppBrandIcon';
import { ZenLogo } from '../components/ZenLogo';
import { syncMoodInterventionToNative } from '../features/moodIntervention/sync';
import { getUserPreferences } from '../features/onboarding/storage';
import { TRAP_APP_OPTIONS } from '../features/onboarding/types';
import type { UserPreferences } from '../features/onboarding/types';

export function OverviewScreen() {
  const navigation = useNavigation();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getUserPreferences().then(setPrefs);
      void syncMoodInterventionToNative();
    }, []),
  );

  const firstName = prefs?.name?.trim()?.split(' ')[0] ?? 'friend';
  const dream = prefs?.dream?.trim();
  const trapApps = (prefs?.trapApps ?? [])
    .map((pkg) => TRAP_APP_OPTIONS.find((app) => app.packageName === pkg))
    .filter((app): app is (typeof TRAP_APP_OPTIONS)[number] => Boolean(app))
    .slice(0, 5);

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-2"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-5 flex-row items-center">
          <ZenLogo size={42} />
          <Text className="ml-2.5 text-lg font-bold text-zen-forest">
            Zen Sweep
          </Text>
        </View>

        <View className="mb-4 self-start rounded-full border border-zen-border bg-white px-3 py-1">
          <Text className="text-[11px] font-semibold text-zen-forest">
            ✨ Mood-aware digital wellbeing
          </Text>
        </View>

        <Text className="text-[32px] font-bold leading-[38px] text-zen-forest">
          Hi {firstName}.
        </Text>
        <Text className="mt-1 text-[26px] font-bold leading-8 text-zen-forest">
          Transform scrolling into{' '}
          <Text className="text-zen-growth">growth.</Text>
        </Text>

        <Text className="mt-3 text-[14px] leading-5 text-zen-muted">
          {dream
            ? `Your dream: ${dream}. When you reach for your phone, start a block and come back to that.`
            : 'When you reach for your phone, Zen Sweep helps you pause — then offers a short activity that actually helps.'}
        </Text>

        <Pressable
          accessibilityRole="button"
          className="mt-4 items-center rounded-full bg-zen-forest py-[18px]"
          onPress={() =>
            navigation.navigate('Main', { screen: 'Blocks' } as never)
          }
          style={{
            shadowColor: '#1B3B2B',
            shadowOpacity: 0.22,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 5,
          }}
        >
          <Text className="text-[16px] font-bold text-white">
            Start a focus block
          </Text>
        </Pressable>

        <View className="mt-4 flex-row gap-2.5">
          <Pressable
            className="flex-1 rounded-2xl bg-white px-3.5 py-3.5"
            onPress={() =>
              navigation.navigate('Main', { screen: 'Insights' } as never)
            }
          >
            <Text className="text-[11px] font-semibold text-zen-muted">
              Insights
            </Text>
            <Text className="mt-0.5 text-[16px] font-bold text-zen-forest">
              See your tree
            </Text>
          </Pressable>
          <Pressable
            className="flex-1 rounded-2xl bg-zen-forest px-3.5 py-3.5"
            onPress={() =>
              navigation.navigate('Main', { screen: 'Blocks' } as never)
            }
          >
            <Text className="text-[11px] font-semibold text-zen-cream/80">
              Blocks
            </Text>
            <Text className="mt-0.5 text-[16px] font-bold text-white">
              Timer or mood
            </Text>
          </Pressable>
        </View>

        {trapApps.length > 0 ? (
          <View className="mt-4 rounded-3xl bg-white px-4 py-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[15px] font-bold text-zen-forest">
                Apps you watch
              </Text>
              <Pressable
                onPress={() =>
                  navigation.navigate('Main', { screen: 'Blocks' } as never)
                }
              >
                <Text className="text-[12px] font-semibold text-zen-growth">
                  Edit
                </Text>
              </Pressable>
            </View>
            <View className="flex-row flex-wrap">
              {trapApps.map((app) => (
                <View key={app.packageName} className="mb-1 mr-3 items-center">
                  <AppBrandIcon
                    packageName={app.packageName}
                    appName={app.label}
                    size={46}
                  />
                  <Text className="mt-1 max-w-[52px] text-center text-[10px] text-zen-muted">
                    {app.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {prefs?.interests?.length ? (
          <View className="mt-3 rounded-3xl bg-white px-4 py-4">
            <Text className="mb-1.5 text-[15px] font-bold text-zen-forest">
              You love
            </Text>
            <Text className="text-[13px] leading-5 text-zen-muted">
              {prefs.interests.join(' · ')}
            </Text>
          </View>
        ) : null}

        {prefs?.sleepTime ? (
          <View className="mt-3 rounded-3xl bg-white px-4 py-4">
            <Text className="mb-1.5 text-[15px] font-bold text-zen-forest">
              Rest window
            </Text>
            <Text className="text-[13px] text-zen-muted">
              Sleep {prefs.sleepTime} → Wake {prefs.wakeTime}
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
