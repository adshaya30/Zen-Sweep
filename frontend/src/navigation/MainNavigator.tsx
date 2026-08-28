import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

import { MainTabBar } from '../components/MainTabBar';
import {
  BlocksTabIcon,
  InsightsTabIcon,
  OverviewTabIcon,
  ProfileTabIcon,
} from '../components/TabBarIcons';
import { AppBlockingSetupScreen } from '../features/appBlocking';
import { InsightsScreen } from '../screens/InsightsScreen';
import { OverviewScreen } from '../screens/OverviewScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors } from '../theme/colors';

export const MainTabs = createBottomTabNavigator({
  initialRouteName: 'Overview',
  tabBar: (props) => <MainTabBar {...props} />,
  screenOptions: {
    headerShown: false,
    tabBarHideOnKeyboard: true,
    tabBarShowLabel: true,
    tabBarActiveTintColor: colors.zen.forest,
    tabBarInactiveTintColor: colors.zen.muted,
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '700',
      marginTop: 2,
    },
    tabBarIconStyle: {
      width: 32,
      height: 32,
    },
  },
  screens: {
    Overview: {
      screen: OverviewScreen,
      options: {
        title: 'Overview',
        tabBarIcon: ({ color, focused }) => (
          <OverviewTabIcon color={color} focused={focused} />
        ),
      },
    },
    Insights: {
      screen: InsightsScreen,
      options: {
        title: 'Insights',
        tabBarIcon: ({ color, focused }) => (
          <InsightsTabIcon color={color} focused={focused} />
        ),
      },
    },
    Blocks: {
      screen: AppBlockingSetupScreen,
      options: {
        title: 'Blocks',
        tabBarIcon: ({ color, focused }) => (
          <View>
            <BlocksTabIcon color={color} focused={focused} />
            <View
              style={{
                position: 'absolute',
                top: -6,
                right: -14,
                backgroundColor: '#F08A6B',
                borderRadius: 6,
                paddingHorizontal: 4,
                paddingVertical: 1,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: '800' }}>
                Beta
              </Text>
            </View>
          </View>
        ),
      },
    },
    Profile: {
      screen: ProfileScreen,
      options: {
        title: 'Profile',
        tabBarIcon: ({ color, focused }) => (
          <ProfileTabIcon color={color} focused={focused} />
        ),
      },
    },
  },
});
