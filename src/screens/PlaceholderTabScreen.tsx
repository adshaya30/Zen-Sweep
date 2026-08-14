import { Text, View } from 'react-native';

type PlaceholderTabScreenProps = {
  title: string;
  subtitle: string;
};

export function PlaceholderTabScreen({
  title,
  subtitle,
}: PlaceholderTabScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-block-bg px-6">
      <Text className="text-3xl font-bold text-white">{title}</Text>
      <Text className="mt-3 text-center text-base leading-6 text-block-muted">
        {subtitle}
      </Text>
    </View>
  );
}
