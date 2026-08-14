import { Image, type ImageSourcePropType, Text, View } from 'react-native';

type AppBrandIconProps = {
  packageName: string;
  appName?: string;
  size?: number;
};

const ICON_SOURCES: Record<string, ImageSourcePropType> = {
  'com.instagram.android': require('../../assets/app-icons/icon-instagram.png'),
  'com.zhiliaoapp.musically': require('../../assets/app-icons/icon-tiktok.png'),
  'com.twitter.android': require('../../assets/app-icons/icon-twitter.png'),
  'com.reddit.frontpage': require('../../assets/app-icons/icon-reddit.png'),
  'com.google.android.youtube': require('../../assets/app-icons/icon-youtube.png'),
  'com.facebook.katana': require('../../assets/app-icons/icon-facebook.png'),
  'com.snapchat.android': require('../../assets/app-icons/icon-snapchat.png'),
  'com.discord': require('../../assets/app-icons/icon-discord.png'),
  'com.whatsapp': require('../../assets/app-icons/icon-whatsapp.png'),
  'com.android.chrome': require('../../assets/app-icons/icon-chrome.png'),
};

const FALLBACK: Record<string, { bg: string; fg: string; mark: string }> = {
  'com.instagram.android': { bg: '#E1306C', fg: '#FFFFFF', mark: 'Ig' },
  'com.zhiliaoapp.musically': { bg: '#111111', fg: '#25F4EE', mark: 'Tk' },
  'com.twitter.android': { bg: '#000000', fg: '#FFFFFF', mark: 'X' },
  'com.reddit.frontpage': { bg: '#FF4500', fg: '#FFFFFF', mark: 'Re' },
  'com.google.android.youtube': { bg: '#FF0000', fg: '#FFFFFF', mark: '▶' },
  'com.facebook.katana': { bg: '#1877F2', fg: '#FFFFFF', mark: 'f' },
  'com.snapchat.android': { bg: '#FFFC00', fg: '#111111', mark: 'Sc' },
  'com.discord': { bg: '#5865F2', fg: '#FFFFFF', mark: 'D' },
  'com.whatsapp': { bg: '#25D366', fg: '#FFFFFF', mark: 'W' },
  'com.android.chrome': { bg: '#4285F4', fg: '#FFFFFF', mark: 'C' },
};

export function AppBrandIcon({
  packageName,
  appName,
  size = 48,
}: AppBrandIconProps) {
  const source = ICON_SOURCES[packageName];
  const radius = Math.round(size * 0.22);

  if (source) {
    return (
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
        }}
        resizeMode="cover"
      />
    );
  }

  const brand = FALLBACK[packageName];
  const letter =
    brand?.mark ??
    (appName?.trim()?.charAt(0) ?? packageName.charAt(0)).toUpperCase();

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: brand?.bg ?? '#1B3B2B',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <Text
        style={{
          color: brand?.fg ?? '#FDFBE4',
          fontSize: size * (letter.length > 1 ? 0.32 : 0.42),
          fontWeight: '800',
        }}
      >
        {letter}
      </Text>
    </View>
  );
}
