import {
  CommonActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ZenPillButton } from '../components/ZenPillButton';
import { durationToSeconds, formatTime } from '../constants/block';
import type {
  BlockNavigationProp,
  BlockRouteProp,
} from '../navigation/BlockNavigator';

export function ActiveBlockScreen() {
  const navigation = useNavigation<BlockNavigationProp<'ActiveBlock'>>();
  const route = useRoute<BlockRouteProp<'ActiveBlock'>>();
  const { selectedApps, durationId, durationLabel } = route.params;

  const initialSeconds = durationToSeconds(durationId, durationLabel);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          clearInterval(intervalId);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const cancelBlock = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'BlockHome' }],
      }),
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['bottom']}>
      <View className="flex-1 px-6 pt-8">
        <Text className="text-center text-3xl font-bold text-zen-forest">
          Block Active 🌱
        </Text>

        <View className="mt-10 rounded-3xl border border-zen-border bg-white p-6">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zen-muted">
            Blocked Apps
          </Text>
          <View className="mt-4 gap-3">
            {selectedApps.map((app) => (
              <View key={app.name} className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-zen-mist">
                  <Text className="text-lg">{app.icon}</Text>
                </View>
                <Text className="text-lg font-semibold text-zen-forest">
                  {app.name}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mt-6 items-center rounded-3xl border border-zen-border bg-white p-8">
          <Text className="text-sm font-semibold uppercase tracking-wide text-zen-muted">
            Remaining Time
          </Text>
          <Text className="mt-3 text-5xl font-bold tracking-widest text-zen-forest">
            {formatTime(remainingSeconds)}
          </Text>
          <Text className="mt-2 text-sm text-zen-muted">{durationLabel}</Text>
        </View>

        <View className="mt-auto pb-4">
          <ZenPillButton
            label="Cancel Block"
            variant="secondary"
            onPress={cancelBlock}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
