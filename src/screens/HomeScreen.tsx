import { Text, View } from 'react-native';

/**
 * Legacy home screen kept for reference.
 * App entry now uses Main tabs (Overview / Insights / Blocks / Profile).
 */
export function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-block-bg px-6">
      <Text className="text-3xl font-bold text-white">Zen Sweep</Text>
      <Text className="mt-3 text-center text-base text-block-muted">
        Open the Blocks tab to start a focus session.
      </Text>
    </View>
  );
}
