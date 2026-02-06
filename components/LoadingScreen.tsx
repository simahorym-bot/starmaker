import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LoadingScreenProps {
  visible: boolean;
  quote?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ visible, quote }) => {
  const t = useLocale();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const randomQuote = quote || t.loadingQuotes[Math.floor(Math.random() * t.loadingQuotes.length)];

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();

      // Shimmer effect
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim, scaleAnim, rotateAnim, shimmerAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <LinearGradient
        colors={[COLORS.background, COLORS.surfaceDark, COLORS.background]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{ scale: scaleAnim }, { rotate: spin }],
            },
          ]}
        >
          <View style={styles.iconGlow}>
            <MaterialCommunityIcons name="music-box" size={80} color={COLORS.gold24K} />
          </View>
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={styles.appName}>{t.appName}</Text>
          <View style={styles.shimmerContainer}>
            <Animated.View
              style={[
                styles.shimmer,
                {
                  transform: [{ translateX: shimmerTranslate }],
                },
              ]}
            />
            <Text style={styles.tagline}>{t.appTagline}</Text>
          </View>

          <View style={styles.quoteContainer}>
            <MaterialCommunityIcons name="format-quote-open" size={24} color={COLORS.electricBlue} />
            <Text style={styles.quote}>{randomQuote}</Text>
            <MaterialCommunityIcons name="format-quote-close" size={24} color={COLORS.electricBlue} />
          </View>

          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  iconContainer: {
    marginBottom: SIZES.spacing.xxxl,
  },
  iconGlow: {
    shadowColor: COLORS.gold24K,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.gold24K,
    letterSpacing: 2,
    textShadowColor: COLORS.goldShimmer,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: SIZES.spacing.sm,
  },
  shimmerContainer: {
    position: 'relative',
    overflow: 'hidden',
    marginBottom: SIZES.spacing.xxxl,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.electricBlue,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.spacing.xl,
    gap: SIZES.spacing.md,
    marginTop: SIZES.spacing.xxl,
  },
  quote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    flex: 1,
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.xl,
    gap: SIZES.spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.gold24K,
  },
  dot1: {
    opacity: 0.3,
  },
  dot2: {
    opacity: 0.6,
  },
  dot3: {
    opacity: 1,
  },
});
