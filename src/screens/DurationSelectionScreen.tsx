import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DurationCard } from '../components/DurationCard';
import { ZenPillButton } from '../components/ZenPillButton';
import { DURATIONS } from '../constants/block';
import type {
  BlockNavigationProp,
  BlockRouteProp,
} from '../navigation/BlockNavigator';

export function DurationSelectionScreen() {
  const navigation = useNavigation<BlockNavigationProp<'DurationSelection'>>();
  const route = useRoute<BlockRouteProp<'DurationSelection'>>();
  const { selectedApps } = route.params;

  const [selectedDurationId, setSelectedDurationId] = useState<string | null>(
    null,
  );

  const selectedDuration = DURATIONS.find((d) => d.id === selectedDurationId);

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['bottom']}>
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-6 text-center text-2xl font-bold text-zen-forest">
          Choose Blocking Duration
        </Text>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        >
          {DURATIONS.map((duration) => (
            <DurationCard
              key={duration.id}
              label={duration.label}
              selected={selectedDurationId === duration.id}
              onPress={() => setSelectedDurationId(duration.id)}
            />
          ))}
        </ScrollView>

        <View className="pb-4 pt-2">
          <ZenPillButton
            disabled={!selectedDuration}
            label="Start Blocking"
            onPress={() => {
              if (!selectedDuration) {
                return;
              }
              navigation.navigate('ActiveBlock', {
                selectedApps,
                durationId: selectedDuration.id,
                durationLabel: selectedDuration.label,
              });
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
