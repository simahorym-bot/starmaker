import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/theme';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.surfaceLight,
          borderTopWidth: 1,
          paddingBottom: insets.bottom,
          height: 60 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 9,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Tableau',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="label"
        options={{
          title: 'Label',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="music-box" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-line" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lifestyle"
        options={{
          title: 'Luxe',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="crown" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="relationships"
        options={{
          title: 'Relations',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="fanbase"
        options={{
          title: 'Fans',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="production"
        options={{
          title: 'Production',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="video" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={20} color={color} />
          ),
        }}
      />
      {/* Legacy screens - hide from tab bar */}
      <Tabs.Screen
        name="media"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="merch"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="tour"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
