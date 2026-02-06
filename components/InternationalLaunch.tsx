import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GameState } from '@/types/game';

interface InternationalLaunchProps {
  gameState: GameState;
  onLaunch: (market: string, cost: number) => void;
}

interface Market {
  id: string;
  name: string;
  flag: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'very-hard';
  potentialFans: number;
  launchCost: number;
  requirements: {
    minFans: number;
    minPrestige: number;
    minQuality?: number;
  };
  strategy: string;
  rewards: {
    fans: number;
    prestige: number;
    revenue: number;
  };
  launched: boolean;
}

export const InternationalLaunch: React.FC<InternationalLaunchProps> = ({
  gameState,
  onLaunch,
}) => {
  const t = useLocale();
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);

  const markets: Market[] = [
    {
      id: 'usa',
      name: t.internationalLaunch.markets.usa.name,
      flag: '🇺🇸',
      difficulty: 'very-hard',
      potentialFans: 500000,
      launchCost: 250000,
      requirements: {
        minFans: 100000,
        minPrestige: 80,
        minQuality: 9,
      },
      strategy: t.internationalLaunch.markets.usa.strategy,
      rewards: {
        fans: 500000,
        prestige: 30,
        revenue: 1000000,
      },
      launched: false,
    },
    {
      id: 'japan',
      name: t.internationalLaunch.markets.japan.name,
      flag: '🇯🇵',
      difficulty: 'hard',
      potentialFans: 300000,
      launchCost: 180000,
      requirements: {
        minFans: 80000,
        minPrestige: 70,
        minQuality: 8,
      },
      strategy: t.internationalLaunch.markets.japan.strategy,
      rewards: {
        fans: 300000,
        prestige: 25,
        revenue: 600000,
      },
      launched: false,
    },
    {
      id: 'brazil',
      name: t.internationalLaunch.markets.brazil.name,
      flag: '🇧🇷',
      difficulty: 'medium',
      potentialFans: 200000,
      launchCost: 100000,
      requirements: {
        minFans: 50000,
        minPrestige: 50,
      },
      strategy: t.internationalLaunch.markets.brazil.strategy,
      rewards: {
        fans: 200000,
        prestige: 15,
        revenue: 350000,
      },
      launched: false,
    },
    {
      id: 'uk',
      name: t.internationalLaunch.markets.uk.name,
      flag: '🇬🇧',
      difficulty: 'medium',
      potentialFans: 150000,
      launchCost: 120000,
      requirements: {
        minFans: 60000,
        minPrestige: 60,
      },
      strategy: t.internationalLaunch.markets.uk.strategy,
      rewards: {
        fans: 150000,
        prestige: 20,
        revenue: 400000,
      },
      launched: false,
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return COLORS.neonGreen;
      case 'medium':
        return COLORS.goldDark;
      case 'hard':
        return COLORS.neonPurple;
      case 'very-hard':
        return COLORS.ruby;
      default:
        return COLORS.textSecondary;
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'Facile';
      case 'medium':
        return 'Moyen';
      case 'hard':
        return 'Difficile';
      case 'very-hard':
        return 'Très Difficile';
      default:
        return difficulty;
    }
  };

  const meetsRequirements = (market: Market): boolean => {
    const { minFans, minPrestige, minQuality } = market.requirements;

    if (gameState.fanbase.total < minFans) return false;
    if (gameState.artist.prestige < minPrestige) return false;
    if (minQuality && (gameState.studio.soundFidelity || 0) < minQuality * 10) return false;

    return true;
  };

  const handleLaunch = (market: Market) => {
    if (!meetsRequirements(market)) {
      Alert.alert(
        'Prérequis non remplis',
        `Ce marché nécessite:\n- ${market.requirements.minFans.toLocaleString()} fans\n- ${market.requirements.minPrestige} de prestige${
          market.requirements.minQuality ? `\n- Qualité studio ${market.requirements.minQuality}/10` : ''
        }`
      );
      return;
    }

    if (gameState.artist.money < market.launchCost) {
      Alert.alert(
        t.messages.insufficientFunds,
        `Coût du lancement: ${market.launchCost.toLocaleString()}€`
      );
      return;
    }

    Alert.alert(
      'Confirmer le lancement',
      `Lancer votre carrière en ${market.name}?\n\nCoût: ${market.launchCost.toLocaleString()}€\nRécompenses potentielles:\n- ${market.rewards.fans.toLocaleString()} nouveaux fans\n- +${market.rewards.prestige} prestige\n- ${market.rewards.revenue.toLocaleString()}€ de revenus`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.internationalLaunch.launch,
          onPress: () => onLaunch(market.id, market.launchCost),
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.electricBlue + '30', COLORS.electricBlue + '10']}
        style={styles.header}
      >
        <MaterialCommunityIcons name="earth" size={48} color={COLORS.electricBlue} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.internationalLaunch.title}</Text>
          <Text style={styles.subtitle}>{t.internationalLaunch.subtitle}</Text>
        </View>
      </LinearGradient>

      {/* Global Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="account-group" size={24} color={COLORS.neonCyan} />
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Fans Internationaux</Text>
            <Text style={styles.statValue}>{gameState.fanbase.total.toLocaleString()}</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="crown" size={24} color={COLORS.gold24K} />
          <View style={styles.statInfo}>
            <Text style={styles.statLabel}>Prestige Global</Text>
            <Text style={styles.statValue}>{gameState.artist.prestige}</Text>
          </View>
        </View>
      </Card>

      {/* Markets Grid */}
      <View style={styles.marketsGrid}>
        {markets.map((market) => {
          const canLaunch = meetsRequirements(market);
          return (
            <TouchableOpacity
              key={market.id}
              style={styles.marketCard}
              onPress={() => setSelectedMarket(market)}
            >
              <LinearGradient
                colors={
                  canLaunch
                    ? [getDifficultyColor(market.difficulty) + '30', getDifficultyColor(market.difficulty) + '10']
                    : [COLORS.surfaceDark, COLORS.surface]
                }
                style={styles.marketGradient}
              >
                {/* Flag & Name */}
                <View style={styles.marketHeader}>
                  <Text style={styles.marketFlag}>{market.flag}</Text>
                  <View style={styles.marketTitleContainer}>
                    <Text style={styles.marketName}>{market.name}</Text>
                    <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(market.difficulty) + '30' }]}>
                      <Text style={[styles.difficultyText, { color: getDifficultyColor(market.difficulty) }]}>
                        {getDifficultyLabel(market.difficulty)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Stats */}
                <View style={styles.marketStats}>
                  <View style={styles.marketStat}>
                    <MaterialCommunityIcons name="account-plus" size={16} color={COLORS.neonCyan} />
                    <Text style={styles.marketStatText}>{(market.potentialFans / 1000).toFixed(0)}K</Text>
                  </View>
                  <View style={styles.marketStat}>
                    <MaterialCommunityIcons name="cash" size={16} color={COLORS.gold24K} />
                    <Text style={styles.marketStatText}>{(market.launchCost / 1000).toFixed(0)}K€</Text>
                  </View>
                </View>

                {/* Status */}
                {!canLaunch && (
                  <View style={styles.lockedBadge}>
                    <MaterialCommunityIcons name="lock" size={16} color={COLORS.textTertiary} />
                    <Text style={styles.lockedText}>Verrouillé</Text>
                  </View>
                )}

                {canLaunch && (
                  <Button
                    title={t.internationalLaunch.launch}
                    onPress={() => handleLaunch(market)}
                    variant="electric"
                    size="sm"
                    style={styles.launchButton}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected Market Details */}
      {selectedMarket && (
        <Card style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsFlag}>{selectedMarket.flag}</Text>
            <Text style={styles.detailsName}>{selectedMarket.name}</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsLabel}>Stratégie:</Text>
            <Text style={styles.detailsText}>{selectedMarket.strategy}</Text>
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsLabel}>Prérequis:</Text>
            <Text style={styles.detailsText}>
              • {selectedMarket.requirements.minFans.toLocaleString()} fans minimum
            </Text>
            <Text style={styles.detailsText}>
              • {selectedMarket.requirements.minPrestige} de prestige
            </Text>
            {selectedMarket.requirements.minQuality && (
              <Text style={styles.detailsText}>
                • Qualité studio {selectedMarket.requirements.minQuality}/10
              </Text>
            )}
          </View>

          <View style={styles.detailsSection}>
            <Text style={styles.detailsLabel}>Récompenses:</Text>
            <Text style={styles.detailsText}>
              • {selectedMarket.rewards.fans.toLocaleString()} nouveaux fans
            </Text>
            <Text style={styles.detailsText}>• +{selectedMarket.rewards.prestige} prestige</Text>
            <Text style={styles.detailsText}>
              • {selectedMarket.rewards.revenue.toLocaleString()}€ de revenus
            </Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.xl,
  },
  headerText: {
    marginLeft: SIZES.spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.electricBlue,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statInfo: {
    marginLeft: SIZES.spacing.md,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  marketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.xl,
  },
  marketCard: {
    width: '48%',
    borderRadius: SIZES.radius.lg,
    overflow: 'hidden',
  },
  marketGradient: {
    padding: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.lg,
  },
  marketHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  marketFlag: {
    fontSize: 32,
    marginRight: SIZES.spacing.sm,
  },
  marketTitleContainer: {
    flex: 1,
  },
  marketName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: SIZES.spacing.xs,
    borderRadius: SIZES.radius.sm,
  },
  difficultyText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  marketStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  marketStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  marketStatText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.sm,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: SIZES.radius.md,
  },
  lockedText: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
    fontWeight: '600',
  },
  launchButton: {
    marginTop: SIZES.spacing.sm,
  },
  detailsCard: {
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  detailsFlag: {
    fontSize: 48,
    marginRight: SIZES.spacing.md,
  },
  detailsName: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailsSection: {
    marginBottom: SIZES.spacing.lg,
  },
  detailsLabel: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.gold24K,
    marginBottom: SIZES.spacing.sm,
  },
  detailsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
});
