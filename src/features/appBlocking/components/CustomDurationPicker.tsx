import { Pressable, Text, View } from 'react-native';

type CustomDurationPickerProps = {
  hours: number;
  minutes: number;
  onChangeHours: (value: number) => void;
  onChangeMinutes: (value: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

function Stepper({
  label,
  value,
  onDecrement,
  onIncrement,
}: {
  label: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <View className="mb-5">
      <Text className="mb-3 text-sm font-semibold text-block-muted">
        {label}
      </Text>
      <View className="flex-row items-center justify-between rounded-2xl bg-block-surface px-4 py-3">
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-block-card"
          onPress={onDecrement}
        >
          <Text className="text-xl text-white">−</Text>
        </Pressable>
        <Text className="text-2xl font-bold text-white">{value}</Text>
        <Pressable
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full bg-block-card"
          onPress={onIncrement}
        >
          <Text className="text-xl text-white">+</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function CustomDurationPicker({
  hours,
  minutes,
  onChangeHours,
  onChangeMinutes,
  onConfirm,
  onCancel,
}: CustomDurationPickerProps) {
  return (
    <View className="rounded-3xl bg-block-card p-5">
      <Text className="mb-5 text-xl font-bold text-white">Custom Duration</Text>
      <Stepper
        label="Hours"
        value={hours}
        onDecrement={() => onChangeHours(Math.max(0, hours - 1))}
        onIncrement={() => onChangeHours(Math.min(12, hours + 1))}
      />
      <Stepper
        label="Minutes"
        value={minutes}
        onDecrement={() => onChangeMinutes(Math.max(0, minutes - 5))}
        onIncrement={() => onChangeMinutes(Math.min(55, minutes + 5))}
      />
      <Pressable
        accessibilityRole="button"
        className="mb-3 items-center rounded-full bg-block-lavender py-4 active:opacity-80"
        onPress={onConfirm}
      >
        <Text className="text-base font-bold text-block-bg">Confirm</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        className="items-center rounded-full border border-block-muted py-3"
        onPress={onCancel}
      >
        <Text className="text-base font-semibold text-white">Cancel</Text>
      </Pressable>
    </View>
  );
}
