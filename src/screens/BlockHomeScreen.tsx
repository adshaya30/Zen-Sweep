import { useNavigation } from '@react-navigation/native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { BlockNavigationProp } from '../navigation/BlockNavigator';

type ModeCardProps = {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
};

function ModeCard({ icon, title, description, onPress }: ModeCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="mb-4 rounded-3xl border border-zen-border bg-white p-5 active:bg-zen-mist"
      onPress={onPress}
    >
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-zen-mist">
        <Text className="text-3xl">{icon}</Text>
      </View>
      <Text className="text-xl font-bold text-zen-forest">{title}</Text>
      <Text className="mt-2 text-base leading-6 text-zen-muted">
        {description}
      </Text>
    </Pressable>
  );
}

export function BlockHomeScreen() {
  const navigation = useNavigation<BlockNavigationProp<'BlockHome'>>();

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['bottom']}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-center text-3xl font-bold text-zen-forest">
          Zen Block 🌱
        </Text>
        <Text className="mt-2 text-center text-base text-zen-muted">
          Choose your blocking mode
        </Text>

        <View className="mt-10">
          <ModeCard
            description="Mood-based redirection"
            icon="🌱"
            title="Smart Block"
            onPress={() => navigation.navigate('SmartBlockMood')}
          />
          <ModeCard
            description="Choose apps and duration"
            icon="⏳"
            title="Schedule Block"
            onPress={() => navigation.navigate('AppSelection')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
