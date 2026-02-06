import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/hooks/useLocale';
import { LuxuryItem, BusinessInvestment, BrandDeal } from '@/types/game';

export default function LifestyleScreen() {
  const t = useLocale();
  const { gameState, updateGameState } = useGame();
  const [selectedTab, setSelectedTab] = useState<'garage' | 'real-estate' | 'investments' | 'brands'>('garage');

  if (!gameState) return null;

  const { artist, luxuryItems = [], businessInvestments = [], brandDeals = [] } = gameState;

  const garageItems = [
    {
      id: 'lamborghini',
      name: 'Lamborghini Aventador',
      category: 'car' as const,
      cost: 500000,
      prestige: 50,
      image: '🏎️',
    },
    {
      id: 'ferrari',
      name: 'Ferrari SF90',
      category: 'car' as const,
      cost: 600000,
      prestige: 55,
      image: '🏎️',
    },
    {
      id: 'jet',
      name: 'Jet Privé Gulfstream',
      category: 'jet' as const,
      cost: 5000000,
      prestige: 200,
      image: '✈️',
    },
    {
      id: 'yacht',
      name: 'Yacht de Luxe',
      category: 'yacht' as const,
      cost: 10000000,
      prestige: 300,
      image: '🛥️',
    },
  ];

  const realEstateItems = [
    {
      id: 'villa-cannes',
      name: 'Villa à Cannes',
      category: 'villa' as const,
      cost: 8000000,
      prestige: 150,
      canHostParty: true,
      image: '🏛️',
    },
    {
      id: 'penthouse-paris',
      name: 'Penthouse Paris',
      category: 'penthouse' as const,
      cost: 12000000,
      prestige: 200,
      canHostParty: true,
      image: '🏙️',
    },
    {
      id: 'mansion-la',
      name: 'Manoir Beverly Hills',
      category: 'mansion' as const,
      cost: 25000000,
      prestige: 400,
      canHostParty: true,
      image: '🏰',
    },
  ];

  const investmentOptions = [
    {
      type: 'stocks' as const,
      name: 'Actions Tech',
      minInvestment: 100000,
      expectedReturn: 0.15,
      icon: 'chart-line',
    },
    {
      type: 'real-estate' as const,
      name: 'Immobilier Commercial',
      minInvestment: 500000,
      expectedReturn: 0.08,
      icon: 'office-building',
    },
    {
      type: 'crypto' as const,
      name: 'Crypto Monnaies',
      minInvestment: 50000,
      expectedReturn: 0.25,
      icon: 'currency-btc',
    },
    {
      type: 'business' as const,
      name: 'Startup Tech',
      minInvestment: 250000,
      expectedReturn: 0.30,
      icon: 'rocket-launch',
    },
  ];

  const brandDealOptions = [
    {
      brand: 'Rolex',
      type: 'watches' as const,
      value: 2000000,
      duration: 12,
      prestige: 100,
      icon: 'watch',
    },
    {
      brand: 'Dior',
      type: 'cosmetics' as const,
      value: 1500000,
      duration: 24,
      prestige: 80,
      icon: 'brush',
    },
    {
      brand: 'Louis Vuitton',
      type: 'fashion' as const,
      value: 3000000,
      duration: 36,
      prestige: 150,
      icon: 'hanger',
    },
    {
      brand: 'Apple',
      type: 'tech' as const,
      value: 5000000,
      duration: 12,
      prestige: 120,
      icon: 'cellphone',
    },
  ];

  const calculateTotalPrestige = () => {
    const luxuryPrestige = luxuryItems
      .filter(item => item.owned)
      .reduce((sum, item) => sum + item.prestige, 0);
    const brandPrestige = brandDeals
      .filter(deal => deal.active)
      .reduce((sum, deal) => sum + deal.prestige, 0);
    return luxuryPrestige + brandPrestige;
  };

  const handlePurchaseLuxury = async (item: any) => {
    if (artist.money < item.cost) {
      Alert.alert(t.messages.insufficientFunds, `Coût: ${item.cost.toLocaleString()}€`);
      return;
    }

    const owned = luxuryItems.find(l => l.id === item.id);
    if (owned?.owned) {
      Alert.alert('Déjà possédé', 'Vous possédez déjà cet article');
      return;
    }

    const newItem: LuxuryItem = {
      id: item.id,
      name: item.name,
      category: item.category,
      prestige: item.prestige,
      cost: item.cost,
      owned: true,
      canHostParty: item.canHostParty,
    };

    const updatedItems = owned
      ? luxuryItems.map(l => (l.id === item.id ? { ...l, owned: true } : l))
      : [...luxuryItems, newItem];

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - item.cost,
        prestige: artist.prestige + item.prestige,
      },
      luxuryItems: updatedItems,
    });

    Alert.alert(t.common.success, `${item.name} acheté !`);
  };

  const handleInvest = async (investment: any) => {
    Alert.alert(
      'Investissement',
      `Investir dans ${investment.name}?`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.confirm,
          onPress: async () => {
            if (artist.money < investment.minInvestment) {
              Alert.alert(
                t.messages.insufficientFunds,
                `Investissement minimum: ${investment.minInvestment.toLocaleString()}€`
              );
              return;
            }

            const newInvestment: BusinessInvestment = {
              id: Date.now().toString(),
              name: investment.name,
              type: investment.type,
              invested: investment.minInvestment,
              currentValue: investment.minInvestment,
              returns: 0,
            };

            await updateGameState({
              ...gameState,
              artist: {
                ...artist,
                money: artist.money - investment.minInvestment,
              },
              businessInvestments: [...businessInvestments, newInvestment],
            });

            Alert.alert(t.common.success, `Investissement effectué !`);
          },
        },
      ]
    );
  };

  const handleSignBrandDeal = async (deal: any) => {
    if (artist.prestige < 50) {
      Alert.alert('Prestige Insuffisant', 'Vous avez besoin de plus de prestige');
      return;
    }

    const existing = brandDeals.find(d => d.brand === deal.brand && d.active);
    if (existing) {
      Alert.alert('Contrat Actif', 'Vous avez déjà un contrat avec cette marque');
      return;
    }

    const newDeal: BrandDeal = {
      id: Date.now().toString(),
      brand: deal.brand,
      type: deal.type,
      value: deal.value,
      duration: deal.duration,
      prestige: deal.prestige,
      active: true,
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money + deal.value,
        prestige: artist.prestige + deal.prestige,
      },
      brandDeals: [...brandDeals, newDeal],
    });

    Alert.alert(t.notifications.contractSigned, `Ambassadeur ${deal.brand} !`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.gold, COLORS.goldDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>{t.lifestyle.title}</Text>
            <Text style={styles.subtitle}>Vivez la grande vie</Text>
          </View>
          <View style={styles.prestigeBadge}>
            <MaterialCommunityIcons name="crown" size={24} color={COLORS.gold} />
            <View>
              <Text style={styles.prestigeLabel}>{t.label.prestige}</Text>
              <Text style={styles.prestigeValue}>{calculateTotalPrestige()}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'garage' && styles.tabActive]}
            onPress={() => setSelectedTab('garage')}
          >
            <MaterialCommunityIcons
              name="car-sports"
              size={20}
              color={selectedTab === 'garage' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'garage' && styles.tabTextActive,
              ]}
            >
              {t.lifestyle.garage.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'real-estate' && styles.tabActive]}
            onPress={() => setSelectedTab('real-estate')}
          >
            <MaterialCommunityIcons
              name="home-city"
              size={20}
              color={selectedTab === 'real-estate' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'real-estate' && styles.tabTextActive,
              ]}
            >
              Immobilier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'investments' && styles.tabActive]}
            onPress={() => setSelectedTab('investments')}
          >
            <MaterialCommunityIcons
              name="chart-line"
              size={20}
              color={selectedTab === 'investments' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'investments' && styles.tabTextActive,
              ]}
            >
              Investissements
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'brands' && styles.tabActive]}
            onPress={() => setSelectedTab('brands')}
          >
            <MaterialCommunityIcons
              name="shopping"
              size={20}
              color={selectedTab === 'brands' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'brands' && styles.tabTextActive,
              ]}
            >
              Marques
            </Text>
          </TouchableOpacity>
        </View>

        {/* Garage Tab */}
        {selectedTab === 'garage' && (
          <View>
            <Text style={styles.sectionTitle}>{t.lifestyle.garage.title}</Text>
            {garageItems.map((item) => {
              const owned = luxuryItems.find(l => l.id === item.id)?.owned;
              return (
                <Card key={item.id} style={styles.luxuryCard}>
                  <View style={styles.luxuryHeader}>
                    <Text style={styles.luxuryIcon}>{item.image}</Text>
                    <View style={styles.luxuryInfo}>
                      <Text style={styles.luxuryName}>{item.name}</Text>
                      <View style={styles.luxuryStats}>
                        <View style={styles.luxuryStat}>
                          <MaterialCommunityIcons name="crown" size={16} color={COLORS.gold} />
                          <Text style={styles.luxuryStatText}>+{item.prestige}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {owned ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Possédé</Text>
                    </View>
                  ) : (
                    <Button
                      title={`Acheter - ${item.cost.toLocaleString()}€`}
                      onPress={() => handlePurchaseLuxury(item)}
                      variant="gold"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Real Estate Tab */}
        {selectedTab === 'real-estate' && (
          <View>
            <Text style={styles.sectionTitle}>{t.lifestyle.realEstate.title}</Text>
            {realEstateItems.map((item) => {
              const owned = luxuryItems.find(l => l.id === item.id)?.owned;
              return (
                <Card key={item.id} style={styles.luxuryCard}>
                  <View style={styles.luxuryHeader}>
                    <Text style={styles.luxuryIcon}>{item.image}</Text>
                    <View style={styles.luxuryInfo}>
                      <Text style={styles.luxuryName}>{item.name}</Text>
                      <View style={styles.luxuryStats}>
                        <View style={styles.luxuryStat}>
                          <MaterialCommunityIcons name="crown" size={16} color={COLORS.gold} />
                          <Text style={styles.luxuryStatText}>+{item.prestige}</Text>
                        </View>
                        {item.canHostParty && (
                          <View style={styles.featureBadge}>
                            <MaterialCommunityIcons
                              name="party-popper"
                              size={14}
                              color={COLORS.neonPink}
                            />
                            <Text style={styles.featureText}>Fêtes</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  {owned ? (
                    <View style={{ flexDirection: 'row', gap: SIZES.spacing.sm }}>
                      <View style={[styles.ownedBadge, { flex: 1 }]}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                        <Text style={styles.ownedText}>Possédé</Text>
                      </View>
                      {item.canHostParty && (
                        <Button
                          title="Organiser Fête"
                          onPress={() => Alert.alert('Fête', 'Fête organisée !')}
                          variant="neon"
                          size="sm"
                          style={{ flex: 1 }}
                        />
                      )}
                    </View>
                  ) : (
                    <Button
                      title={`Acheter - ${item.cost.toLocaleString()}€`}
                      onPress={() => handlePurchaseLuxury(item)}
                      variant="gold"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Investments Tab */}
        {selectedTab === 'investments' && (
          <View>
            <Text style={styles.sectionTitle}>{t.lifestyle.investments.title}</Text>

            {/* Portfolio Overview */}
            {businessInvestments.length > 0 && (
              <Card style={styles.portfolioCard}>
                <Text style={styles.portfolioTitle}>{t.lifestyle.investments.portfolio}</Text>
                <View style={styles.portfolioStats}>
                  <View style={styles.portfolioStat}>
                    <Text style={styles.portfolioLabel}>Investi Total</Text>
                    <Text style={styles.portfolioValue}>
                      {businessInvestments
                        .reduce((sum, inv) => sum + inv.invested, 0)
                        .toLocaleString()}€
                    </Text>
                  </View>
                  <View style={styles.portfolioStat}>
                    <Text style={styles.portfolioLabel}>Valeur Actuelle</Text>
                    <Text style={[styles.portfolioValue, { color: COLORS.neonGreen }]}>
                      {businessInvestments
                        .reduce((sum, inv) => sum + inv.currentValue, 0)
                        .toLocaleString()}€
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Investment Options */}
            {investmentOptions.map((investment, index) => (
              <Card key={index} style={styles.investmentCard}>
                <View style={styles.investmentHeader}>
                  <MaterialCommunityIcons
                    name={investment.icon as any}
                    size={40}
                    color={COLORS.neonPurple}
                  />
                  <View style={styles.investmentInfo}>
                    <Text style={styles.investmentName}>{investment.name}</Text>
                    <View style={styles.investmentStats}>
                      <View style={styles.investmentStat}>
                        <Text style={styles.investmentLabel}>Rendement:</Text>
                        <Text style={[styles.investmentValue, { color: COLORS.neonGreen }]}>
                          +{(investment.expectedReturn * 100).toFixed(0)}%
                        </Text>
                      </View>
                      <View style={styles.investmentStat}>
                        <Text style={styles.investmentLabel}>Minimum:</Text>
                        <Text style={styles.investmentValue}>
                          {investment.minInvestment.toLocaleString()}€
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Button
                  title="Investir"
                  onPress={() => handleInvest(investment)}
                  variant="neon"
                  size="sm"
                />
              </Card>
            ))}
          </View>
        )}

        {/* Brand Deals Tab */}
        {selectedTab === 'brands' && (
          <View>
            <Text style={styles.sectionTitle}>{t.lifestyle.brandDeals.title}</Text>

            {/* Active Deals */}
            {brandDeals.filter(d => d.active).length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Contrats Actifs</Text>
                {brandDeals
                  .filter(d => d.active)
                  .map((deal) => (
                    <Card key={deal.id} style={styles.brandCard}>
                      <View style={styles.brandHeader}>
                        <MaterialCommunityIcons
                          name="star-circle"
                          size={40}
                          color={COLORS.gold}
                        />
                        <View style={styles.brandInfo}>
                          <Text style={styles.brandName}>{deal.brand}</Text>
                          <Text style={styles.brandType}>{t.lifestyle.brandDeals.ambassador}</Text>
                          <View style={styles.brandStats}>
                            <Text style={styles.brandStat}>
                              {deal.value.toLocaleString()}€
                            </Text>
                            <Text style={styles.brandStat}>{deal.duration} mois</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.ownedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                        <Text style={styles.ownedText}>Actif</Text>
                      </View>
                    </Card>
                  ))}
              </>
            )}

            {/* Available Deals */}
            <Text style={styles.subsectionTitle}>Opportunités</Text>
            {brandDealOptions.map((deal, index) => {
              const hasDeal = brandDeals.find(d => d.brand === deal.brand && d.active);
              return (
                <Card key={index} style={styles.brandCard}>
                  <View style={styles.brandHeader}>
                    <MaterialCommunityIcons
                      name={deal.icon as any}
                      size={40}
                      color={hasDeal ? COLORS.neonGreen : COLORS.gold}
                    />
                    <View style={styles.brandInfo}>
                      <Text style={styles.brandName}>{deal.brand}</Text>
                      <Text style={styles.brandType}>Ambassadeur {deal.type}</Text>
                      <View style={styles.brandStats}>
                        <View style={styles.brandStat}>
                          <MaterialCommunityIcons name="cash" size={16} color={COLORS.neonGreen} />
                          <Text style={styles.brandStatText}>
                            {deal.value.toLocaleString()}€
                          </Text>
                        </View>
                        <View style={styles.brandStat}>
                          <MaterialCommunityIcons name="crown" size={16} color={COLORS.gold} />
                          <Text style={styles.brandStatText}>+{deal.prestige}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {hasDeal ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Signé</Text>
                    </View>
                  ) : (
                    <Button
                      title="Devenir Ambassadeur"
                      onPress={() => handleSignBrandDeal(deal)}
                      variant="gold"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
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
    paddingBottom: SIZES.spacing.xl,
  },
  header: {
    padding: SIZES.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: '#000',
    opacity: 0.7,
  },
  prestigeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.xs,
  },
  prestigeLabel: {
    fontSize: SIZES.xs,
    color: '#000',
    fontWeight: '600',
  },
  prestigeValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: '#000',
  },
  tabs: {
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
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
    marginTop: 2,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
  },
  subsectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.lg,
  },
  luxuryCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  luxuryHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  luxuryIcon: {
    fontSize: 60,
  },
  luxuryInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    justifyContent: 'center',
  },
  luxuryName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  luxuryStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  luxuryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  luxuryStatText: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: SIZES.radius.sm,
  },
  featureText: {
    fontSize: SIZES.xs,
    color: COLORS.neonPink,
    fontWeight: '600',
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  ownedText: {
    color: COLORS.neonGreen,
    fontWeight: '600',
  },
  portfolioCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  portfolioTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  portfolioStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portfolioStat: {
    flex: 1,
  },
  portfolioLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  portfolioValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.neonPurple,
  },
  investmentCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  investmentHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  investmentInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  investmentName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  investmentStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.lg,
  },
  investmentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  investmentLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  investmentValue: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  brandCard: {
    marginHorizontal: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  brandHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  brandInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  brandName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  brandType: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  brandStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  brandStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandStatText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
});
