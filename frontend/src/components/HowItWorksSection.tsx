import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

type HowItWorksSectionProps = {
  style?: StyleProp<ViewStyle>;
};

const steps = [
  {
    step: '01',
    title: 'Notice',
    description:
      'The moment you reach for a monitored app, Zen Sweep asks one question: how are you feeling right now? Bored, stressed, tired, lonely — no wrong answer.',
    bg: '#111721',
    border: '#1E2B3D',
    accentColor: '#38BDF8',
  },
  {
    step: '02',
    title: 'Redirect',
    description:
      'You get one small activity matched to that feeling — a breathing timer, a focus sprint, a gratitude prompt. Never longer than three minutes.',
    bg: '#161324',
    border: '#2A2242',
    accentColor: '#A78BFA',
  },
  {
    step: '03',
    title: 'Grow',
    description:
      "Finish it and earn XP toward your avatar, your streak, and real badges. Progress you can see, not just time you didn't spend scrolling.",
    bg: '#0F1B16',
    border: '#1B3529',
    accentColor: '#4ADE80',
  },
];

export function HowItWorksSection({ style }: HowItWorksSectionProps) {
  return (
    <View
      className="w-full rounded-[28px] bg-[#0E1317] p-5 border border-[#1E262E]"
      style={[
        {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
          elevation: 4,
        },
        style,
      ]}
    >
      {/* Tag */}
      <View className="mb-2.5 flex-row items-center">
        <View className="mr-2 h-[2px] w-3 bg-[#52B788]" />
        <Text className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#52B788]">
          How It Works
        </Text>
      </View>

      {/* Headline */}
      <Text className="mb-6 text-[22px] font-bold leading-7 text-white">
        Three steps between you and the scroll.
      </Text>

      {/* Steps List */}
      <View className="gap-3.5">
        {steps.map((item) => (
          <View
            key={item.step}
            className="rounded-2xl p-4.5 border"
            style={{
              backgroundColor: item.bg,
              borderColor: item.border,
            }}
          >
            {/* Step Number */}
            <Text
              className="text-[11px] font-semibold tracking-wider mb-1.5"
              style={{ color: item.accentColor }}
            >
              {item.step}
            </Text>

            {/* Step Title */}
            <Text className="mb-2 text-[17px] font-bold text-white">
              {item.title}
            </Text>

            {/* Step Description */}
            <Text className="text-[13px] leading-5 text-[#94A3B8]">
              {item.description}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
