import { Pressable, Text, View } from 'react-native';

import { AppBrandIcon } from '../../../components/AppBrandIcon';
import { SetupScreenLayout } from '../components/SetupScreenLayout';
import { useOnboardingDraft } from '../OnboardingContext';
import { TRAP_APP_OPTIONS } from '../types';

type TrapAppsScreenProps = {
  onBack: () => void;
  onNext: () => void;
};

export function TrapAppsScreen({ onBack, onNext }: TrapAppsScreenProps) {
  const { draft, update } = useOnboardingDraft();

  const toggle = (packageName: string) => {
    const selected = draft.trapApps.includes(packageName)
      ? draft.trapApps.filter((item) => item !== packageName)
      : [...draft.trapApps, packageName];
    update({ trapApps: selected });
  };

  return (
    <SetupScreenLayout
      step={4}
      onBack={onBack}
      onNext={onNext}
      nextDisabled={draft.trapApps.length === 0}
    >
      <Text className="mb-1.5 text-[26px] font-bold leading-8 text-zen-forest">
        Which apps trap you the most?
      </Text>
      <Text className="mb-4 text-[13px] leading-5 text-zen-muted">
        Tap apps to select. Real icons help you spot them quickly.
      </Text>

      <View className="flex-row flex-wrap justify-between">
        {TRAP_APP_OPTIONS.map((app) => {
          const selected = draft.trapApps.includes(app.packageName);
          return (
            <Pressable
              key={app.packageName}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              className={`mb-2.5 w-[48%] flex-row items-center rounded-2xl px-3 py-3 ${
                selected ? 'bg-zen-forest' : 'bg-white'
              }`}
              onPress={() => toggle(app.packageName)}
              style={{
                shadowColor: '#1A3626',
                shadowOpacity: 0.07,
                shadowRadius: 5,
                elevation: 2,
              }}
            >
              <AppBrandIcon
                packageName={app.packageName}
                appName={app.label}
                size={44}
              />
              <Text
                className={`ml-2.5 flex-1 text-[13px] font-semibold ${
                  selected ? 'text-white' : 'text-zen-forest'
                }`}
                numberOfLines={1}
              >
                {app.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SetupScreenLayout>
  );
}
