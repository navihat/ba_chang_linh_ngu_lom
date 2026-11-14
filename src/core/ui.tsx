// Thành phần giao diện dùng chung. VÙNG ĐÓNG BĂNG: báo cả nhóm trước khi sửa.
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from './theme';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, primary ? styles.primary : styles.secondary, disabled && styles.disabled]}>
      <Text style={[styles.label, { color: primary ? colors.onPrimary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: spacing.md, borderRadius: 12, alignItems: 'center' },
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  disabled: { opacity: 0.5 },
  label: { fontSize: 16, fontWeight: '600' },
});
