import { Pressable, Text, View } from 'react-native';

import { SetupScreenLayout } from '../components/SetupScreenLayout';
import { useOnboardingDraft } from '../OnboardingContext';

const SLEEP_OPTIONS = ['9:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'];
const WAKE_OPTIONS = ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM'];

type SleepScreenProps = {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
};

function TimeCard({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (next: string) => void;
}) {
  const cycle = () => {
    const index = options.indexOf(value);
    onChange(options[(index + 1) % options.length] ?? options[0]);
  };

  return (
    <View className="flex-1">
      <Text className="mb-2 text-sm font-semibold text-zen-muted">{label}</Text>
      <Pressable
        accessibilityRole="button"
        className="flex-row items-center justify-between rounded-2xl bg-white px-4 py-5"
        onPress={cycle}
        style={{
          shadowColor: '#1A3626',
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <Text className="text-lg font-semibold text-zen-forest">{value}</Text>
        <Text className="text-lg text-zen-forest">🕒</Text>
      </Pressable>
    </View>
  );
}

export function SleepScreen({ onBack, onNext, nextLabel }: SleepScreenProps) {
  const { draft, update } = useOnboardingDraft();

  return (
    <SetupScreenLayout
      step={5}
      onBack={onBack}
      onNext={onNext}
      nextLabel={nextLabel}
    >
      <Text className="mb-2 text-[26px] font-bold leading-8 text-zen-forest">
        When do you sleep?
      </Text>
      <Text className="mb-4 text-[13px] leading-5 text-zen-muted">
        Tap a card to change the time. We&apos;ll protect your rest window.
      </Text>
      <View className="flex-row gap-3">
        <TimeCard
          label="Sleep"
          value={draft.sleepTime}
          options={SLEEP_OPTIONS}
          onChange={(sleepTime) => update({ sleepTime })}
        />
        <TimeCard
          label="Wake"
          value={draft.wakeTime}
          options={WAKE_OPTIONS}
          onChange={(wakeTime) => update({ wakeTime })}
        />
      </View>
    </SetupScreenLayout>
  );
}
