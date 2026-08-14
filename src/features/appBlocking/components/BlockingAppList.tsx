import { Pressable, ScrollView, Text, View } from 'react-native';

import { AppBrandIcon } from '../../../components/AppBrandIcon';
import type { AppInfo, BlockedApp } from '../types/blocking';

type BlockingAppListProps = {
  apps: (AppInfo | BlockedApp)[];
  onAddPress?: () => void;
  showAddButton?: boolean;
  /** Horizontal chip row — best for Active Blocking with many apps */
  compact?: boolean;
  onAppPress?: (app: AppInfo | BlockedApp) => void;
};

export function BlockingAppList({
  apps,
  onAddPress,
  showAddButton = false,
  compact = false,
  onAppPress,
}: BlockingAppListProps) {
  if (compact) {
    return (
      <View className="rounded-3xl bg-white px-3.5 py-3.5">
        <Text className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-zen-muted">
          Blocking · {apps.length} app{apps.length === 1 ? '' : 's'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View className="flex-row items-center gap-2.5">
            {apps.map((app) => (
              <Pressable
                key={app.packageName}
                className="items-center"
                onPress={() => onAppPress?.(app)}
              >
                <AppBrandIcon
                  packageName={app.packageName}
                  appName={app.appName}
                  size={44}
                />
                <Text
                  className="mt-1 max-w-[56px] text-center text-[10px] font-medium text-zen-muted"
                  numberOfLines={1}
                >
                  {app.appName}
                </Text>
              </Pressable>
            ))}
            {showAddButton ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add apps"
                className="h-11 w-11 items-center justify-center rounded-2xl bg-zen-mist"
                onPress={onAddPress}
              >
                <Text className="text-2xl font-light text-zen-forest">+</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </View>
    );
  }

  // Dense wrap grid — scales cleanly when many apps are selected
  return (
    <View className="rounded-3xl bg-white px-3.5 py-3.5">
      <Text className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-zen-muted">
        You are currently blocking · {apps.length}
      </Text>

      <ScrollView
        style={{ maxHeight: apps.length > 8 ? 200 : undefined }}
        nestedScrollEnabled
        showsVerticalScrollIndicator={apps.length > 8}
      >
        <View className="flex-row flex-wrap" style={{ gap: 8 }}>
          {apps.map((app) => (
            <Pressable
              key={app.packageName}
              className="w-[31%] items-center rounded-2xl bg-zen-cream/90 px-1.5 py-2.5"
              onPress={() => onAppPress?.(app)}
            >
              <AppBrandIcon
                packageName={app.packageName}
                appName={app.appName}
                size={40}
              />
              <Text
                className="mt-1.5 w-full text-center text-[11px] font-semibold text-zen-forest"
                numberOfLines={1}
              >
                {app.appName}
              </Text>
            </Pressable>
          ))}
          {showAddButton ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add apps"
              className="w-[31%] items-center justify-center rounded-2xl bg-zen-mist py-2.5"
              style={{ minHeight: 72 }}
              onPress={onAddPress}
            >
              <Text className="text-2xl font-light text-zen-forest">+</Text>
              <Text className="mt-0.5 text-[11px] font-semibold text-zen-forest">
                Add
              </Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}
