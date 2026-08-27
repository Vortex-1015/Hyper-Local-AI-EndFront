import { View, Text, StyleSheet } from 'react-native';
import { useApp, FONT_SEMIBOLD } from '@/lib/theme';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  const { theme } = useApp();
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { color: theme.mutedText }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONT_SEMIBOLD,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
