import type { PressableProps } from 'react-native';
import { Pressable, Text } from 'react-native';

type PrimaryButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
};

export function PrimaryButton({
  disabled,
  label,
  ...pressableProps
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`items-center rounded-xl bg-brand-600 px-5 py-3 active:bg-brand-700 ${
        disabled ? 'opacity-50' : ''
      }`}
      disabled={disabled}
      {...pressableProps}
    >
      <Text className="text-base font-semibold text-white">{label}</Text>
    </Pressable>
  );
}
