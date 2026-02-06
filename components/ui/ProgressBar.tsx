import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { COLORS, SIZES } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  color = COLORS.gold,
  height = 8,
  style,
}) => {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 500,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value}%`,
  }));

  return (
    <View style={[styles.container, style]}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>{Math.round(progress)}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: color, height }, animatedStyle]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  percentage: {
    color: COLORS.gold,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.sm,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: SIZES.radius.sm,
  },
});
