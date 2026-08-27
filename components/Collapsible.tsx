import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useApp, FONT_SEMIBOLD } from '@/lib/theme';

interface CollapsibleProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Collapsible({ title, children, defaultOpen = false }: CollapsibleProps) {
  const { theme } = useApp();
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View>
      <TouchableOpacity
        style={[styles.header, { borderColor: theme.border }]}
        onPress={() => setOpen(!open)}
        activeOpacity={0.7}
      >
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {open ? (
          <ChevronUp size={20} color={theme.mutedText} />
        ) : (
          <ChevronDown size={20} color={theme.mutedText} />
        )}
      </TouchableOpacity>
      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONT_SEMIBOLD,
  },
  content: {
    paddingTop: 14,
  },
});
