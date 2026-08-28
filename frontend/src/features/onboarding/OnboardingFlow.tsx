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
import { SignInScreen } from '../auth/screens/SignInScreen';

export type OnboardingStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
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
              onStart={() => nav.navigate('SignUp')}
              onSignIn={() => nav.navigate('SignIn')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SignIn">
          {({ navigation: nav }) => (
            <SignInScreen
              initialMode="signin"
              onBack={() => nav.goBack()}
              onSuccess={() => nav.navigate('SetupName')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SignUp">
          {({ navigation: nav }) => (
            <SignInScreen
              initialMode="signup"
              onBack={() => nav.goBack()}
              onSuccess={() => nav.navigate('SetupName')}
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
