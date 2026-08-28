import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export type InputFieldProps = TextInputProps & {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: ReactNode;
  rightAction?: ReactNode;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function InputField({
  label,
  error,
  helperText,
  leftIcon,
  rightAction,
  isPassword = false,
  containerStyle,
  secureTextEntry,
  ...textInputProps
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isSecure = isPassword ? !showPassword : secureTextEntry;

  return (
    <View className="w-full mb-4" style={containerStyle}>
      {/* Label and optional right action */}
      {(label || rightAction) && (
        <View className="mb-2 flex-row items-center justify-between">
          {label ? (
            <Text className="text-[14px] font-medium text-[#1B3B2B]">
              {label}
            </Text>
          ) : <View />}
          {rightAction}
        </View>
      )}

      {/* Input Box */}
      <View
        className={`flex-row items-center rounded-2xl border px-4 py-0.5 ${
          error
            ? 'border-red-400 bg-red-50/20'
            : 'border-[#DCE2D8] bg-[#FAFAF8]'
        }`}
      >
        {leftIcon ? <View className="mr-2.5">{leftIcon}</View> : null}

        <TextInput
          className="flex-1 py-3 text-[15px] text-[#1B3B2B]"
          placeholderTextColor="#9EAFA4"
          cursorColor="#1B3B2B"
          selectionColor="#1B3B2B"
          autoCorrect={false}
          secureTextEntry={isSecure}
          style={[
            {
              color: '#1B3B2B',
              fontSize: 15,
            },
            Platform.OS === 'web'
              ? ({
                  outline: 'none',
                  outlineStyle: 'none',
                  outlineWidth: 0,
                  boxShadow: 'none',
                } as unknown as StyleProp<ViewStyle>)
              : undefined,
          ]}
          {...textInputProps}
        />

        {/* Password toggle icon button using Lucide */}
        {isPassword && (
          <Pressable
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
            className="p-2 -mr-1 rounded-full active:bg-[#E8ECE4]"
            hitSlop={8}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeOff size={20} color="#64746B" strokeWidth={1.75} />
            ) : (
              <Eye size={20} color="#64746B" strokeWidth={1.75} />
            )}
          </Pressable>
        )}
      </View>

      {/* Error or Helper text */}
      {error ? (
        <Text className="mt-1 text-xs text-red-600">{error}</Text>
      ) : helperText ? (
        <Text className="mt-1 text-xs text-[#8A9A8F]">{helperText}</Text>
      ) : null}
    </View>
  );
}
