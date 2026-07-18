import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';

import { PrimaryButton } from '../components/ui/PrimaryButton';

export function HomeScreen() {
  const navigation = useNavigation();

  return (
    <View className="flex-1 justify-center bg-slate-50 px-6">
      <View className="rounded-3xl bg-white p-6 shadow-sm">
        <Text className="text-sm font-semibold uppercase tracking-widest text-brand-600">
          Expo SDK 54
        </Text>
        <Text className="mt-3 text-3xl font-bold text-slate-900">
          Your app foundation is ready.
        </Text>
        <Text className="mb-6 mt-3 text-base leading-6 text-slate-600">
          NativeWind, typed React Navigation, ESLint, and Prettier are
          configured for production development.
        </Text>
        <PrimaryButton
          label="View setup details"
          onPress={() => navigation.navigate('Details', { source: 'home' })}
        />
      </View>
    </View>
  );
}
