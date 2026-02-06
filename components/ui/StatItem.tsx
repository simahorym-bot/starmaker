import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '@/constants/theme';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

export const StatItem: React.FC<StatItemProps> = ({ label, value, icon, color = COLORS.gold }) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.spacing.xs,
  },
  icon: {
    marginRight: SIZES.spacing.sm,
  },
  content: {
    flex: 1,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    marginBottom: 2,
  },
  value: {
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
});
