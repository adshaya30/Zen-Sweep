import type { PressableProps } from 'react-native';
import { Pressable, Text } from 'react-native';

type ZenPillButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: 'primary' | 'secondary';
};

export function ZenPillButton({
  disabled,
  label,
  variant = 'primary',
  ...pressableProps
}: ZenPillButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center rounded-full px-6 py-4 ${
        isPrimary
          ? 'bg-zen-forest active:bg-zen-forest-muted'
          : 'border-2 border-zen-forest bg-transparent active:bg-zen-mist'
      } ${disabled ? 'opacity-40' : ''}`}
      disabled={disabled}
      {...pressableProps}
    >
      <Text
        className={`text-base font-bold ${
          isPrimary ? 'text-zen-cream' : 'text-zen-forest'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
