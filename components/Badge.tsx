import { View, Text, StyleSheet } from 'react-native';
import { useApp, FONT_REGULAR, FONT_SEMIBOLD } from '@/lib/theme';

type BadgeVariant = 'good' | 'warning' | 'bad' | 'neutral' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { theme } = useApp();
  const colors: Record<BadgeVariant, { bg: string; fg: string }> = {
    good: { bg: theme.good + '20', fg: theme.good },
    warning: { bg: theme.warning + '20', fg: theme.warning },
    bad: { bg: theme.bad + '20', fg: theme.bad },
    primary: { bg: theme.primary + '20', fg: theme.primary },
    neutral: { bg: theme.mutedText + '20', fg: theme.mutedText },
  };
  const c = colors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.fg + '40' }]}>
      <Text style={[styles.text, { color: c.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONT_SEMIBOLD,
    letterSpacing: 0.5,
  },
});
