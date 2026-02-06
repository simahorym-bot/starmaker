import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { GameState } from '@/types/game';

const { width } = Dimensions.get('window');

interface TrophyWallProps {
  gameState: GameState;
}

interface Record {
  type: 'gold' | 'platinum' | 'diamond';
  songTitle: string;
  sales: number;
  date: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  date?: string;
}

export const TrophyWall: React.FC<TrophyWallProps> = ({ gameState }) => {
  const t = useLocale();

  // Calculate records based on song sales/streams
  const getRecords = (): Record[] => {
    const records: Record[] = [];

    gameState.songs.forEach(song => {
      const sales = song.streams / 1000; // Approximate sales from streams

      if (sales >= 500000) {
        records.push({
          type: 'diamond',
          songTitle: song.title,
          sales,
          date: new Date(song.releaseDate).toLocaleDateString('fr-FR'),
        });
      } else if (sales >= 100000) {
        records.push({
          type: 'platinum',
          songTitle: song.title,
          sales,
          date: new Date(song.releaseDate).toLocaleDateString('fr-FR'),
        });
      } else if (sales >= 50000) {
        records.push({
          type: 'gold',
          songTitle: song.title,
          sales,
          date: new Date(song.releaseDate).toLocaleDateString('fr-FR'),
        });
      }
    });

    return records;
  };

  // Define achievements
  const achievements: Achievement[] = [
    {
      id: 'first-number-1',
      title: t.trophyWall.achievements.firstNumber1,
      description: 'Atteindre la première place des charts',
      icon: 'trophy',
      color: COLORS.gold24K,
      unlocked: gameState.songs.some(s => s.chartPosition === 1),
      date: gameState.songs.find(s => s.chartPosition === 1)?.releaseDate.toString(),
    },
    {
      id: 'world-tour',
      title: t.trophyWall.achievements.worldTour,
      description: 'Compléter une tournée mondiale',
      icon: 'earth',
      color: COLORS.neonCyan,
      unlocked: gameState.tours.some(t => t.status === 'completed' && t.venues.length >= 20),
    },
    {
      id: 'billion-streams',
      title: t.trophyWall.achievements.billionStreams,
      description: 'Atteindre 1 milliard de streams cumulés',
      icon: 'play-circle',
      color: COLORS.neonGreen,
      unlocked: gameState.songs.reduce((sum, s) => sum + s.streams, 0) >= 1000000000,
    },
    {
      id: 'sold-out-stadium',
      title: t.trophyWall.achievements.soldOutStadium,
      description: 'Faire sold-out dans un stade',
      icon: 'stadium',
      color: COLORS.neonPurple,
      unlocked: gameState.tours.some(t =>
        t.venues.some(v => v.type === 'stadium' && v.played)
      ),
    },
  ];

  // Awards from gameState
  const awards = gameState.awards || [];

  const records = getRecords();

  const getRecordColor = (type: string) => {
    switch (type) {
      case 'diamond':
        return COLORS.diamond;
      case 'platinum':
        return COLORS.platinum;
      case 'gold':
        return COLORS.gold24K;
      default:
        return COLORS.textSecondary;
    }
  };

  const getRecordGradient = (type: string) => {
    switch (type) {
      case 'diamond':
        return [COLORS.diamond + '40', COLORS.diamond + '10'];
      case 'platinum':
        return [COLORS.platinum + '40', COLORS.platinum + '10'];
      case 'gold':
        return [COLORS.gold24K + '40', COLORS.gold24K + '10'];
      default:
        return [COLORS.surface, COLORS.surfaceLight];
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <LinearGradient
          colors={[COLORS.gold24K + '30', COLORS.gold24K + '10']}
          style={styles.headerGradient}
        >
          <MaterialCommunityIcons name="trophy-variant" size={48} color={COLORS.gold24K} />
          <View style={styles.headerText}>
            <Text style={styles.title}>{t.trophyWall.title}</Text>
            <Text style={styles.subtitle}>{t.trophyWall.subtitle}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Certified Records */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="certificate" size={28} color={COLORS.gold24K} />
          <Text style={styles.sectionTitle}>{t.trophyWall.records.title}</Text>
        </View>

        <View style={styles.recordsGrid}>
          {records.length > 0 ? (
            records.map((record, index) => (
              <LinearGradient
                key={index}
                colors={getRecordGradient(record.type)}
                style={styles.recordCard}
              >
                <View style={[styles.discIcon, { borderColor: getRecordColor(record.type) }]}>
                  <Ionicons name="disc" size={40} color={getRecordColor(record.type)} />
                </View>
                <Text style={styles.recordType}>
                  {t.trophyWall.records[record.type]}
                </Text>
                <Text style={styles.recordSong}>{record.songTitle}</Text>
                <View style={styles.recordStats}>
                  <Text style={styles.recordSales}>
                    {record.sales.toLocaleString()} {t.trophyWall.records.sales}
                  </Text>
                  <Text style={styles.recordDate}>{record.date}</Text>
                </View>
              </LinearGradient>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <MaterialCommunityIcons name="certificate-outline" size={48} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>Aucun disque certifié pour le moment</Text>
              <Text style={styles.emptyHint}>Atteignez 50 000 ventes pour votre premier disque d'or</Text>
            </Card>
          )}
        </View>
      </View>

      {/* Awards & Trophies */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <FontAwesome5 name="trophy" size={24} color={COLORS.gold24K} />
          <Text style={styles.sectionTitle}>{t.trophyWall.awards.title}</Text>
        </View>

        <View style={styles.awardsGrid}>
          {[
            { key: 'labelOfYear', icon: 'office-building', color: COLORS.gold24K },
            { key: 'artistOfYear', icon: 'star', color: COLORS.goldShimmer },
            { key: 'albumOfYear', icon: 'album', color: COLORS.platinum },
            { key: 'bestProducer', icon: 'music-box', color: COLORS.electricBlue },
            { key: 'livingLegend', icon: 'crown', color: COLORS.ruby },
          ].map((award, index) => {
            const hasAward = awards.some(a => a.category === award.key && a.won);
            return (
              <Card
                key={index}
                style={[
                  styles.awardCard,
                  hasAward && styles.awardCardActive,
                  !hasAward && styles.awardCardLocked,
                ]}
              >
                <View style={[
                  styles.awardIconContainer,
                  { backgroundColor: hasAward ? award.color + '20' : COLORS.surfaceDark }
                ]}>
                  <MaterialCommunityIcons
                    name={award.icon as any}
                    size={32}
                    color={hasAward ? award.color : COLORS.textTertiary}
                  />
                </View>
                <Text style={[styles.awardName, !hasAward && styles.awardNameLocked]}>
                  {t.trophyWall.awards[award.key as keyof typeof t.trophyWall.awards]}
                </Text>
                {hasAward && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </View>

      {/* Career Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="medal" size={28} color={COLORS.electricBlue} />
          <Text style={styles.sectionTitle}>{t.trophyWall.achievements.title}</Text>
        </View>

        {achievements.map((achievement) => (
          <Card
            key={achievement.id}
            style={[
              styles.achievementCard,
              achievement.unlocked && styles.achievementCardUnlocked,
            ]}
          >
            <View style={[
              styles.achievementIcon,
              { backgroundColor: achievement.unlocked ? achievement.color + '20' : COLORS.surfaceDark }
            ]}>
              <MaterialCommunityIcons
                name={achievement.icon as any}
                size={32}
                color={achievement.unlocked ? achievement.color : COLORS.textTertiary}
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={[
                styles.achievementTitle,
                !achievement.unlocked && styles.achievementTitleLocked
              ]}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              {achievement.unlocked && achievement.date && (
                <Text style={styles.achievementDate}>
                  Débloqué le {new Date(parseInt(achievement.date)).toLocaleDateString('fr-FR')}
                </Text>
              )}
            </View>
            {achievement.unlocked && (
              <Ionicons name="checkmark-circle" size={28} color={COLORS.neonGreen} />
            )}
            {!achievement.unlocked && (
              <Ionicons name="lock-closed" size={24} color={COLORS.textTertiary} />
            )}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: SIZES.spacing.xl,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.radius.lg,
    ...SHADOWS.medium,
  },
  headerText: {
    marginLeft: SIZES.spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.gold24K,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: SIZES.spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacing.md,
  },
  recordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
  },
  recordCard: {
    width: (width - SIZES.spacing.lg * 3) / 2,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  discIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: SIZES.spacing.md,
  },
  recordType: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    marginBottom: SIZES.spacing.xs,
  },
  recordSong: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  recordStats: {
    alignItems: 'center',
  },
  recordSales: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  recordDate: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  emptyCard: {
    width: '100%',
    alignItems: 'center',
    padding: SIZES.spacing.xxxl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  emptyHint: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
  awardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
  },
  awardCard: {
    width: (width - SIZES.spacing.lg * 3 - SIZES.spacing.md) / 2,
    padding: SIZES.spacing.lg,
    alignItems: 'center',
  },
  awardCardActive: {
    borderColor: COLORS.gold24K,
    borderWidth: 1,
  },
  awardCardLocked: {
    opacity: 0.5,
  },
  awardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  awardName: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  awardNameLocked: {
    color: COLORS.textTertiary,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    opacity: 0.6,
  },
  achievementCardUnlocked: {
    opacity: 1,
    borderColor: COLORS.electricBlue,
    borderWidth: 1,
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: COLORS.textTertiary,
  },
  achievementDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  achievementDate: {
    fontSize: SIZES.xs,
    color: COLORS.electricBlue,
    fontWeight: '600',
  },
});
