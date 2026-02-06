import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/components/GameProvider';
import { COLORS } from '@/constants/theme';

export default function Index() {
  const router = useRouter();
  const { gameState, loading } = useGame();

  useEffect(() => {
    if (!loading) {
      if (gameState) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/setup');
      }
    }
  }, [loading, gameState]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>👑</Text>
      <Text style={styles.title}>Music Tycoon</Text>
      <Text style={styles.tagline}>Bâtissez Votre Empire Musical</Text>
      <ActivityIndicator size="large" color={COLORS.gold} style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gold,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
