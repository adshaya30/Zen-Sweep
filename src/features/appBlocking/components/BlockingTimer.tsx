import { Text, View } from 'react-native';

type BlockingTimerProps = {
  remainingSeconds: number;
  endsAtLabel: string;
  completed?: boolean;
};

export function BlockingTimer({
  remainingSeconds,
  endsAtLabel,
  completed = false,
}: BlockingTimerProps) {
  const minutes = Math.floor(Math.max(0, remainingSeconds) / 60);
  const seconds = Math.max(0, remainingSeconds) % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <View className="items-center rounded-3xl bg-white px-4 py-4">
      <Text className="text-[11px] font-semibold uppercase tracking-wide text-zen-muted">
        Time Remaining
      </Text>
      <Text className="mt-1 text-[42px] font-bold tracking-wide text-zen-forest">
        {completed ? '00:00' : display}
      </Text>
      {completed ? (
        <Text className="mt-1.5 text-center text-[13px] text-zen-growth">
          Blocking session completed.
        </Text>
      ) : (
        <Text className="mt-1 text-[13px] text-zen-muted">
          Ends at: {endsAtLabel}
        </Text>
      )}
    </View>
  );
}
