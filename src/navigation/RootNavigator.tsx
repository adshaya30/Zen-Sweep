import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DetailsScreen } from '../screens/DetailsScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { colors } from '../theme/colors';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Home',
  screenOptions: {
    contentStyle: {
      backgroundColor: colors.slate[50],
    },
    headerTintColor: colors.brand[600],
  },
  screens: {
    Home: {
      screen: HomeScreen,
      options: {
        title: 'Zen Sweep',
      },
    },
    Details: {
      screen: DetailsScreen,
      options: {
        title: 'Setup Complete',
      },
    },
  },
});

export type RootStackParamList = StaticParamList<typeof RootStack>;
type RootStackType = typeof RootStack;

declare module '@react-navigation/native' {
  // The empty body is required for React Navigation's module augmentation.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface RootNavigator extends RootStackType {}
}

export const RootNavigation = createStaticNavigation(RootStack);
