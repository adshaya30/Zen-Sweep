import { Modal, Text, View } from 'react-native';

import { BlockPrimaryButton } from './BlockPrimaryButton';
import { BlockingTimer } from './BlockingTimer';

type BlockedAppOverlayProps = {
  visible: boolean;
  appName: string;
  remainingSeconds: number;
  endsAtLabel: string;
  onStayFocused: () => void;
};

export function BlockedAppOverlay({
  visible,
  appName,
  remainingSeconds,
  endsAtLabel,
  onStayFocused,
}: BlockedAppOverlayProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View className="flex-1 justify-center bg-zen-forest/80 px-6">
        <View className="rounded-3xl bg-zen-cream p-6">
          <Text className="text-center text-sm font-semibold uppercase tracking-widest text-zen-growth">
            Zen Sweep
          </Text>
          <Text className="mt-3 text-center text-3xl font-bold text-zen-forest">
            {appName} is blocked
          </Text>
          <Text className="mt-3 text-center text-base leading-6 text-zen-muted">
            Your focus timer is still running. Stay with Zen Sweep until it
            ends.
          </Text>
          <View className="mt-6">
            <BlockingTimer
              remainingSeconds={remainingSeconds}
              endsAtLabel={endsAtLabel}
            />
          </View>
          <View className="mt-5">
            <BlockPrimaryButton label="Stay focused" onPress={onStayFocused} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
