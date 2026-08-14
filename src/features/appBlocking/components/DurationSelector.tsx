import { Pressable, ScrollView, Text, View } from 'react-native';

import type { DurationOptionId } from '../types/blocking';

export type DurationChip = {
  id: DurationOptionId;
  label: string;
  subLabel?: string;
  minutes: number | null;
  kind: 'clock' | 'text' | 'add';
};

type DurationSelectorProps = {
  options: DurationChip[];
  selectedId: DurationOptionId | null;
  onSelect: (option: DurationChip) => void;
};

function ClockFace({ label, selected }: { label: string; selected: boolean }) {
  return (
    <View
      className={`h-[76px] w-[76px] items-center justify-center rounded-full border-[3px] border-dashed ${
        selected ? 'border-zen-forest' : 'border-zen-border'
      }`}
    >
      <Text
        className={`text-center text-[11px] font-bold leading-4 ${
          selected ? 'text-zen-forest' : 'text-zen-muted'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

export function DurationSelector({
  options,
  selectedId,
  onSelect,
}: DurationSelectorProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-4 px-1"
    >
      {options.map((option) => {
        const selected = selectedId === option.id;

        if (option.kind === 'add') {
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityLabel="Custom duration"
              className={`h-[76px] w-[76px] items-center justify-center rounded-full bg-white ${
                selected ? 'border-2 border-zen-forest' : ''
              }`}
              onPress={() => onSelect(option)}
            >
              <Text className="text-3xl font-light text-zen-forest">+</Text>
            </Pressable>
          );
        }

        if (option.kind === 'text') {
          return (
            <Pressable
              key={option.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`h-[76px] w-[76px] items-center justify-center rounded-full bg-white ${
                selected ? 'border-2 border-zen-forest' : ''
              }`}
              onPress={() => onSelect(option)}
            >
              <Text
                className={`text-center text-[11px] font-semibold leading-4 ${
                  selected ? 'text-zen-forest' : 'text-zen-muted'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`rounded-full p-1 ${
              selected
                ? 'border-2 border-zen-forest'
                : 'border-2 border-transparent'
            }`}
            onPress={() => onSelect(option)}
          >
            <ClockFace label={option.label} selected={selected} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
