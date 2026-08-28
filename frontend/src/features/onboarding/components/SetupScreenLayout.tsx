import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SetupFooter } from './SetupFooter';
import { SetupHeader } from './SetupHeader';

type SetupScreenLayoutProps = {
  step: number;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
};

export function SetupScreenLayout({
  step,
  children,
  onBack,
  onNext,
  nextLabel,
  nextDisabled,
}: SetupScreenLayoutProps) {
  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top', 'bottom']}>
      <View className="flex-1 px-5 pt-3">
        <SetupHeader step={step} />
        <ScrollView
          className="flex-1"
          contentContainerClassName="pt-5 pb-4"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        <View className="pb-3 pt-2">
          <SetupFooter
            onBack={onBack}
            onNext={onNext}
            nextLabel={nextLabel}
            nextDisabled={nextDisabled}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
