import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MoodCard } from '../components/MoodCard';
import { ZenPillButton } from '../components/ZenPillButton';
import { MOODS } from '../constants/block';
import type { BlockNavigationProp } from '../navigation/BlockNavigator';

export function SmartBlockMoodScreen() {
  const navigation = useNavigation<BlockNavigationProp<'SmartBlockMood'>>();
  const [selectedMoodId, setSelectedMoodId] = useState<string | null>(null);

  const selectedMood = MOODS.find((mood) => mood.id === selectedMoodId);

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['bottom']}>
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-6 text-center text-2xl font-bold text-zen-forest">
          How are you feeling right now?
        </Text>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        >
          {MOODS.map((mood) => (
            <MoodCard
              key={mood.id}
              emoji={mood.emoji}
              label={mood.label}
              selected={selectedMoodId === mood.id}
              onPress={() => setSelectedMoodId(mood.id)}
            />
          ))}
        </ScrollView>

        <View className="pb-4 pt-2">
          <ZenPillButton
            disabled={!selectedMood}
            label="Continue →"
            onPress={() => {
              if (!selectedMood) {
                return;
              }
              navigation.navigate('SmartBlockResult', {
                moodEmoji: selectedMood.emoji,
                moodLabel: selectedMood.label,
              });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
