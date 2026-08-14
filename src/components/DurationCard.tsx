import { Pressable, Text, View } from 'react-native';

type DurationCardProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function DurationCard({ label, selected, onPress }: DurationCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      className={`mb-3 flex-row items-center rounded-2xl border px-4 py-4 ${
        selected
          ? 'border-zen-forest bg-zen-forest'
          : 'border-zen-border bg-white'
      }`}
      onPress={onPress}
    >
      <View
        className={`mr-4 h-5 w-5 items-center justify-center rounded-full border-2 ${
          selected ? 'border-white' : 'border-zen-border'
        }`}
      >
        {selected ? (
          <View className="h-2.5 w-2.5 rounded-full bg-white" />
        ) : null}
      </View>
      <Text
        className={`text-lg font-semibold ${
          selected ? 'text-white' : 'text-zen-forest'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
