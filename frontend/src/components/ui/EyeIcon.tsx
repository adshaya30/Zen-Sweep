import { Eye, EyeOff } from 'lucide-react-native';

type EyeIconProps = {
  visible: boolean;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function EyeIcon({
  visible,
  size = 20,
  color = '#64746B',
  strokeWidth = 1.75,
}: EyeIconProps) {
  return visible ? (
    <EyeOff size={size} color={color} strokeWidth={strokeWidth} />
  ) : (
    <Eye size={size} color={color} strokeWidth={strokeWidth} />
  );
}
