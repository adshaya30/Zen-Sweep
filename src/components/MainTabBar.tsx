import {
  BottomTabBar,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

export function MainTabBar(props: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomGap = Math.max(
    insets.bottom,
    Platform.OS === 'android' ? 48 : 12,
  );

  return (
    <BottomTabBar
      {...props}
      style={{
        backgroundColor: colors.zen.cream,
        borderTopColor: colors.zen.border,
        borderTopWidth: 1,
        elevation: 12,
        paddingTop: 8,
        paddingBottom: bottomGap,
        height: 58 + bottomGap,
      }}
    />
  );
}
