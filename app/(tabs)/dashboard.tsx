import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { StatItem } from '@/components/ui/StatItem';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
  const { gameState } = useGame();
  const router = useRouter();

  if (!gameState) {
    return null;
  }

  const { artist, fanbase, studio } = gameState;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatMoney = (num: number) => {
    return `$${formatNumber(num)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.artistName}>{artist.stageName}</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <Card style={styles.statsCard}>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="cash" size={24} color={COLORS.gold} />
              <Text style={styles.statLabel}>Cash</Text>
              <Text style={styles.statValue}>{formatMoney(artist.money)}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color={COLORS.neonPurple} />
              <Text style={styles.statLabel}>Fans</Text>
              <Text style={styles.statValue}>{formatNumber(fanbase.total)}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star" size={24} color={COLORS.neonCyan} />
              <Text style={styles.statLabel}>Prestige</Text>
              <Text style={styles.statValue}>{artist.prestige}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trophy" size={24} color={COLORS.gold} />
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>{artist.level}</Text>
            </View>
          </View>
        </Card>

        {/* Energy */}
        <Card style={styles.energyCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Energy</Text>
            <Text style={styles.energyText}>
              {artist.energy}/{artist.maxEnergy}
            </Text>
          </View>
          <ProgressBar
            progress={(artist.energy / artist.maxEnergy) * 100}
            color={COLORS.neonGreen}
            height={10}
          />
        </Card>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <Card
            onPress={() => router.push('/studio')}
            variant="neon"
            style={styles.actionCard}
          >
            <Ionicons name="musical-notes" size={32} color={COLORS.neonPurple} />
            <Text style={styles.actionTitle}>Create Music</Text>
            <Text style={styles.actionSubtitle}>Studio</Text>
          </Card>

          <Card
            onPress={() => router.push('/tour')}
            variant="gold"
            style={styles.actionCard}
          >
            <MaterialCommunityIcons name="airplane" size={32} color={COLORS.gold} />
            <Text style={styles.actionTitle}>World Tour</Text>
            <Text style={styles.actionSubtitle}>Travel</Text>
          </Card>

          <Card onPress={() => router.push('/social')} style={styles.actionCard}>
            <Ionicons name="people" size={32} color={COLORS.neonCyan} />
            <Text style={styles.actionTitle}>Social</Text>
            <Text style={styles.actionSubtitle}>Network</Text>
          </Card>

          <Card onPress={() => router.push('/merch')} style={styles.actionCard}>
            <Ionicons name="shirt" size={32} color={COLORS.neonGreen} />
            <Text style={styles.actionTitle}>Merch</Text>
            <Text style={styles.actionSubtitle}>Shop</Text>
          </Card>
        </View>

        {/* Career Progress */}
        <Card style={styles.progressCard}>
          <Text style={styles.cardTitle}>Career Progress</Text>
          <View style={styles.progressItem}>
            <ProgressBar
              progress={(artist.experience % 1000) / 10}
              label="Level Progress"
              showPercentage
              color={COLORS.neonPurple}
            />
          </View>
          <View style={styles.progressItem}>
            <ProgressBar
              progress={(artist.reputation / 100) * 100}
              label="Reputation"
              showPercentage
              color={COLORS.gold}
            />
          </View>
          <View style={styles.progressItem}>
            <ProgressBar
              progress={(studio.quality / 10) * 100}
              label="Studio Quality"
              showPercentage
              color={COLORS.neonCyan}
            />
          </View>
        </Card>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Card>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="musical-note" size={20} color={COLORS.neonPurple} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Welcome to Starmaker!</Text>
              <Text style={styles.activityTime}>Start creating your first hit</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  greeting: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  artistName: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gold,
    marginTop: 4,
  },
  settingsButton: {
    padding: SIZES.spacing.sm,
  },
  statsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  energyCard: {
    marginBottom: SIZES.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  energyText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.neonGreen,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  actionCard: {
    width: '48%',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.sm,
  },
  actionSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    marginBottom: SIZES.spacing.lg,
  },
  progressItem: {
    marginBottom: SIZES.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  activityTime: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
