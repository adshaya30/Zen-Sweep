import { Pressable, Switch, Text, View } from 'react-native';

import { AppBrandIcon } from '../../../components/AppBrandIcon';
import type { AppInfo } from '../types/blocking';

type AppSelectionCardProps = {
  app: AppInfo;
  selected: boolean;
  onPress: () => void;
  moodEnabled?: boolean;
  onMoodToggle?: (enabled: boolean) => void;
};

export function AppSelectionCard({
  app,
  selected,
  onPress,
  moodEnabled = false,
  onMoodToggle,
}: AppSelectionCardProps) {
  return (
    <View
      className={`mb-2.5 rounded-2xl border bg-white px-3.5 py-3 ${
        selected ? 'border-zen-forest' : 'border-transparent'
      }`}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        className="flex-row items-center"
        onPress={onPress}
      >
        <View className="mr-3">
          <AppBrandIcon
            packageName={app.packageName}
            appName={app.appName}
            size={48}
          />
        </View>
        <View className="flex-1">
          <Text className="text-[15px] font-semibold text-zen-forest">
            {app.appName}
          </Text>
          <Text className="mt-0.5 text-[11px] text-zen-muted" numberOfLines={1}>
            {app.packageName}
          </Text>
        </View>
        <View
          className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
            selected
              ? 'border-zen-forest bg-zen-forest'
              : 'border-zen-border bg-transparent'
          }`}
        >
          {selected ? (
            <Text className="text-xs font-bold text-white">✓</Text>
          ) : null}
        </View>
      </Pressable>

      {onMoodToggle ? (
        <View className="mt-3 flex-row items-center justify-between border-t border-zen-border/60 pt-3">
          <View className="mr-3 flex-1">
            <Text className="text-sm font-semibold text-zen-forest">
              Mood Intervention
            </Text>
            <Text className="mt-0.5 text-xs text-zen-muted">
              Show a pause when this app opens (timer block off)
            </Text>
          </View>
          <Switch
            value={moodEnabled}
            onValueChange={onMoodToggle}
            trackColor={{ false: '#D4D0C0', true: '#4A8C4D' }}
            thumbColor={moodEnabled ? '#1B3B2B' : '#f4f3f4'}
          />
        </View>
      ) : null}
    </View>
  );
}
