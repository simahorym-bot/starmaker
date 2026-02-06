import { Stack } from 'expo-router';
import { GameProvider } from '@/components/GameProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GameProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="setup" />
        </Stack>
      </GameProvider>
    </GestureHandlerRootView>
  );
}
