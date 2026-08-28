import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { ZenLogo } from '../components/ZenLogo';
import { syncMoodInterventionToNative } from '../features/moodIntervention/sync';
import { getUserPreferences } from '../features/onboarding/storage';

export function BootScreen() {
  const navigation = useNavigation();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          void syncMoodInterventionToNative();
        }
        if (!mounted) {
          return;
        }
        navigation.reset({
          index: 0,
          routes: [{ name: (prefs ? 'Main' : 'Onboarding') as never }],
        });
      } catch {
        if (mounted) {
          setError('Could not load your profile.');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-zen-cream">
      <ZenLogo size={72} />
      <Text className="mb-6 mt-4 text-2xl font-semibold text-zen-forest">
        Zen Sweep
      </Text>
      {error ? (
        <Text className="text-sm text-red-700">{error}</Text>
      ) : (
        <ActivityIndicator color="#1A3626" />
      )}
    </View>
  );
}
