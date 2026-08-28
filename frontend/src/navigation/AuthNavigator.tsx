import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SignInScreen } from '../features/auth/screens/SignInScreen';

export type AuthStackParamList = {
  SignIn: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F7F8F2' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}
