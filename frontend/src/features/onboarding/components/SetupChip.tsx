import { Pressable, Text } from 'react-native';

type SetupChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SetupChip({ label, selected, onPress }: SetupChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`mb-2.5 mr-2.5 rounded-full px-3.5 py-2.5 ${
        selected ? 'bg-zen-forest' : 'bg-white'
      }`}
      onPress={onPress}
      style={{
        shadowColor: '#1A3626',
        shadowOpacity: 0.08,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
      }}
    >
      <Text
        className={`text-[13px] font-semibold ${
          selected ? 'text-white' : 'text-zen-forest'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
