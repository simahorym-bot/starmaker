import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { clearGameState } from '@/services/gameState';
import { useRouter } from 'expo-router';

export default function Profile() {
  const { gameState, updateGameState, refreshGameState } = useGame();
  const router = useRouter();
  const [showStats, setShowStats] = useState(true);

  if (!gameState) return null;

  const { artist, fanbase, studio, team, songs, merchandise, luxuryItems, mediaEvents, relationships } = gameState;

  const careerDays = Math.floor((Date.now() - artist.createdAt) / (1000 * 60 * 60 * 24));
  const totalEarnings = songs.reduce((sum, s) => sum + s.earnings, 0) + merchandise.reduce((sum, m) => sum + m.revenue, 0);
  const ownedLuxury = luxuryItems.filter((i) => i.owned).length;

  const handleRestEnergy = async () => {
    const restCost = 5000;
    if (artist.money < restCost) {
      Alert.alert('Insufficient Funds', `Rest costs $${restCost}`);
      return;
    }

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - restCost,
        energy: artist.maxEnergy,
      },
    });

    Alert.alert('Fully Rested!', 'Energy restored to maximum');
  };

  const handleResetGame = () => {
    Alert.alert(
      'Reset Game',
      'Are you sure? This will delete all progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearGameState();
            router.replace('/setup');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>⭐</Text>
          </View>
          <Text style={styles.stageName}>{artist.stageName}</Text>
          <Text style={styles.realName}>{artist.name}</Text>
          <Text style={styles.genre}>{artist.genre} Artist</Text>

          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="star" size={20} color={COLORS.gold} />
            <Text style={styles.levelText}>Level {artist.level}</Text>
          </View>
        </View>

        {/* Core Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="cash" size={24} color={COLORS.gold} />
              <Text style={styles.statLabel}>Net Worth</Text>
              <Text style={styles.statValue}>${artist.money.toLocaleString()}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people" size={24} color={COLORS.neonPurple} />
              <Text style={styles.statLabel}>Fans</Text>
              <Text style={styles.statValue}>{fanbase.total.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="crown" size={24} color={COLORS.gold} />
              <Text style={styles.statLabel}>Prestige</Text>
              <Text style={styles.statValue}>{artist.prestige}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="star" size={24} color={COLORS.neonCyan} />
              <Text style={styles.statLabel}>Reputation</Text>
              <Text style={styles.statValue}>{artist.reputation}</Text>
            </View>
          </View>
        </Card>

        {/* Energy Management */}
        <Card style={styles.energyCard}>
          <Text style={styles.cardTitle}>Energy Management</Text>
          <ProgressBar
            progress={(artist.energy / artist.maxEnergy) * 100}
            label="Current Energy"
            showPercentage
            color={COLORS.neonCyan}
            height={12}
            style={{ marginBottom: SIZES.spacing.md }}
          />
          <Button
            title="💤 Rest & Recover ($5,000)"
            onPress={handleRestEnergy}
            variant="neon"
          />
        </Card>

        {/* Career Stats */}
        <Card style={styles.careerCard}>
          <Text style={styles.cardTitle}>Career Overview</Text>

          <View style={styles.careerStats}>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatLabel}>Days Active</Text>
              <Text style={styles.careerStatValue}>{careerDays}</Text>
            </View>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatLabel}>Songs Released</Text>
              <Text style={styles.careerStatValue}>{songs.length}</Text>
            </View>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatLabel}>Total Streams</Text>
              <Text style={styles.careerStatValue}>
                {songs.reduce((sum, s) => sum + s.streams, 0).toLocaleString()}
              </Text>
            </View>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatLabel}>Total Earnings</Text>
              <Text style={styles.careerStatValue}>${totalEarnings.toLocaleString()}</Text>
            </View>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatLabel}>Media Events</Text>
              <Text style={styles.careerStatValue}>{mediaEvents.length}</Text>
            </View>
            <View style={styles.careerStat}>
              <Text style={styles.careerStatLabel}>Network Size</Text>
              <Text style={styles.careerStatValue}>{relationships.length}</Text>
            </View>
          </View>
        </Card>

        {/* Team */}
        <Card style={styles.teamCard}>
          <Text style={styles.cardTitle}>Your Team</Text>
          <View style={styles.teamMember}>
            <MaterialCommunityIcons name="account-tie" size={24} color={COLORS.neonPurple} />
            <Text style={styles.teamMemberText}>
              Manager: {team.manager?.name || 'Not hired'}
            </Text>
          </View>
          <View style={styles.teamMember}>
            <MaterialCommunityIcons name="toolbox" size={24} color={COLORS.neonCyan} />
            <Text style={styles.teamMemberText}>
              Engineer: {team.engineer?.name || 'Not hired'}
            </Text>
          </View>
          <View style={styles.teamMember}>
            <MaterialCommunityIcons name="bullhorn" size={24} color={COLORS.gold} />
            <Text style={styles.teamMemberText}>
              Publicist: {team.publicist?.name || 'Not hired'}
            </Text>
          </View>
        </Card>

        {/* Assets */}
        <Card style={styles.assetsCard}>
          <Text style={styles.cardTitle}>Assets & Possessions</Text>
          <View style={styles.assetRow}>
            <Text style={styles.assetLabel}>Studio Quality</Text>
            <Text style={styles.assetValue}>{studio.quality}/10</Text>
          </View>
          <View style={styles.assetRow}>
            <Text style={styles.assetLabel}>Merchandise Lines</Text>
            <Text style={styles.assetValue}>{merchandise.length}</Text>
          </View>
          <View style={styles.assetRow}>
            <Text style={styles.assetLabel}>Luxury Items</Text>
            <Text style={styles.assetValue}>{ownedLuxury}</Text>
          </View>
        </Card>

        {/* Fanbase Breakdown */}
        <Card style={styles.fanbaseCard}>
          <Text style={styles.cardTitle}>Fanbase Analytics</Text>
          <View style={styles.fanbreakdown}>
            <View style={styles.fanType}>
              <View style={[styles.fanDot, { backgroundColor: COLORS.neonPurple }]} />
              <Text style={styles.fanTypeLabel}>Hardcore Fans</Text>
              <Text style={styles.fanTypeValue}>{fanbase.hardcore.toLocaleString()}</Text>
            </View>
            <View style={styles.fanType}>
              <View style={[styles.fanDot, { backgroundColor: COLORS.neonCyan }]} />
              <Text style={styles.fanTypeLabel}>Casual Fans</Text>
              <Text style={styles.fanTypeValue}>{fanbase.casual.toLocaleString()}</Text>
            </View>
            <View style={styles.fanType}>
              <View style={[styles.fanDot, { backgroundColor: COLORS.error }]} />
              <Text style={styles.fanTypeLabel}>Haters</Text>
              <Text style={styles.fanTypeValue}>{fanbase.haters.toLocaleString()}</Text>
            </View>
          </View>
        </Card>

        {/* Hall of Fame */}
        <Card style={styles.hofCard} variant="gold">
          <View style={styles.hofHeader}>
            <MaterialCommunityIcons name="trophy" size={40} color={COLORS.gold} />
            <View style={styles.hofInfo}>
              <Text style={styles.hofTitle}>Hall of Fame</Text>
              <Text style={styles.hofSubtitle}>Your legacy awaits</Text>
            </View>
          </View>
          <View style={styles.hofStats}>
            <View style={styles.hofStat}>
              <Text style={styles.hofStatValue}>{songs.length}</Text>
              <Text style={styles.hofStatLabel}>Tracks</Text>
            </View>
            <View style={styles.hofStat}>
              <Text style={styles.hofStatValue}>{mediaEvents.length}</Text>
              <Text style={styles.hofStatLabel}>Media</Text>
            </View>
            <View style={styles.hofStat}>
              <Text style={styles.hofStatValue}>{artist.prestige}</Text>
              <Text style={styles.hofStatLabel}>Prestige</Text>
            </View>
          </View>
        </Card>

        {/* Danger Zone */}
        <Card style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>⚠️ Danger Zone</Text>
          <Button
            title="Reset Game"
            onPress={handleResetGame}
            variant="danger"
            size="sm"
          />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  avatarText: {
    fontSize: 50,
  },
  stageName: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  realName: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  genre: {
    fontSize: SIZES.md,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.lg,
    borderRadius: SIZES.radius.xl,
    marginTop: SIZES.spacing.md,
    gap: SIZES.spacing.xs,
  },
  levelText: {
    color: COLORS.gold,
    fontWeight: '700',
    fontSize: SIZES.md,
  },
  statsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SIZES.spacing.md,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.xs,
  },
  statValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  energyCard: {
    marginBottom: SIZES.spacing.lg,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  careerCard: {
    marginBottom: SIZES.spacing.lg,
  },
  careerStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.lg,
  },
  careerStat: {
    width: '45%',
  },
  careerStatLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  careerStatValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  teamCard: {
    marginBottom: SIZES.spacing.lg,
  },
  teamMember: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    gap: SIZES.spacing.md,
  },
  teamMemberText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
  },
  assetsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  assetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  assetLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  assetValue: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.gold,
  },
  fanbaseCard: {
    marginBottom: SIZES.spacing.lg,
  },
  fanbreakdown: {
    gap: SIZES.spacing.md,
  },
  fanType: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  fanDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fanTypeLabel: {
    flex: 1,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  fanTypeValue: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  hofCard: {
    marginBottom: SIZES.spacing.lg,
  },
  hofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  hofInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  hofTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  hofSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hofStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  hofStat: {
    alignItems: 'center',
  },
  hofStatValue: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  hofStatLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  dangerCard: {
    marginBottom: SIZES.spacing.xl,
    backgroundColor: COLORS.surfaceLight,
  },
  dangerTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.error,
    marginBottom: SIZES.spacing.md,
  },
});
