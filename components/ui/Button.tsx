import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'gold' | 'neon' | 'danger' | 'electric';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return COLORS.surfaceLight;
    switch (variant) {
      case 'gold':
        return COLORS.gold;
      case 'neon':
        return COLORS.neonPurple;
      case 'danger':
        return COLORS.error;
      case 'electric':
        return COLORS.electricBlue;
      case 'secondary':
        return COLORS.surfaceLight;
      default:
        return COLORS.neonCyan;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textTertiary;
    return variant === 'secondary' ? COLORS.textPrimary : '#000000';
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: SIZES.spacing.sm, paddingHorizontal: SIZES.spacing.md };
      case 'lg':
        return { paddingVertical: SIZES.spacing.lg, paddingHorizontal: SIZES.spacing.xl };
      default:
        return { paddingVertical: SIZES.spacing.md, paddingHorizontal: SIZES.spacing.lg };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        getPadding(),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: SIZES.md,
    fontWeight: '600',
  },
});
