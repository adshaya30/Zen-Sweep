import { Pressable, Text, View } from 'react-native';

type SetupFooterProps = {
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export function SetupFooter({
  onBack,
  onNext,
  nextLabel = 'Next  >',
  nextDisabled = false,
}: SetupFooterProps) {
  return (
    <View className="flex-row items-center justify-between pt-2">
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          className="rounded-full bg-white px-8 py-4 shadow-sm"
          onPress={onBack}
          style={{
            shadowColor: '#1A3626',
            shadowOpacity: 0.12,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
        >
          <Text className="text-base font-semibold text-zen-forest">Back</Text>
        </Pressable>
      ) : (
        <View />
      )}
      <Pressable
        accessibilityRole="button"
        className={`rounded-full px-9 py-4 ${
          nextDisabled ? 'bg-zen-border' : 'bg-zen-forest'
        }`}
        disabled={nextDisabled}
        onPress={onNext}
        style={
          nextDisabled
            ? undefined
            : {
                shadowColor: '#1A3626',
                shadowOpacity: 0.25,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
              }
        }
      >
        <Text className="text-base font-semibold text-white">{nextLabel}</Text>
      </Pressable>
    </View>
  );
}
