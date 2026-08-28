import { Pressable, Text, View } from 'react-native';

type AppCardProps = {
  name: string;
  icon: string;
  selected: boolean;
  onPress: () => void;
};

export function AppCard({ name, icon, selected, onPress }: AppCardProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className={`mb-3 flex-row items-center rounded-2xl border px-4 py-4 ${
        selected
          ? 'border-zen-forest bg-zen-mist'
          : 'border-zen-border bg-white'
      }`}
      onPress={onPress}
    >
      <View
        className={`mr-4 h-12 w-12 items-center justify-center rounded-2xl ${
          selected ? 'bg-zen-forest' : 'bg-zen-mist'
        }`}
      >
        <Text className="text-xl">{icon}</Text>
      </View>
      <Text className="flex-1 text-lg font-semibold text-zen-forest">
        {name}
      </Text>
      <View
        className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
          selected
            ? 'border-zen-forest bg-zen-forest'
            : 'border-zen-border bg-white'
        }`}
      >
        {selected ? (
          <Text className="text-xs font-bold text-white">✓</Text>
        ) : null}
      </View>
    </Pressable>
  );
}
