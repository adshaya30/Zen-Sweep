import type { StaticScreenProps } from '@react-navigation/native';
import { Text, View } from 'react-native';

type DetailsScreenProps = StaticScreenProps<{
  source: 'home';
}>;

const integrations = [
  'NativeWind v4 with Tailwind CSS',
  'React Navigation native stack',
  'Strict TypeScript route types',
  'Expo ESLint flat configuration',
  'Prettier with class sorting',
] as const;

export function DetailsScreen({ route }: DetailsScreenProps) {
  return (
    <View className="flex-1 bg-slate-50 px-6 py-8">
      <Text className="text-2xl font-bold text-slate-900">
        Setup verification
      </Text>
      <Text className="mt-2 text-base text-slate-600">
        Opened from: {route.params.source}
      </Text>

      <View className="mt-6 gap-3">
        {integrations.map((integration) => (
          <View
            className="flex-row items-center rounded-xl bg-white p-4"
            key={integration}
          >
            <View className="mr-3 size-2 rounded-full bg-brand-500" />
            <Text className="flex-1 text-base text-slate-900">
              {integration}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
