import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/hooks/useLocale';

const screenWidth = Dimensions.get('window').width;

export default function FanbaseScreen() {
  const t = useLocale();
  const { gameState, updateGameState } = useGame();
  const [selectedTab, setSelectedTab] = useState<'analysis' | 'typology' | 'fanclub'>('analysis');

  if (!gameState) return null;

  const { artist, fanbase } = gameState;

  // Fan Typology Data
  const typologyData = [
    {
      name: t.fanbase.typology.hardcore,
      population: fanbase.hardcore || 35,
      color: COLORS.neonPurple,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
    {
      name: t.fanbase.typology.casual,
      population: fanbase.casual || 50,
      color: COLORS.neonGreen,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
    {
      name: t.fanbase.typology.haters,
      population: fanbase.haters || 15,
      color: COLORS.neonPink,
      legendFontColor: COLORS.textPrimary,
      legendFontSize: 12,
    },
  ];

  // Top Cities (generated based on demographics)
  const topCities = [
    { city: 'Paris', country: 'France', fans: Math.floor((fanbase.total * 0.20)) },
    { city: 'Tokyo', country: 'Japon', fans: Math.floor((fanbase.total * 0.15)) },
    { city: 'New York', country: 'USA', fans: Math.floor((fanbase.total * 0.18)) },
    { city: 'Londres', country: 'UK', fans: Math.floor((fanbase.total * 0.12)) },
    { city: 'Berlin', country: 'Allemagne', fans: Math.floor((fanbase.total * 0.10)) },
  ];

  const handleUpgradeFanClub = async (tier: number, cost: number) => {
    if (artist.money < cost) {
      Alert.alert(t.messages.insufficientFunds, `Coût: ${cost.toLocaleString()}€`);
      return;
    }

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - cost,
        prestige: artist.prestige + tier * 5,
      },
    });

    Alert.alert(t.common.success, `Fan Club niveau ${tier} activé !`);
  };

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surfaceLight,
    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.fanbase.title}</Text>
            <Text style={styles.subtitle}>
              {fanbase.total.toLocaleString()} fans dans le monde
            </Text>
          </View>
          <View style={styles.engagementBadge}>
            <MaterialCommunityIcons name="heart" size={20} color={COLORS.neonPink} />
            <Text style={styles.engagementText}>{fanbase.engagement || 75}% engagement</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'analysis' && styles.tabActive]}
            onPress={() => setSelectedTab('analysis')}
          >
            <MaterialCommunityIcons
              name="map-marker-radius"
              size={20}
              color={selectedTab === 'analysis' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'analysis' && styles.tabTextActive,
              ]}
            >
              {t.fanbase.analysis.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'typology' && styles.tabActive]}
            onPress={() => setSelectedTab('typology')}
          >
            <MaterialCommunityIcons
              name="chart-pie"
              size={20}
              color={selectedTab === 'typology' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'typology' && styles.tabTextActive,
              ]}
            >
              {t.fanbase.typology.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'fanclub' && styles.tabActive]}
            onPress={() => setSelectedTab('fanclub')}
          >
            <MaterialCommunityIcons
              name="crown"
              size={20}
              color={selectedTab === 'fanclub' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'fanclub' && styles.tabTextActive,
              ]}
            >
              Fan Club
            </Text>
          </TouchableOpacity>
        </View>

        {/* Analysis Tab */}
        {selectedTab === 'analysis' && (
          <View>
            <Text style={styles.sectionTitle}>{t.fanbase.analysis.title}</Text>

            {/* Global Reach Card */}
            <Card style={styles.analysisCard}>
              <Text style={styles.cardTitle}>{t.fanbase.analysis.global}</Text>

              {/* Heat Map Representation */}
              <View style={styles.heatmapContainer}>
                <Text style={styles.heatmapLabel}>{t.fanbase.analysis.heatmap}</Text>
                <View style={styles.heatmapGrid}>
                  {Object.entries(fanbase.demographics?.regions || {
                    'France': 30,
                    'USA': 25,
                    'UK': 20,
                    'Japan': 15,
                    'Germany': 10,
                  }).map(([region, percentage]) => (
                    <View key={region} style={styles.heatmapRow}>
                      <View style={styles.heatmapRegion}>
                        <Text style={styles.regionName}>{region}</Text>
                      </View>
                      <View style={styles.heatmapBarContainer}>
                        <View
                          style={[
                            styles.heatmapBar,
                            {
                              width: `${percentage}%`,
                              backgroundColor:
                                percentage > 25
                                  ? COLORS.neonPink
                                  : percentage > 15
                                  ? COLORS.neonCyan
                                  : COLORS.neonGreen,
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.heatmapValue}>{percentage}%</Text>
                    </View>
                  ))}
                </View>
              </View>
            </Card>

            {/* Top Cities */}
            <Text style={styles.subsectionTitle}>{t.fanbase.analysis.topCities}</Text>
            {topCities.map((city, index) => (
              <Card key={city.city} style={styles.cityCard}>
                <View style={styles.cityHeader}>
                  <View style={styles.cityRank}>
                    <Text style={styles.cityRankText}>{index + 1}</Text>
                  </View>
                  <View style={styles.cityInfo}>
                    <Text style={styles.cityName}>{city.city}</Text>
                    <Text style={styles.cityCountry}>{city.country}</Text>
                  </View>
                  <View style={styles.cityFans}>
                    <Ionicons name="people" size={20} color={COLORS.neonPurple} />
                    <Text style={styles.cityFansText}>{city.fans.toLocaleString()}</Text>
                  </View>
                </View>
              </Card>
            ))}

            {/* Age Demographics */}
            <Text style={styles.subsectionTitle}>Démographie par Âge</Text>
            <Card style={styles.demographicsCard}>
              {Object.entries(fanbase.demographics?.ageGroups || {
                '13-17': 15,
                '18-24': 40,
                '25-34': 30,
                '35-44': 10,
                '45+': 5,
              }).map(([ageGroup, percentage]) => (
                <View key={ageGroup} style={styles.demographicRow}>
                  <Text style={styles.demographicLabel}>{ageGroup} ans</Text>
                  <View style={styles.demographicBarContainer}>
                    <View
                      style={[
                        styles.demographicBar,
                        { width: `${percentage}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.demographicValue}>{percentage}%</Text>
                </View>
              ))}
            </Card>
          </View>
        )}

        {/* Typology Tab */}
        {selectedTab === 'typology' && (
          <View>
            <Text style={styles.sectionTitle}>{t.fanbase.typology.title}</Text>

            {/* Pie Chart */}
            <Card style={styles.chartCard}>
              <PieChart
                data={typologyData}
                width={screenWidth - SIZES.spacing.lg * 4}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card>

            {/* Fan Type Details */}
            <Text style={styles.subsectionTitle}>Détails des Segments</Text>

            <Card style={styles.fanTypeCard}>
              <View style={styles.fanTypeHeader}>
                <View style={[styles.fanTypeIndicator, { backgroundColor: COLORS.neonPurple }]} />
                <View style={styles.fanTypeInfo}>
                  <Text style={styles.fanTypeName}>{t.fanbase.typology.hardcore}</Text>
                  <Text style={styles.fanTypeDescription}>
                    Fans dévoués qui assistent à tous les concerts et achètent tous les produits
                  </Text>
                  <View style={styles.fanTypeStats}>
                    <View style={styles.fanTypeStat}>
                      <Text style={styles.fanTypeStatValue}>{fanbase.hardcore || 35}%</Text>
                      <Text style={styles.fanTypeStatLabel}>de votre base</Text>
                    </View>
                    <View style={styles.fanTypeStat}>
                      <Text style={styles.fanTypeStatValue}>95%</Text>
                      <Text style={styles.fanTypeStatLabel}>engagement</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>

            <Card style={styles.fanTypeCard}>
              <View style={styles.fanTypeHeader}>
                <View style={[styles.fanTypeIndicator, { backgroundColor: COLORS.neonGreen }]} />
                <View style={styles.fanTypeInfo}>
                  <Text style={styles.fanTypeName}>{t.fanbase.typology.casual}</Text>
                  <Text style={styles.fanTypeDescription}>
                    Fans occasionnels qui écoutent votre musique régulièrement
                  </Text>
                  <View style={styles.fanTypeStats}>
                    <View style={styles.fanTypeStat}>
                      <Text style={styles.fanTypeStatValue}>{fanbase.casual || 50}%</Text>
                      <Text style={styles.fanTypeStatLabel}>de votre base</Text>
                    </View>
                    <View style={styles.fanTypeStat}>
                      <Text style={styles.fanTypeStatValue}>60%</Text>
                      <Text style={styles.fanTypeStatLabel}>engagement</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>

            <Card style={styles.fanTypeCard}>
              <View style={styles.fanTypeHeader}>
                <View style={[styles.fanTypeIndicator, { backgroundColor: COLORS.neonPink }]} />
                <View style={styles.fanTypeInfo}>
                  <Text style={styles.fanTypeName}>{t.fanbase.typology.haters}</Text>
                  <Text style={styles.fanTypeDescription}>
                    Détracteurs qui peuvent être convertis avec de bonnes stratégies
                  </Text>
                  <View style={styles.fanTypeStats}>
                    <View style={styles.fanTypeStat}>
                      <Text style={styles.fanTypeStatValue}>{fanbase.haters || 15}%</Text>
                      <Text style={styles.fanTypeStatLabel}>de votre base</Text>
                    </View>
                    <View style={styles.fanTypeStat}>
                      <Text style={styles.fanTypeStatValue}>-20%</Text>
                      <Text style={styles.fanTypeStatLabel}>sentiment</Text>
                    </View>
                  </View>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Fan Club Tab */}
        {selectedTab === 'fanclub' && (
          <View>
            <Text style={styles.sectionTitle}>{t.fanbase.fanClub.title}</Text>

            {/* Premium Benefits Overview */}
            <Card style={styles.premiumCard}>
              <Text style={styles.premiumTitle}>{t.fanbase.fanClub.premium}</Text>
              <Text style={styles.premiumDesc}>
                Offrez des abonnements premium à vos fans pour des revenus récurrents
              </Text>
              <View style={styles.premiumStats}>
                <View style={styles.premiumStat}>
                  <MaterialCommunityIcons name="crown" size={24} color={COLORS.gold} />
                  <Text style={styles.premiumStatValue}>
                    {Math.floor(fanbase.total * 0.05).toLocaleString()}
                  </Text>
                  <Text style={styles.premiumStatLabel}>Abonnés Potentiels</Text>
                </View>
                <View style={styles.premiumStat}>
                  <MaterialCommunityIcons name="cash" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.premiumStatValue}>
                    {Math.floor(fanbase.total * 0.05 * 15).toLocaleString()}€
                  </Text>
                  <Text style={styles.premiumStatLabel}>Revenus Mensuels</Text>
                </View>
              </View>
            </Card>

            {/* Fan Club Tiers */}
            <Text style={styles.subsectionTitle}>Niveaux d'Abonnement</Text>

            {/* Tier 3 */}
            <Card style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <View style={styles.tierBadge}>
                  <MaterialCommunityIcons name="star" size={24} color={COLORS.gold} />
                  <Text style={styles.tierNumber}>3</Text>
                </View>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{t.fanbase.fanClub.tiers.tier3}</Text>
                  <Text style={styles.tierPrice}>9.99€/mois</Text>
                </View>
              </View>
              <View style={styles.tierBenefits}>
                <Text style={styles.tierBenefitsTitle}>{t.fanbase.fanClub.benefits}:</Text>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Accès anticipé aux nouveaux morceaux</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Réduction 10% sur le merch</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Badge exclusif sur les réseaux</Text>
                </View>
              </View>
              <Button
                title="Activer - 5 000€"
                onPress={() => handleUpgradeFanClub(3, 5000)}
                variant="gold"
                size="sm"
              />
            </Card>

            {/* Tier 15 */}
            <Card style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <View style={styles.tierBadge}>
                  <MaterialCommunityIcons name="star-circle" size={24} color={COLORS.neonPurple} />
                  <Text style={styles.tierNumber}>15</Text>
                </View>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{t.fanbase.fanClub.tiers.tier15}</Text>
                  <Text style={styles.tierPrice}>19.99€/mois</Text>
                </View>
              </View>
              <View style={styles.tierBenefits}>
                <Text style={styles.tierBenefitsTitle}>{t.fanbase.fanClub.benefits}:</Text>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Tous les avantages Niveau 3</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Sessions Q&A mensuelles</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Merch exclusif limité</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Pré-vente billets concerts</Text>
                </View>
              </View>
              <Button
                title="Activer - 15 000€"
                onPress={() => handleUpgradeFanClub(15, 15000)}
                variant="neon"
                size="sm"
              />
            </Card>

            {/* Tier 25 */}
            <Card style={styles.tierCard}>
              <View style={styles.tierHeader}>
                <View style={styles.tierBadge}>
                  <MaterialCommunityIcons name="diamond" size={24} color={COLORS.gold} />
                  <Text style={styles.tierNumber}>25</Text>
                </View>
                <View style={styles.tierInfo}>
                  <Text style={styles.tierName}>{t.fanbase.fanClub.tiers.tier25}</Text>
                  <Text style={styles.tierPrice}>49.99€/mois</Text>
                </View>
              </View>
              <View style={styles.tierBenefits}>
                <Text style={styles.tierBenefitsTitle}>{t.fanbase.fanClub.benefits}:</Text>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Tous les avantages Niveau 15</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Meet & Greet backstage</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Ligne directe de contact</Text>
                </View>
                <View style={styles.benefit}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.benefitText}>Participation studio d'enregistrement</Text>
                </View>
              </View>
              <Button
                title="Activer - 30 000€"
                onPress={() => handleUpgradeFanClub(25, 30000)}
                variant="gold"
                size="sm"
              />
            </Card>
          </View>
        )}
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
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.xl,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.neonPink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  engagementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.xs,
  },
  engagementText: {
    color: COLORS.neonPink,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  tabs: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xl,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
  tabActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.gold,
    borderWidth: 1,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.xs,
    marginTop: 4,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  subsectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  analysisCard: {
    marginBottom: SIZES.spacing.lg,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  heatmapContainer: {
    marginTop: SIZES.spacing.md,
  },
  heatmapLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  heatmapGrid: {
    gap: SIZES.spacing.sm,
  },
  heatmapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  heatmapRegion: {
    width: 80,
  },
  regionName: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  heatmapBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.sm,
    overflow: 'hidden',
  },
  heatmapBar: {
    height: '100%',
    borderRadius: SIZES.radius.sm,
  },
  heatmapValue: {
    width: 40,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },
  cityCard: {
    marginBottom: SIZES.spacing.sm,
  },
  cityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  cityRankText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: '#000',
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cityCountry: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  cityFans: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cityFansText: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.neonPurple,
  },
  demographicsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  demographicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  demographicLabel: {
    width: 80,
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  demographicBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.sm,
    overflow: 'hidden',
  },
  demographicBar: {
    height: '100%',
    backgroundColor: COLORS.neonPurple,
    borderRadius: SIZES.radius.sm,
  },
  demographicValue: {
    width: 40,
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    fontWeight: '600',
  },
  chartCard: {
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  fanTypeCard: {
    marginBottom: SIZES.spacing.md,
  },
  fanTypeHeader: {
    flexDirection: 'row',
  },
  fanTypeIndicator: {
    width: 8,
    borderRadius: 4,
    marginRight: SIZES.spacing.md,
  },
  fanTypeInfo: {
    flex: 1,
  },
  fanTypeName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  fanTypeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.md,
    lineHeight: 18,
  },
  fanTypeStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.xl,
  },
  fanTypeStat: {
    alignItems: 'center',
  },
  fanTypeStatValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  fanTypeStatLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  premiumCard: {
    marginBottom: SIZES.spacing.lg,
  },
  premiumTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SIZES.spacing.xs,
  },
  premiumDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.lg,
    lineHeight: 18,
  },
  premiumStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  premiumStat: {
    alignItems: 'center',
  },
  premiumStatValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.xs,
  },
  premiumStatLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tierCard: {
    marginBottom: SIZES.spacing.md,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  tierBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
    position: 'relative',
  },
  tierNumber: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tierPrice: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
  tierBenefits: {
    marginBottom: SIZES.spacing.md,
  },
  tierBenefitsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  benefitText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});
