import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ZenLogo } from '../../../components/ZenLogo';

type WelcomeScreenProps = {
  onStart: () => void;
  onSignIn: () => void;
};

export function WelcomeScreen({ onStart, onSignIn }: WelcomeScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <View className="flex-row items-center justify-between px-5 pt-2">
        <View className="flex-row items-center">
          <ZenLogo size={40} />
          <Text className="ml-2.5 text-lg font-bold text-zen-forest">
            Zen Sweep
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-zen-forest px-4 py-2"
          onPress={onSignIn}
        >
          <Text className="text-[13px] font-semibold text-white">Sign in</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="justify-center px-5 pb-6 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center">
          <View className="mb-5 flex-row items-center rounded-full border border-zen-border bg-white px-3.5 py-1.5">
            <Text className="mr-1.5 text-xs">✨</Text>
            <Text className="text-[12px] font-medium text-zen-forest">
              Mood-aware digital wellbeing
            </Text>
          </View>

          <Text className="text-center text-[34px] font-bold leading-[40px] text-zen-forest">
            Transform scrolling into{' '}
            <Text className="text-zen-growth">growth.</Text>
          </Text>

          <Text className="mt-4 text-center text-[15px] leading-6 text-zen-muted">
            When you reach for your phone, Zen Sweep asks how you feel — then
            offers a short activity that actually helps.
          </Text>

          <Pressable
            accessibilityRole="button"
            className="mt-7 w-full items-center rounded-full bg-zen-forest py-[18px]"
            onPress={onStart}
            style={{
              shadowColor: '#1B3B2B',
              shadowOpacity: 0.2,
              shadowRadius: 10,
              elevation: 4,
            }}
          >
            <Text className="text-[16px] font-bold text-white">
              Start growing — it&apos;s free
            </Text>
          </Pressable>

          <View className="mt-6 w-full rounded-3xl bg-white px-5 py-4">
            <Text className="mb-2.5 text-[15px] font-bold text-zen-forest">
              How it works
            </Text>
            <Text className="mb-1.5 text-[13px] leading-5 text-zen-muted">
              1. Share your name, goals, and trap apps.
            </Text>
            <Text className="mb-1.5 text-[13px] leading-5 text-zen-muted">
              2. Start a focus block when you need it.
            </Text>
            <Text className="text-[13px] leading-5 text-zen-muted">
              3. Your tree grows as you stay present.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
