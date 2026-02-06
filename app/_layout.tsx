import { Stack } from 'expo-router';
import { GameProvider } from '@/components/GameProvider';
import { NotificationProvider } from '@/components/NotificationSystem';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NotificationProvider>
        <GameProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="setup" />
          </Stack>
        </GameProvider>
      </NotificationProvider>
    </GestureHandlerRootView>
  );
}
