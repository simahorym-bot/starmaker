import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'achievement';
  message: string;
  icon: string;
  duration?: number;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const t = useLocale();

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration || 4000,
    };

    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, newNotification.duration);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <View style={styles.notificationContainer}>
        {notifications.map((notification, index) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            index={index}
          />
        ))}
      </View>
    </NotificationContext.Provider>
  );
};

interface NotificationItemProps {
  notification: Notification;
  index: number;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, index }) => {
  const [translateY] = useState(new Animated.Value(-100));
  const [opacity] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    return () => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    };
  }, []);

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return [COLORS.neonGreen, COLORS.neonGreen + 'CC'];
      case 'info':
        return [COLORS.electricBlue, COLORS.electricBlue + 'CC'];
      case 'warning':
        return [COLORS.goldDark, COLORS.goldDark + 'CC'];
      case 'achievement':
        return [COLORS.gold24K, COLORS.gold24K + 'CC'];
      default:
        return [COLORS.surface, COLORS.surfaceLight];
    }
  };

  return (
    <Animated.View
      style={[
        styles.notification,
        {
          transform: [{ translateY }],
          opacity,
          top: 60 + index * 90,
        },
      ]}
    >
      <BlurView intensity={80} style={styles.notificationBlur}>
        <LinearGradient colors={getColors()} style={styles.notificationGradient}>
          <MaterialCommunityIcons
            name={notification.icon as any}
            size={32}
            color={COLORS.background}
          />
          <Text style={styles.notificationText}>{notification.message}</Text>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

// Helper functions for common notifications
export const useImmersiveNotifications = () => {
  const { showNotification } = useNotification();
  const t = useLocale();

  return {
    chartEntry: (position: number) =>
      showNotification({
        type: 'achievement',
        message: t.immersiveNotifications.chartEntry,
        icon: 'chart-line',
      }),

    goldRecord: () =>
      showNotification({
        type: 'achievement',
        message: t.immersiveNotifications.goldRecord,
        icon: 'disc',
        duration: 5000,
      }),

    platinumRecord: () =>
      showNotification({
        type: 'achievement',
        message: t.immersiveNotifications.platinumRecord,
        icon: 'disc',
        duration: 5000,
      }),

    number1Hit: () =>
      showNotification({
        type: 'achievement',
        message: t.immersiveNotifications.number1Hit,
        icon: 'trophy',
        duration: 6000,
      }),

    viralMoment: () =>
      showNotification({
        type: 'success',
        message: t.immersiveNotifications.viralMoment,
        icon: 'fire',
        duration: 4000,
      }),

    fanMilestone: (count: number) =>
      showNotification({
        type: 'success',
        message: t.immersiveNotifications.fanMilestone.replace('{count}', count.toLocaleString()),
        icon: 'account-group',
      }),

    contractOffer: () =>
      showNotification({
        type: 'info',
        message: t.immersiveNotifications.contractOffer,
        icon: 'file-document',
      }),

    luxuryUnlocked: (item: string) =>
      showNotification({
        type: 'achievement',
        message: t.immersiveNotifications.luxuryUnlocked.replace('{item}', item),
        icon: 'diamond-stone',
      }),
  };
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    pointerEvents: 'none',
  },
  notification: {
    position: 'absolute',
    left: SIZES.spacing.md,
    right: SIZES.spacing.md,
  },
  notificationBlur: {
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  notificationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    gap: SIZES.spacing.md,
  },
  notificationText: {
    flex: 1,
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.background,
  },
});
