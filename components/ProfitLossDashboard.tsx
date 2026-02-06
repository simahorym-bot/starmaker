import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { GameState } from '@/types/game';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

interface ProfitLossDashboardProps {
  gameState: GameState;
}

export const ProfitLossDashboard: React.FC<ProfitLossDashboardProps> = ({ gameState }) => {
  const t = useLocale();
  const [selectedMonth, setSelectedMonth] = useState('current');

  // Calculate revenues
  const calculateRevenues = () => {
    const streaming = gameState.songs.reduce((sum, song) => sum + (song.earnings || 0), 0);
    const physical = gameState.songs.reduce((sum, song) => {
      if (song.physicalSales) {
        return sum + song.physicalSales.vinylRevenue + song.physicalSales.cdRevenue;
      }
      return sum;
    }, 0);
    const merchandise = gameState.merchandise.reduce((sum, item) => sum + item.revenue, 0);
    const touring = gameState.tours.reduce((sum, tour) => sum + tour.totalRevenue, 0);
    const brandDeals = gameState.brandDeals
      .filter(deal => deal.active)
      .reduce((sum, deal) => sum + deal.value, 0);
    const licensing = gameState.contracts
      .filter(c => c.signed)
      .reduce((sum, contract) => sum + contract.earnings, 0);

    return {
      streaming,
      physical,
      merchandise,
      touring,
      brandDeals,
      licensing,
      total: streaming + physical + merchandise + touring + brandDeals + licensing,
    };
  };

  // Calculate expenses
  const calculateExpenses = () => {
    const studioRent = 5000 + (gameState.studio.quality * 500);
    const teamSalaries = Object.values(gameState.team).reduce((sum, member) => {
      return sum + (member ? member.salary : 0);
    }, 0);
    const marketing = Math.floor(gameState.fanbase.total * 0.1);
    const production = gameState.songs.length * 2000;
    const maintenance = gameState.luxuryItems.filter(item => item.owned).length * 1000;
    const luxury = gameState.luxuryItems
      .filter(item => item.owned)
      .reduce((sum, item) => sum + (item.cost * 0.01), 0);

    return {
      studio: studioRent,
      team: teamSalaries,
      marketing,
      production,
      maintenance,
      luxury,
      total: studioRent + teamSalaries + marketing + production + maintenance + luxury,
    };
  };

  const revenues = calculateRevenues();
  const expenses = calculateExpenses();
  const netProfit = revenues.total - expenses.total;
  const margin = revenues.total > 0 ? ((netProfit / revenues.total) * 100).toFixed(1) : '0';

  const revenueData = [
    { label: t.profitAndLoss.revenue.streaming, value: revenues.streaming, icon: 'spotify', color: COLORS.neonGreen },
    { label: t.profitAndLoss.revenue.physicalSales, value: revenues.physical, icon: 'disc', color: COLORS.gold24K },
    { label: t.profitAndLoss.revenue.merchandise, value: revenues.merchandise, icon: 'tshirt-crew', color: COLORS.neonPurple },
    { label: t.profitAndLoss.revenue.touring, value: revenues.touring, icon: 'guitar-electric', color: COLORS.electricBlue },
    { label: t.profitAndLoss.revenue.brandDeals, value: revenues.brandDeals, icon: 'crown', color: COLORS.goldDark },
    { label: t.profitAndLoss.revenue.licensing, value: revenues.licensing, icon: 'file-document', color: COLORS.neonCyan },
  ];

  const expenseData = [
    { label: t.profitAndLoss.expenses.studio, value: expenses.studio, icon: 'home-city', color: COLORS.chartRed },
    { label: t.profitAndLoss.expenses.team, value: expenses.team, icon: 'account-group', color: COLORS.chartOrange },
    { label: t.profitAndLoss.expenses.marketing, value: expenses.marketing, icon: 'bullhorn', color: COLORS.chartPurple },
    { label: t.profitAndLoss.expenses.production, value: expenses.production, icon: 'music-note', color: COLORS.neonPink },
    { label: t.profitAndLoss.expenses.maintenance, value: expenses.maintenance, icon: 'tools', color: COLORS.textSecondary },
    { label: t.profitAndLoss.expenses.luxury, value: expenses.luxury, icon: 'diamond-stone', color: COLORS.platinum },
  ];

  // Mock trend data (in a real app, this would be historical data)
  const trendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        data: [
          revenues.total * 0.6,
          revenues.total * 0.7,
          revenues.total * 0.8,
          revenues.total * 0.9,
          revenues.total * 0.95,
          revenues.total,
        ],
        color: (opacity = 1) => `rgba(0, 229, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t.profitAndLoss.title}</Text>
          <Text style={styles.subtitle}>{t.profitAndLoss.subtitle}</Text>
        </View>
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.monthText}>Juin 2026</Text>
          <TouchableOpacity style={styles.monthButton}>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Net Profit Summary */}
      <LinearGradient
        colors={netProfit >= 0 ? [COLORS.neonGreen + '20', COLORS.neonGreen + '05'] : [COLORS.error + '20', COLORS.error + '05']}
        style={styles.profitCard}
      >
        <View style={styles.profitHeader}>
          <MaterialCommunityIcons
            name={netProfit >= 0 ? 'trending-up' : 'trending-down'}
            size={32}
            color={netProfit >= 0 ? COLORS.neonGreen : COLORS.error}
          />
          <Text style={styles.profitLabel}>{t.profitAndLoss.netProfit}</Text>
        </View>
        <Text style={[styles.profitValue, { color: netProfit >= 0 ? COLORS.neonGreen : COLORS.error }]}>
          {netProfit >= 0 ? '+' : ''}{netProfit.toLocaleString()}€
        </Text>
        <View style={styles.marginBadge}>
          <Text style={styles.marginText}>{t.profitAndLoss.margin}: {margin}%</Text>
        </View>
      </LinearGradient>

      {/* Revenue Breakdown */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="cash-multiple" size={24} color={COLORS.neonGreen} />
          <Text style={styles.sectionTitle}>{t.profitAndLoss.revenue.title}</Text>
          <Text style={styles.totalValue}>+{revenues.total.toLocaleString()}€</Text>
        </View>
        {revenueData.map((item, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.lineItemLeft}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.lineItemLabel}>{item.label}</Text>
            </View>
            <Text style={[styles.lineItemValue, { color: item.color }]}>
              +{item.value.toLocaleString()}€
            </Text>
          </View>
        ))}
      </Card>

      {/* Expense Breakdown */}
      <Card style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="cash-minus" size={24} color={COLORS.error} />
          <Text style={styles.sectionTitle}>{t.profitAndLoss.expenses.title}</Text>
          <Text style={[styles.totalValue, { color: COLORS.error }]}>-{expenses.total.toLocaleString()}€</Text>
        </View>
        {expenseData.map((item, index) => (
          <View key={index} style={styles.lineItem}>
            <View style={styles.lineItemLeft}>
              <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.lineItemLabel}>{item.label}</Text>
            </View>
            <Text style={[styles.lineItemValue, { color: item.color }]}>
              -{item.value.toLocaleString()}€
            </Text>
          </View>
        ))}
      </Card>

      {/* Trend Chart */}
      <Card style={styles.chartCard}>
        <Text style={styles.chartTitle}>{t.profitAndLoss.trend}</Text>
        <LineChart
          data={trendData}
          width={width - 60}
          height={200}
          chartConfig={{
            backgroundColor: COLORS.surface,
            backgroundGradientFrom: COLORS.surface,
            backgroundGradientTo: COLORS.surfaceLight,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 229, 255, ${opacity})`,
            labelColor: (opacity = 1) => COLORS.textSecondary,
            style: {
              borderRadius: SIZES.radius.lg,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: COLORS.electricBlue,
            },
          }}
          bezier
          style={styles.chart}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    color: COLORS.gold24K,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.xs,
  },
  monthButton: {
    padding: SIZES.spacing.xs,
  },
  monthText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
    paddingHorizontal: SIZES.spacing.md,
  },
  profitCard: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  profitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  profitLabel: {
    fontSize: SIZES.lg,
    color: COLORS.textPrimary,
    fontWeight: '600',
    marginLeft: SIZES.spacing.md,
  },
  profitValue: {
    fontSize: 42,
    fontWeight: '900',
    marginBottom: SIZES.spacing.md,
  },
  marginBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  marginText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  sectionCard: {
    marginBottom: SIZES.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.lg,
    paddingBottom: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  totalValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.neonGreen,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceDark,
  },
  lineItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  lineItemLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginLeft: SIZES.spacing.md,
  },
  lineItemValue: {
    fontSize: SIZES.md,
    fontWeight: '700',
  },
  chartCard: {
    marginBottom: SIZES.spacing.xl,
    padding: SIZES.spacing.lg,
  },
  chartTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.lg,
  },
  chart: {
    borderRadius: SIZES.radius.lg,
  },
});
