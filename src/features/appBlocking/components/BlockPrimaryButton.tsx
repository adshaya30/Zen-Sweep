import { Pressable, Text } from 'react-native';

type BlockPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'danger' | 'ghost';
};

export function BlockPrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: BlockPrimaryButtonProps) {
  const styles =
    variant === 'primary'
      ? 'bg-zen-forest'
      : variant === 'danger'
        ? 'bg-white border border-red-400'
        : 'bg-white border border-zen-border';

  const textStyles =
    variant === 'primary'
      ? 'text-white'
      : variant === 'danger'
        ? 'text-red-700'
        : 'text-zen-forest';

  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center rounded-full px-6 py-4 ${styles} ${
        disabled ? 'opacity-40' : 'active:opacity-80'
      }`}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={`text-base font-bold ${textStyles}`}>{label}</Text>
    </Pressable>
  );
}
