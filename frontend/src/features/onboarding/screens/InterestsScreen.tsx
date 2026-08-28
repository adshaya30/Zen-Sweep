import { Text, View } from 'react-native';

import { SetupChip } from '../components/SetupChip';
import { SetupScreenLayout } from '../components/SetupScreenLayout';
import { useOnboardingDraft } from '../OnboardingContext';
import { INTEREST_OPTIONS } from '../types';

type InterestsScreenProps = {
  onBack: () => void;
  onNext: () => void;
};

export function InterestsScreen({ onBack, onNext }: InterestsScreenProps) {
  const { draft, update } = useOnboardingDraft();

  const toggle = (interest: string) => {
    const selected = draft.interests.includes(interest)
      ? draft.interests.filter((item) => item !== interest)
      : [...draft.interests, interest];
    update({ interests: selected });
  };

  return (
    <SetupScreenLayout
      step={3}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={draft.interests.length === 0}
    >
      <Text className="mb-1.5 text-[26px] font-bold leading-8 text-zen-forest">
        What do you love doing?
      </Text>
      <Text className="mb-4 text-[13px] leading-5 text-zen-muted">
        Choose a few — we&apos;ll nudge you back to these instead of scrolling.
      </Text>
      <View className="flex-row flex-wrap">
        {INTEREST_OPTIONS.map((interest) => (
          <SetupChip
            key={interest}
            label={interest}
            selected={draft.interests.includes(interest)}
            onPress={() => toggle(interest)}
          />
        ))}
      </View>
    </SetupScreenLayout>
  );
}
