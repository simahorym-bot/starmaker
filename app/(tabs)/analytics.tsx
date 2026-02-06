import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/hooks/useLocale';
import { TeamMember } from '@/types/game';

const screenWidth = Dimensions.get('window').width;

export default function AnalyticsScreen() {
  const t = useLocale();
  const { gameState, updateGameState } = useGame();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'team'>('overview');

  if (!gameState) return null;

  const { artist, fanbase, songs, team } = gameState;

  // Sample streaming data
  const streamingData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5', 'Sem 6'],
    datasets: [
      {
        data: [
          fanbase.total * 0.5,
          fanbase.total * 0.6,
          fanbase.total * 0.75,
          fanbase.total * 0.9,
          fanbase.total * 1.0,
          fanbase.total * 1.2,
        ],
        color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Market share by country
  const marketShareData = [
    {
      name: 'France',
      population: (fanbase.demographics?.regions?.['France'] || 30),
      color: COLORS.neonPurple,
      legendFontColor: COLORS.textSecondary,
    },
    {
      name: 'USA',
      population: (fanbase.demographics?.regions?.['USA'] || 25),
      color: COLORS.neonCyan,
      legendFontColor: COLORS.textSecondary,
    },
    {
      name: 'UK',
      population: (fanbase.demographics?.regions?.['UK'] || 20),
      color: COLORS.neonGreen,
      legendFontColor: COLORS.textSecondary,
    },
    {
      name: 'Autres',
      population: 25,
      color: COLORS.gold,
      legendFontColor: COLORS.textSecondary,
    },
  ];

  const teamRoles = [
    {
      id: 'creative-director',
      role: 'creative-director' as const,
      name: t.analytics.team.creativeDirector.name,
      description: t.analytics.team.creativeDirector.description,
      salary: 8000,
      boost: { type: 'visuals' as const, value: 25 },
      icon: 'palette',
    },
    {
      id: 'digital-strategist',
      role: 'digital-strategist' as const,
      name: t.analytics.team.digitalStrategist.name,
      description: t.analytics.team.digitalStrategist.description,
      salary: 7000,
      boost: { type: 'virality' as const, value: 30 },
      icon: 'trending-up',
    },
    {
      id: 'press-attache',
      role: 'press-attache' as const,
      name: t.analytics.team.pressAttache.name,
      description: t.analytics.team.pressAttache.description,
      salary: 6000,
      boost: { type: 'press' as const, value: 20 },
      icon: 'newspaper',
    },
    {
      id: 'tour-manager',
      role: 'tour-manager' as const,
      name: t.analytics.team.tourManager.name,
      description: t.analytics.team.tourManager.description,
      salary: 5000,
      boost: { type: 'tour-efficiency' as const, value: 15 },
      icon: 'airplane',
    },
    {
      id: 'bodyguards',
      role: 'bodyguards' as const,
      name: t.analytics.team.bodyguards.name,
      description: t.analytics.team.bodyguards.description,
      salary: 4000,
      boost: { type: 'security' as const, value: 100 },
      icon: 'shield-check',
    },
  ];

  const handleHireTeamMember = async (member: any) => {
    if (artist.money < member.salary * 3) {
      Alert.alert(
        t.messages.insufficientFunds,
        `Coût d'embauche: ${(member.salary * 3).toLocaleString()}€`
      );
      return;
    }

    if (team[member.role as keyof typeof team]) {
      Alert.alert('Déjà embauché', 'Vous avez déjà quelqu\'un dans ce rôle');
      return;
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: member.name,
      role: member.role,
      skill: 70 + Math.floor(Math.random() * 30),
      salary: member.salary,
      hiredDate: Date.now(),
      boost: member.boost,
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - member.salary * 3,
      },
      team: {
        ...team,
        [member.role]: newMember,
      },
    });

    Alert.alert(t.common.success, `${member.name} embauché(e) !`);
  };

  const handleFireTeamMember = async (role: string) => {
    Alert.alert(
      'Licencier',
      'Êtes-vous sûr de vouloir licencier ce membre de l\'équipe ?',
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.fire,
          style: 'destructive',
          onPress: async () => {
            await updateGameState({
              ...gameState,
              team: {
                ...team,
                [role]: null,
              },
            });
            Alert.alert(t.common.success, 'Membre licencié');
          },
        },
      ]
    );
  };

  const chartConfig = {
    backgroundColor: COLORS.surface,
    backgroundGradientFrom: COLORS.surface,
    backgroundGradientTo: COLORS.surfaceLight,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(168, 85, 247, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(160, 160, 160, ${opacity})`,
    style: {
      borderRadius: SIZES.radius.md,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: COLORS.neonPurple,
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.analytics.title}</Text>
          <View style={styles.levelBadge}>
            <MaterialCommunityIcons name="chart-line" size={20} color={COLORS.neonCyan} />
            <Text style={styles.levelText}>Niveau {artist.level}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'overview' && styles.tabActive]}
            onPress={() => setSelectedTab('overview')}
          >
            <MaterialCommunityIcons
              name="chart-box"
              size={20}
              color={selectedTab === 'overview' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'overview' && styles.tabTextActive,
              ]}
            >
              {t.analytics.overview}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'team' && styles.tabActive]}
            onPress={() => setSelectedTab('team')}
          >
            <Ionicons
              name="people"
              size={20}
              color={selectedTab === 'team' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'team' && styles.tabTextActive,
              ]}
            >
              {t.analytics.team.title}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <View>
            {/* Key Metrics */}
            <Card style={styles.metricsCard}>
              <View style={styles.metricsGrid}>
                <View style={styles.metric}>
                  <Ionicons name="play-circle" size={24} color={COLORS.neonPurple} />
                  <Text style={styles.metricValue}>
                    {(fanbase.total * 10).toLocaleString()}
                  </Text>
                  <Text style={styles.metricLabel}>{t.analytics.charts.streams}</Text>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons name="cash" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.metricValue}>
                    {artist.money.toLocaleString()}€
                  </Text>
                  <Text style={styles.metricLabel}>{t.analytics.charts.revenue}</Text>
                </View>
                <View style={styles.metric}>
                  <MaterialCommunityIcons name="heart" size={24} color={COLORS.neonPink} />
                  <Text style={styles.metricValue}>{fanbase.engagement || 75}%</Text>
                  <Text style={styles.metricLabel}>{t.analytics.charts.engagement}</Text>
                </View>
              </View>
            </Card>

            {/* Streaming Trends */}
            <Text style={styles.sectionTitle}>{t.analytics.streamingTrends}</Text>
            <Card style={styles.chartCard}>
              <LineChart
                data={streamingData}
                width={screenWidth - SIZES.spacing.lg * 4}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card>

            {/* Market Share */}
            <Text style={styles.sectionTitle}>{t.analytics.marketShare}</Text>
            <Card style={styles.chartCard}>
              <PieChart
                data={marketShareData}
                width={screenWidth - SIZES.spacing.lg * 4}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </Card>

            {/* Sales Forecast */}
            <Text style={styles.sectionTitle}>{t.analytics.salesForecast}</Text>
            <Card style={styles.forecastCard}>
              <View style={styles.forecastRow}>
                <View style={styles.forecastItem}>
                  <Text style={styles.forecastLabel}>Cette Semaine</Text>
                  <Text style={styles.forecastValue}>
                    +{((fanbase.total * 0.1) / 7).toFixed(0)} fans/jour
                  </Text>
                </View>
                <View style={styles.forecastItem}>
                  <Text style={styles.forecastLabel}>Ce Mois</Text>
                  <Text style={styles.forecastValue}>
                    +{(fanbase.total * 0.1).toFixed(0)} fans
                  </Text>
                </View>
              </View>
              <View style={styles.forecastRow}>
                <View style={styles.forecastItem}>
                  <Text style={styles.forecastLabel}>Revenus Projetés</Text>
                  <Text style={styles.forecastValue}>
                    {(artist.money * 0.15).toLocaleString()}€
                  </Text>
                </View>
                <View style={styles.forecastItem}>
                  <Text style={styles.forecastLabel}>Croissance</Text>
                  <Text style={[styles.forecastValue, { color: COLORS.neonGreen }]}>
                    +{Math.floor(15 + Math.random() * 10)}%
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Team Tab */}
        {selectedTab === 'team' && (
          <View>
            <Text style={styles.sectionTitle}>{t.analytics.team.title}</Text>

            {/* Current Team */}
            {Object.entries(team).filter(([_, member]) => member).length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Équipe Actuelle</Text>
                {Object.entries(team).map(([role, member]) => {
                  if (!member) return null;
                  return (
                    <Card key={role} style={styles.teamCard}>
                      <View style={styles.teamMemberHeader}>
                        <MaterialCommunityIcons
                          name="account-circle"
                          size={40}
                          color={COLORS.neonGreen}
                        />
                        <View style={styles.teamMemberInfo}>
                          <Text style={styles.teamMemberName}>{member.name}</Text>
                          <Text style={styles.teamMemberRole}>
                            {teamRoles.find(r => r.role === role)?.name || role}
                          </Text>
                          <View style={styles.skillBar}>
                            <View
                              style={[
                                styles.skillFill,
                                { width: `${member.skill}%` },
                              ]}
                            />
                          </View>
                        </View>
                      </View>
                      <View style={styles.teamMemberStats}>
                        <View style={styles.teamStat}>
                          <Text style={styles.teamStatLabel}>Compétence:</Text>
                          <Text style={styles.teamStatValue}>{member.skill}%</Text>
                        </View>
                        <View style={styles.teamStat}>
                          <Text style={styles.teamStatLabel}>Salaire:</Text>
                          <Text style={styles.teamStatValue}>
                            {member.salary.toLocaleString()}€/mois
                          </Text>
                        </View>
                      </View>
                      <Button
                        title={t.common.fire}
                        onPress={() => handleFireTeamMember(role)}
                        variant="neon"
                        size="sm"
                      />
                    </Card>
                  );
                })}
              </>
            )}

            {/* Available Hires */}
            <Text style={styles.subsectionTitle}>Recrutement Disponible</Text>
            {teamRoles.map((member) => {
              const hired = team[member.role as keyof typeof team];
              return (
                <Card key={member.id} style={styles.teamCard}>
                  <View style={styles.teamMemberHeader}>
                    <MaterialCommunityIcons
                      name={member.icon as any}
                      size={40}
                      color={hired ? COLORS.neonGreen : COLORS.neonPurple}
                    />
                    <View style={styles.teamMemberInfo}>
                      <Text style={styles.teamMemberName}>{member.name}</Text>
                      <Text style={styles.teamMemberDescription}>
                        {member.description}
                      </Text>
                      <View style={styles.boostBadge}>
                        <MaterialCommunityIcons
                          name="trending-up"
                          size={16}
                          color={COLORS.gold}
                        />
                        <Text style={styles.boostText}>
                          +{member.boost.value}% {member.boost.type}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.hireCost}>
                    <View style={styles.costItem}>
                      <MaterialCommunityIcons name="cash" size={20} color={COLORS.gold} />
                      <Text style={styles.costText}>
                        {(member.salary * 3).toLocaleString()}€ (embauche)
                      </Text>
                    </View>
                    <View style={styles.costItem}>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={20}
                        color={COLORS.neonCyan}
                      />
                      <Text style={styles.costText}>
                        {member.salary.toLocaleString()}€/mois
                      </Text>
                    </View>
                  </View>
                  {hired ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Embauché</Text>
                    </View>
                  ) : (
                    <Button
                      title={t.common.hire}
                      onPress={() => handleHireTeamMember(member)}
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
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.neonCyan,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  levelText: {
    color: COLORS.neonCyan,
    fontWeight: '600',
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.sm,
  },
  tabs: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.xs,
  },
  tabActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.gold,
    borderWidth: 1,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
  },
  subsectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  metricsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.xs,
  },
  metricLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  chartCard: {
    marginBottom: SIZES.spacing.lg,
    alignItems: 'center',
  },
  chart: {
    borderRadius: SIZES.radius.md,
  },
  forecastCard: {
    marginBottom: SIZES.spacing.lg,
  },
  forecastRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  forecastItem: {
    flex: 1,
  },
  forecastLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  forecastValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.neonPurple,
  },
  teamCard: {
    marginBottom: SIZES.spacing.md,
  },
  teamMemberHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  teamMemberInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  teamMemberName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  teamMemberRole: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  teamMemberDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  skillBar: {
    height: 6,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 3,
    marginTop: 4,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: COLORS.neonGreen,
  },
  teamMemberStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  teamStat: {
    flex: 1,
  },
  teamStatLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  teamStatValue: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  boostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SIZES.spacing.xs,
  },
  boostText: {
    fontSize: SIZES.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  hireCost: {
    marginBottom: SIZES.spacing.md,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: 4,
  },
  costText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
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
});
