import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { ActiveBlockScreen } from '../screens/ActiveBlockScreen';
import { AppSelectionScreen } from '../screens/AppSelectionScreen';
import { BlockHomeScreen } from '../screens/BlockHomeScreen';
import { DurationSelectionScreen } from '../screens/DurationSelectionScreen';
import { SmartBlockMoodScreen } from '../screens/SmartBlockMoodScreen';
import { SmartBlockResultScreen } from '../screens/SmartBlockResultScreen';
import { colors } from '../theme/colors';

export type SelectedApp = {
  name: string;
  icon: string;
};

export type BlockStackParamList = {
  BlockHome: undefined;
  SmartBlockMood: undefined;
  SmartBlockResult: {
    moodEmoji: string;
    moodLabel: string;
  };
  AppSelection: undefined;
  DurationSelection: {
    selectedApps: SelectedApp[];
  };
  ActiveBlock: {
    selectedApps: SelectedApp[];
    durationId: string;
    durationLabel: string;
  };
};

export type BlockNavigationProp<T extends keyof BlockStackParamList> =
  NativeStackNavigationProp<BlockStackParamList, T>;

export type BlockRouteProp<T extends keyof BlockStackParamList> = RouteProp<
  BlockStackParamList,
  T
>;

const screenOptions = {
  contentStyle: {
    backgroundColor: colors.zen.cream,
  },
  headerStyle: {
    backgroundColor: colors.zen.forest,
  },
  headerTintColor: colors.zen.cream,
  headerTitleStyle: {
    fontWeight: '700' as const,
    color: colors.zen.cream,
  },
  headerShadowVisible: false,
};

export const BlockNavigator = createNativeStackNavigator({
  initialRouteName: 'BlockHome',
  screenOptions,
  screens: {
    BlockHome: {
      screen: BlockHomeScreen,
      options: {
        title: 'Zen Sweep',
      },
    },
    SmartBlockMood: {
      screen: SmartBlockMoodScreen,
      options: {
        title: 'Smart Block',
      },
    },
    SmartBlockResult: {
      screen: SmartBlockResultScreen,
      options: {
        title: 'Your Activity',
      },
    },
    AppSelection: {
      screen: AppSelectionScreen,
      options: {
        title: 'Schedule Block',
      },
    },
    DurationSelection: {
      screen: DurationSelectionScreen,
      options: {
        title: 'Duration',
      },
    },
    ActiveBlock: {
      screen: ActiveBlockScreen,
      options: {
        title: 'Active Block',
        headerBackVisible: false,
        gestureEnabled: false,
      },
    },
  },
});
