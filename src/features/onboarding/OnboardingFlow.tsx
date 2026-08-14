import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import { OnboardingProvider, useOnboardingDraft } from './OnboardingContext';
import { DreamScreen } from './screens/DreamScreen';
import { InterestsScreen } from './screens/InterestsScreen';
import { NameScreen } from './screens/NameScreen';
import { SleepScreen } from './screens/SleepScreen';
import { TrapAppsScreen } from './screens/TrapAppsScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  SetupName: undefined;
  SetupDream: undefined;
  SetupInterests: undefined;
  SetupApps: undefined;
  SetupSleep: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

function OnboardingStack({ onFinished }: { onFinished: () => void }) {
  const { complete } = useOnboardingDraft();

  const finish = async () => {
    await complete();
    onFinished();
  };

  return (
    <>
      <StatusBar style="dark" />
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#FDFBE4' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome">
          {({ navigation: nav }) => (
            <WelcomeScreen
              onStart={() => nav.navigate('SetupName')}
              onSignIn={() => nav.navigate('SetupName')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SetupName">
          {({ navigation: nav }) => (
            <NameScreen onNext={() => nav.navigate('SetupDream')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="SetupDream">
          {({ navigation: nav }) => (
            <DreamScreen
              onBack={() => nav.goBack()}
              onNext={() => nav.navigate('SetupInterests')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SetupInterests">
          {({ navigation: nav }) => (
            <InterestsScreen
              onBack={() => nav.goBack()}
              onNext={() => nav.navigate('SetupApps')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SetupApps">
          {({ navigation: nav }) => (
            <TrapAppsScreen
              onBack={() => nav.goBack()}
              onNext={() => nav.navigate('SetupSleep')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SetupSleep">
          {({ navigation: nav }) => (
            <SleepScreen
              onBack={() => nav.goBack()}
              onNext={() => void finish()}
              nextLabel="Start  >"
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </>
  );
}

export function OnboardingFlow() {
  const navigation = useNavigation();

  return (
    <OnboardingProvider>
      <OnboardingStack
        onFinished={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
          })
        }
      />
    </OnboardingProvider>
  );
}
