import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import { ZenLogo } from '../../../components/ZenLogo';
import { InputField } from '../../../components/forms/InputField';
import { PasswordStrengthIndicator } from '../../../components/forms/PasswordStrengthIndicator';
import {
  registerUser,
  loginUser,
  loginWithGoogle,
} from '../../../services/authService';
import { useAuth } from '../../../hooks/useAuth';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'signin' | 'signup';

type SignInScreenProps = {
  initialMode?: AuthMode;
  onSuccess?: () => void;
  onBack?: () => void;
};

export function SignInScreen({
  initialMode = 'signin',
  onSuccess,
  onBack,
}: SignInScreenProps) {
  const navigation = useNavigation();
  const { resetPassword } = useAuth();

  const webClientId =
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '456000385900-web.apps.googleusercontent.com';
  const androidClientId =
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || webClientId;
  const iosClientId =
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || webClientId;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    webClientId: webClientId,
    androidClientId: androidClientId,
    iosClientId: iosClientId,
  });

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        setIsSubmitting(true);
        loginWithGoogle(id_token)
          .then((user) => {
            console.log('GOOGLE SIGN IN SUCCESS:', user.uid);
            if (onSuccess) {
              onSuccess();
            } else {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Main' as never }],
              });
            }
          })
          .catch((error) => {
            console.log('GOOGLE SIGN IN ERROR:', error?.code || error?.message);
            Alert.alert(
              'Google Sign-In Failed',
              error?.message || 'Authentication failed.',
            );
          })
          .finally(() => {
            setIsSubmitting(false);
          });
      }
    }
  }, [response]);

  const handleAuth = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim();

    if (mode === 'signup') {
      if (!trimmedEmail || !password || !confirmPassword) {
        Alert.alert('Error', 'Please fill all fields');
        return;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }

      if (password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }

      setIsSubmitting(true);
      try {
        const user = await registerUser(trimmedEmail, password);
        console.log('REGISTER SUCCESS:', user.uid);

        Alert.alert('Success', 'Account created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess();
              } else {
                navigation.navigate('SetupName' as never);
              }
            },
          },
        ]);
      } catch (error: any) {
        console.log('REGISTER ERROR:', error?.code);
        let msg = error?.message || 'Something went wrong';
        if (error?.code === 'auth/configuration-not-found') {
          msg =
            'Email/Password sign-in is not enabled yet in your Firebase Console. Please go to Firebase Console > Authentication > Sign-in method and enable Email/Password.';
        } else if (error?.code === 'auth/email-already-in-use') {
          msg =
            'An account with this email already exists. Please sign in instead.';
        } else if (error?.code === 'auth/invalid-email') {
          msg = 'Please enter a valid email address.';
        } else if (error?.code === 'auth/weak-password') {
          msg = 'Password is too weak. Please use at least 6 characters.';
        }
        Alert.alert('Registration Failed', msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Sign in flow
    if (!trimmedEmail || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser(trimmedEmail, password);
      console.log('LOGIN SUCCESS:', user.uid);

      // Navigate directly to Overview
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (error: any) {
      console.log('LOGIN ERROR:', error?.code);

      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert('Reset Password', 'Please enter your email address first.');
      return;
    }

    try {
      await resetPassword(trimmedEmail);
      setSuccessMessage('Password reset link has been sent to your email.');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Could not send reset email.';
      setErrorMessage(msg);
    }
  };

  const handleGoogleSignIn = async () => {
    if (Platform.OS === 'web') {
      setIsSubmitting(true);
      try {
        const user = await loginWithGoogle();
        console.log('GOOGLE SIGN IN SUCCESS:', user.uid);

        if (onSuccess) {
          onSuccess();
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' as never }],
          });
        }
      } catch (error: any) {
        console.log('GOOGLE SIGN IN ERROR:', error?.code);
        if (
          error?.code === 'auth/popup-closed-by-user' ||
          error?.code === 'auth/cancelled-popup-request'
        ) {
          return;
        }
        let msg = error?.message || 'Could not sign in with Google.';
        if (error?.code === 'auth/configuration-not-found') {
          msg =
            'Google Sign-in is not enabled in Firebase Console. Please enable Google provider under Authentication > Sign-in method.';
        }
        Alert.alert('Google Sign-In Failed', msg);
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // On Native (Android / iOS)
    try {
      await promptAsync();
    } catch (error: any) {
      console.log('PROMPT ASYNC ERROR:', error);
      Alert.alert(
        'Google Sign-In',
        error?.message || 'Could not start Google sign in.',
      );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zen-cream" edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 40,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Brand */}
          <View className="mb-6 flex-row items-center">
            <ZenLogo size={36} />
            <Text className="ml-2.5 text-lg font-bold text-zen-forest">
              Zen Sweep
            </Text>
          </View>

          {/* Title & Tagline */}
          <View className="mb-7">
            <Text className="text-[34px] font-bold tracking-tight text-zen-forest">
              {mode === 'signin' ? 'Welcome' : 'Create Account'}
            </Text>
            <Text className="mt-1 text-[15px] text-zen-muted">
              {mode === 'signin'
                ? 'Continue your growth.'
                : 'Start your journey to digital wellbeing.'}
            </Text>
          </View>

          {/* Auth Card */}
          <View
            className="w-full rounded-3xl border border-zen-border bg-white p-6"
            style={{
              shadowColor: '#1B3B2B',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 2,
            }}
          >
            {/* Segmented Switcher */}
            <View className="mb-6 flex-row rounded-full bg-zen-mist p-1">
              <Pressable
                accessibilityRole="button"
                className={`flex-1 items-center rounded-full py-2.5 ${
                  mode === 'signin' ? 'bg-white' : 'bg-transparent'
                }`}
                onPress={() => {
                  setMode('signin');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={
                  mode === 'signin'
                    ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    : undefined
                }
              >
                <Text
                  className={`text-[14px] font-semibold ${
                    mode === 'signin' ? 'text-zen-forest' : 'text-zen-muted'
                  }`}
                >
                  Sign in
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className={`flex-1 items-center rounded-full py-2.5 ${
                  mode === 'signup' ? 'bg-white' : 'bg-transparent'
                }`}
                onPress={() => {
                  setMode('signup');
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={
                  mode === 'signup'
                    ? {
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.08,
                        shadowRadius: 4,
                        elevation: 2,
                      }
                    : undefined
                }
              >
                <Text
                  className={`text-[14px] font-semibold ${
                    mode === 'signup' ? 'text-zen-forest' : 'text-zen-muted'
                  }`}
                >
                  Sign up
                </Text>
              </Pressable>
            </View>

            {/* Error Message */}
            {errorMessage ? (
              <View className="mb-4 rounded-xl bg-red-50 p-3">
                <Text className="text-xs text-red-700">{errorMessage}</Text>
              </View>
            ) : null}

            {/* Success Message */}
            {successMessage ? (
              <View className="mb-4 rounded-xl bg-green-50 p-3">
                <Text className="text-xs text-green-800">{successMessage}</Text>
              </View>
            ) : null}

            {/* Email Field with InputField Component */}
            <InputField
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              label="Email"
              onChangeText={setEmail}
              placeholder="Enter your email"
              value={email}
            />

            {/* Password Field with InputField Component */}
            <InputField
              autoCapitalize="none"
              isPassword
              label="Password"
              onChangeText={setPassword}
              placeholder="Enter password"
              rightAction={
                mode === 'signin' ? (
                  <Pressable onPress={handleForgotPassword}>
                    <Text className="text-[12px] font-semibold text-[#1B3B2B]">
                      Forgot?
                    </Text>
                  </Pressable>
                ) : undefined
              }
              value={password}
            />

            {/* Password Strength Indicator (Active when signing up) */}
            {mode === 'signup' && password.length > 0 && (
              <PasswordStrengthIndicator password={password} showRules />
            )}

            {/* Confirm Password Field (Sign up only) */}
            {mode === 'signup' && (
              <InputField
                autoCapitalize="none"
                isPassword
                label="Confirm Password"
                onChangeText={setConfirmPassword}
                placeholder="Confirm password"
                value={confirmPassword}
              />
            )}

            {/* Primary Action Button */}
            <Pressable
              accessibilityRole="button"
              className="mt-2 w-full items-center rounded-full bg-[#1B3B2B] py-4 active:opacity-90"
              disabled={isSubmitting}
              onPress={handleAuth}
              style={{
                shadowColor: '#1B3B2B',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text className="text-[15px] font-semibold text-white">
                  {mode === 'signin' ? 'Sign in' : 'Create Account'}
                </Text>
              )}
            </Pressable>

            {/* Divider */}
            <View className="my-5 flex-row items-center">
              <View className="h-[1px] flex-1 bg-[#E2E6DF]" />
              <Text className="mx-3 text-[13px] text-[#8A9A8F]">or</Text>
              <View className="h-[1px] flex-1 bg-[#E2E6DF]" />
            </View>

            {/* Google Sign-in */}
            <Pressable
              accessibilityRole="button"
              className="w-full flex-row items-center justify-center rounded-full border border-[#DCE2D8] bg-[#FAFAF8] py-3.5 active:bg-[#F2F5F0]"
              onPress={handleGoogleSignIn}
            >
              <View className="mr-2.5 items-center justify-center">
                <Svg width={18} height={18} viewBox="0 0 48 48">
                  <Path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <Path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <Path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <Path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </Svg>
              </View>
              <Text className="text-[14px] font-medium text-[#2C3E33]">
                Continue with Google
              </Text>
            </Pressable>
          </View>

          {/* Optional Back or Skip */}
          {onBack ? (
            <Pressable
              className="mt-6 flex-row items-center justify-center py-2"
              onPress={onBack}
            >
              <ArrowLeft size={16} color="#4A6B5D" className="mr-1.5" />
              <Text className="text-[14px] font-medium text-[#4A6B5D]">
                Back to welcome
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
