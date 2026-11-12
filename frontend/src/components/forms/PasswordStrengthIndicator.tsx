import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check, Circle } from 'lucide-react-native';

export type PasswordStrengthLevel =
  'empty' | 'weak' | 'fair' | 'good' | 'strong';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  level: PasswordStrengthLevel;
  label: string;
  color: string;
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function evaluatePasswordStrength(
  password: string,
): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      level: 'empty',
      label: '',
      color: '#E2E8F0',
      hasMinLength: false,
      hasUppercase: false,
      hasLowercase: false,
      hasNumber: false,
      hasSpecialChar: false,
    };
  }

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  let score = 0;
  if (password.length >= 6) score += 1;
  if (hasMinLength) score += 1;
  if (hasUppercase && hasLowercase) score += 1;
  if (hasNumber || hasSpecialChar) score += 1;

  // Cap score between 1 and 4 when not empty
  const clampedScore = Math.max(1, Math.min(4, score));

  const levels: Record<
    number,
    { level: PasswordStrengthLevel; label: string; color: string }
  > = {
    1: { level: 'weak', label: 'Weak', color: '#EF4444' },
    2: { level: 'fair', label: 'Fair', color: '#F59E0B' },
    3: { level: 'good', label: 'Good', color: '#4A8C4D' },
    4: { level: 'strong', label: 'Strong', color: '#1B3B2B' },
  };

  const current = levels[clampedScore];

  return {
    score: clampedScore,
    level: current.level,
    label: current.label,
    color: current.color,
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar,
  };
}

export type PasswordStrengthIndicatorProps = {
  password: string;
  showRules?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function PasswordStrengthIndicator({
  password,
  showRules = false,
  style,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const result = evaluatePasswordStrength(password);

  // Automatically hide indicator and requirements once password is strong
  if (result.score >= 4 || result.level === 'strong') {
    return null;
  }

  return (
    <View className="mb-3 mt-1 w-full" style={style}>
      {/* 4 Segmented Progress Bar & Label */}
      <View className="mb-1.5 flex-row items-center justify-between">
        <View className="mr-3 flex-1 flex-row gap-1.5">
          {[1, 2, 3, 4].map((step) => {
            const isActive = result.score >= step;
            return (
              <View
                key={step}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  backgroundColor: isActive ? result.color : '#E5E8E2',
                }}
              />
            );
          })}
        </View>

        <Text className="text-xs font-semibold" style={{ color: result.color }}>
          {result.label}
        </Text>
      </View>

      {/* Optional Requirement Checklist */}
      {showRules && (
        <View className="mt-2 rounded-xl border border-[#E8ECE4] bg-[#FAFAF8] p-2.5">
          <RuleItem passed={result.hasMinLength} text="At least 8 characters" />
          <RuleItem
            passed={result.hasUppercase && result.hasLowercase}
            text="Upper and lowercase letters"
          />
          <RuleItem
            passed={result.hasNumber || result.hasSpecialChar}
            text="At least one number or special character"
          />
        </View>
      )}
    </View>
  );
}

function RuleItem({ passed, text }: { passed: boolean; text: string }) {
  return (
    <View className="my-0.5 flex-row items-center">
      <View className="mr-1.5 items-center justify-center">
        {passed ? (
          <Check size={13} color="#2E7D54" strokeWidth={2.5} />
        ) : (
          <Circle size={5} color="#A1ADA4" fill="#A1ADA4" />
        )}
      </View>
      <Text
        className={`text-[12px] ${
          passed ? 'font-medium text-[#1B3B2B]' : 'text-[#8A9A8F]'
        }`}
      >
        {text}
      </Text>
    </View>
  );
}
