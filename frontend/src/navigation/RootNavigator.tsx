import {
  createStaticNavigation,
  type StaticParamList,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  ActiveBlockingScreen,
  AppUsageTestScreen,
} from '../features/appBlocking';
import { SignInScreen } from '../features/auth';
import { OnboardingFlow } from '../features/onboarding/OnboardingFlow';
import { BootScreen } from '../screens/BootScreen';
import { colors } from '../theme/colors';
import { MainTabs } from './MainNavigator';

const RootStack = createNativeStackNavigator({
  initialRouteName: 'Boot',
  screenOptions: {
    contentStyle: {
      backgroundColor: colors.zen.cream,
    },
    headerShown: false,
  },
  screens: {
    Boot: {
      screen: BootScreen,
      options: {
        headerShown: false,
        animation: 'fade',
      },
    },
    Onboarding: {
      screen: OnboardingFlow,
      options: {
        headerShown: false,
        animation: 'fade',
      },
    },
    Main: {
      screen: MainTabs,
      options: {
        headerShown: false,
      },
    },
    ActiveBlocking: {
      screen: ActiveBlockingScreen,
      options: {
        headerShown: false,
        gestureEnabled: false,
        animation: 'fade',
        contentStyle: {
          backgroundColor: colors.zen.cream,
        },
      },
    },
    SignIn: {
      screen: SignInScreen,
      options: {
        headerShown: false,
        animation: 'slide_from_right',
      },
    },
    AppUsageTest: {
      screen: AppUsageTestScreen,
      options: {
        headerShown: false,
        presentation: 'modal',
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
