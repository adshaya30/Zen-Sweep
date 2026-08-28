import { Image, type ImageStyle, type StyleProp } from 'react-native';

type ZenLogoProps = {
  size?: number;
  style?: StyleProp<ImageStyle>;
};

export function ZenLogo({ size = 40, style }: ZenLogoProps) {
  return (
    <Image
      source={require('../../assets/logo.png')}
      accessibilityLabel="Zen Sweep"
      style={[{ width: size, height: size, borderRadius: size / 2 }, style]}
      resizeMode="cover"
    />
  );
}
