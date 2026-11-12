import { Text, TextInput } from 'react-native';

import { SetupScreenLayout } from '../components/SetupScreenLayout';
import { useOnboardingDraft } from '../OnboardingContext';

type NameScreenProps = {
  onNext: () => void;
};

export function NameScreen({ onNext }: NameScreenProps) {
  const { draft, update } = useOnboardingDraft();

  return (
    <SetupScreenLayout
      step={1}
      onNext={onNext}
      nextDisabled={draft.name.trim().length === 0}
    >
      <Text className="mb-5 text-[26px] font-bold leading-8 text-zen-forest">
        What should we call you?
      </Text>

      <Text className="mb-2 text-[13px] font-semibold text-zen-muted">
        Name
      </Text>
      <TextInput
        value={draft.name}
        onChangeText={(name) => update({ name })}
        placeholder="Your name"
        placeholderTextColor="#8A8A7A"
        className="mb-5 rounded-2xl bg-white px-4 py-3.5 text-[16px] text-zen-forest"
        style={{
          shadowColor: '#1A3626',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 2,
        }}
      />

      <Text className="mb-2 text-[13px] font-semibold text-zen-muted">
        Age (optional)
      </Text>
      <TextInput
        value={draft.age}
        onChangeText={(age) => update({ age })}
        placeholder="e.g. 21"
        placeholderTextColor="#8A8A7A"
        keyboardType="number-pad"
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
