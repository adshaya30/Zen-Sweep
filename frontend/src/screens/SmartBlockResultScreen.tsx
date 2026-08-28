import { useRoute } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BlockRouteProp } from '../navigation/BlockNavigator';

export function SmartBlockResultScreen() {
  const route = useRoute<BlockRouteProp<'SmartBlockResult'>>();
  const { moodEmoji, moodLabel } = route.params;

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['bottom']}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full rounded-3xl border border-zen-border bg-white p-8">
          <Text className="text-center text-5xl">{moodEmoji}</Text>
          <Text className="mt-4 text-center text-xl font-bold text-zen-forest">
            Selected mood:
          </Text>
          <Text className="mt-2 text-center text-lg text-zen-forest">
            {moodEmoji} {moodLabel}
          </Text>
          <Text className="mt-6 text-center text-base leading-6 text-zen-muted">
            Your personalized activity will appear here.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
