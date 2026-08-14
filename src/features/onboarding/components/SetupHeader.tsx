import { Text, View } from 'react-native';

import { ZenLogo } from '../../../components/ZenLogo';

type SetupHeaderProps = {
  step: number;
  total?: number;
};

export function SetupHeader({ step, total = 5 }: SetupHeaderProps) {
  return (
    <View>
      <View className="flex-row items-center">
        <ZenLogo size={40} />
        <Text className="ml-3 text-xl text-zen-forest">Zen Sweep</Text>
      </View>
      <View className="mt-4 flex-row gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <View
            key={index}
            className={`h-1.5 flex-1 rounded-full ${
              index < step ? 'bg-zen-forest' : 'bg-zen-border'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
