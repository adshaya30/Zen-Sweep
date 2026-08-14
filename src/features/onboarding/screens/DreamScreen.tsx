import { Text, TextInput } from 'react-native';

import { SetupScreenLayout } from '../components/SetupScreenLayout';
import { useOnboardingDraft } from '../OnboardingContext';

type DreamScreenProps = {
  onBack: () => void;
  onNext: () => void;
};

export function DreamScreen({ onBack, onNext }: DreamScreenProps) {
  const { draft, update } = useOnboardingDraft();

  return (
    <SetupScreenLayout
      step={2}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={draft.dream.trim().length === 0}
    >
      <Text className="mb-3 text-[26px] font-bold leading-8 text-zen-forest">
        What’s your biggest dream
      </Text>
      <TextInput
        value={draft.dream}
        onChangeText={(dream) => update({ dream })}
        placeholder="e.g. become a software engineer, build a startup, learn AI..."
        placeholderTextColor="#8A8A7A"
        multiline
        className="mb-5 min-h-[80px] rounded-2xl bg-white px-4 py-3.5 text-[16px] text-zen-forest"
        style={{
          shadowColor: '#1A3626',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      />

      <Text className="mb-3 text-[22px] font-bold leading-7 text-zen-forest">
        What are 1-3 goals right now?
      </Text>
      <TextInput
        value={draft.goals}
        onChangeText={(goals) => update({ goals })}
        placeholder="comma separated - finish thesis, learn Spanish"
        placeholderTextColor="#8A8A7A"
        className="rounded-2xl bg-white px-4 py-3.5 text-[16px] text-zen-forest"
        style={{
          shadowColor: '#1A3626',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      />
    </SetupScreenLayout>
  );
}
