import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/components/GameProvider';
import { LoadingScreen } from '@/components/LoadingScreen';

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
    <View style={{ flex: 1 }}>
      <LoadingScreen visible={true} />
    </View>
  );
}
