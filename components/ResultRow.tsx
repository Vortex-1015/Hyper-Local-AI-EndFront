import { View, Text, StyleSheet } from 'react-native';
import { useApp, FONT_REGULAR, FONT_SEMIBOLD } from '@/lib/theme';

interface ResultRowProps {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}

export function ResultRow({ label, value, valueColor, bold }: ResultRowProps) {
  const { theme } = useApp();
  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: theme.mutedText }]}>{label}</Text>
      <Text
        style={[
          styles.value,
          { color: valueColor ?? theme.text },
          bold && styles.bold,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 16,
  },
  label: {
    fontSize: 14,
    flexShrink: 0,
    fontFamily: FONT_REGULAR,
  },
  value: {
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
    fontFamily: FONT_REGULAR,
  },
  bold: {
    fontWeight: '600',
    fontFamily: FONT_SEMIBOLD,
  },
});
