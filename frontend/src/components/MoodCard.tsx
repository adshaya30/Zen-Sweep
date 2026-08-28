import { Pressable, Text, View } from 'react-native';

type MoodCardProps = {
  emoji: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function MoodCard({ emoji, label, selected, onPress }: MoodCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`mb-3 flex-row items-center rounded-2xl border px-4 py-4 ${
        selected
          ? 'border-zen-forest bg-zen-forest'
          : 'border-zen-border bg-white'
      }`}
      onPress={onPress}
    >
      <View
        className={`mr-4 h-12 w-12 items-center justify-center rounded-full ${
          selected ? 'bg-zen-forest-muted' : 'bg-zen-mist'
        }`}
      >
        <Text className="text-2xl">{emoji}</Text>
      </View>
      <Text
        className={`flex-1 text-lg font-semibold ${
          selected ? 'text-white' : 'text-zen-forest'
        }`}
      >
        {label}
      </Text>
      <View
        className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
          selected ? 'border-white bg-white' : 'border-zen-border'
        }`}
      >
        {selected ? (
          <View className="h-3 w-3 rounded-full bg-zen-forest" />
        ) : null}
      </View>
    </Pressable>
  );
}
