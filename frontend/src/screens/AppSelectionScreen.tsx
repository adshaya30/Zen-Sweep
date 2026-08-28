import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppCard } from '../components/AppCard';
import { ZenPillButton } from '../components/ZenPillButton';
import { DUMMY_APPS } from '../constants/block';
import type { BlockNavigationProp } from '../navigation/BlockNavigator';

export function AppSelectionScreen() {
  const navigation = useNavigation<BlockNavigationProp<'AppSelection'>>();
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);

  const toggleApp = (appId: string) => {
    setSelectedAppIds((current) =>
      current.includes(appId)
        ? current.filter((id) => id !== appId)
        : [...current, appId],
    );
  };

  const selectedApps = DUMMY_APPS.filter((app) =>
    selectedAppIds.includes(app.id),
  ).map(({ name, icon }) => ({ name, icon }));

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['bottom']}>
      <View className="flex-1 px-6 pt-6">
        <Text className="mb-2 text-center text-2xl font-bold text-zen-forest">
          Select Apps to Block
        </Text>
        <Text className="mb-6 text-center text-sm text-zen-muted">
          {selectedAppIds.length === 0
            ? 'Pick one or more apps'
            : `${selectedAppIds.length} selected`}
        </Text>

        <ScrollView
          className="flex-1"
          contentContainerClassName="pb-4"
          showsVerticalScrollIndicator={false}
        >
          {DUMMY_APPS.map((app) => (
            <AppCard
              key={app.id}
              icon={app.icon}
              name={app.name}
              selected={selectedAppIds.includes(app.id)}
              onPress={() => toggleApp(app.id)}
            />
          ))}
        </ScrollView>

        <View className="pb-4 pt-2">
          <ZenPillButton
            disabled={selectedAppIds.length === 0}
            label="Continue →"
            onPress={() =>
              navigation.navigate('DurationSelection', { selectedApps })
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
