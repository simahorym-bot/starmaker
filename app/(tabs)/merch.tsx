import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Merchandise, LuxuryItem } from '@/types/game';

const MERCH_TEMPLATES = [
  { type: 'clothing', name: 'Tour T-Shirt', basePrice: 30, cost: 10 },
  { type: 'clothing', name: 'Hoodie', basePrice: 60, cost: 20 },
  { type: 'vinyl', name: 'Vinyl Record', basePrice: 40, cost: 15 },
  { type: 'cd', name: 'CD Album', basePrice: 15, cost: 5 },
  { type: 'poster', name: 'Signed Poster', basePrice: 25, cost: 8 },
];

const LUXURY_ITEMS: LuxuryItem[] = [
  { id: '1', name: 'Lamborghini Aventador', category: 'car', prestige: 50, cost: 400000, owned: false },
  { id: '2', name: 'Ferrari SF90', category: 'car', prestige: 60, cost: 500000, owned: false },
  { id: '3', name: 'Rolls Royce Phantom', category: 'car', prestige: 70, cost: 450000, owned: false },
  { id: '4', name: 'Private Jet - Gulfstream', category: 'jet', prestige: 200, cost: 5000000, owned: false },
  { id: '5', name: 'Private Jet - Bombardier', category: 'jet', prestige: 180, cost: 4000000, owned: false },
  { id: '6', name: 'Malibu Beach Villa', category: 'villa', prestige: 150, cost: 2000000, owned: false },
  { id: '7', name: 'Miami Penthouse', category: 'penthouse', prestige: 120, cost: 1500000, owned: false },
  { id: '8', name: 'NYC Skyline Penthouse', category: 'penthouse', prestige: 140, cost: 3000000, owned: false },
];

export default function MerchScreen() {
  const { gameState, updateGameState } = useGame();
  const [activeTab, setActiveTab] = useState<'shop' | 'lifestyle'>('shop');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMerchName, setNewMerchName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(MERCH_TEMPLATES[0]);

  if (!gameState) return null;

  const { artist, merchandise, luxuryItems } = gameState;

  const totalRevenue = merchandise.reduce((sum, m) => sum + m.revenue, 0);

  const handleCreateMerch = async () => {
    if (!newMerchName.trim()) {
      Alert.alert('Missing Name', 'Please enter a product name');
      return;
    }

    const newMerch: Merchandise = {
      id: Date.now().toString(),
      name: newMerchName,
      type: selectedTemplate.type as any,
      price: selectedTemplate.basePrice,
      unitsSold: 0,
      revenue: 0,
    };

    await updateGameState({
      ...gameState,
      merchandise: [...merchandise, newMerch],
    });

    setNewMerchName('');
    setShowCreateModal(false);
    Alert.alert('Success!', `${newMerch.name} added to your store!`);
  };

  const handleSimulateSales = async () => {
    const updatedMerch = merchandise.map((item) => {
      const sales = Math.floor(Math.random() * (gameState.fanbase.total / 100));
      const revenue = sales * item.price;
      return {
        ...item,
        unitsSold: item.unitsSold + sales,
        revenue: item.revenue + revenue,
      };
    });

    const totalNewRevenue = updatedMerch.reduce((sum, m) => sum + m.revenue, 0) - totalRevenue;

    await updateGameState({
      ...gameState,
      merchandise: updatedMerch,
      artist: {
        ...artist,
        money: artist.money + totalNewRevenue,
      },
    });

    Alert.alert('Sales Update!', `Earned $${totalNewRevenue.toLocaleString()} from merchandise!`);
  };

  const handlePurchaseLuxury = async (item: LuxuryItem) => {
    if (artist.money < item.cost) {
      Alert.alert('Insufficient Funds', `You need $${item.cost.toLocaleString()}`);
      return;
    }

    const ownedItem = luxuryItems.find((i) => i.id === item.id);
    if (ownedItem?.owned) {
      Alert.alert('Already Owned', 'You already own this item');
      return;
    }

    const updatedLuxury = luxuryItems.some((i) => i.id === item.id)
      ? luxuryItems.map((i) => (i.id === item.id ? { ...i, owned: true } : i))
      : [...luxuryItems, { ...item, owned: true }];

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - item.cost,
        prestige: artist.prestige + item.prestige,
      },
      luxuryItems: updatedLuxury,
    });

    Alert.alert('Purchase Complete!', `+${item.prestige} Prestige!`);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'car':
        return 'car-sport';
      case 'jet':
        return 'airplane';
      case 'villa':
        return 'home';
      case 'penthouse':
        return 'business';
      default:
        return 'star';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Empire</Text>
        <View style={styles.prestigeBadge}>
          <MaterialCommunityIcons name="crown" size={20} color={COLORS.gold} />
          <Text style={styles.prestigeText}>{artist.prestige} Prestige</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shop' && styles.tabActive]}
          onPress={() => setActiveTab('shop')}
        >
          <Ionicons
            name="shirt"
            size={20}
            color={activeTab === 'shop' ? COLORS.neonPurple : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'shop' && styles.tabTextActive]}>
            Merch Shop
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'lifestyle' && styles.tabActive]}
          onPress={() => setActiveTab('lifestyle')}
        >
          <MaterialCommunityIcons
            name="diamond"
            size={20}
            color={activeTab === 'lifestyle' ? COLORS.gold : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'lifestyle' && styles.tabTextActive]}>
            Luxury Lifestyle
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'shop' ? (
          <>
            {/* Stats */}
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="tshirt-crew" size={24} color={COLORS.neonPurple} />
                  <Text style={styles.statValue}>{merchandise.length}</Text>
                  <Text style={styles.statLabel}>Products</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="cash" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.statValue}>${totalRevenue.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Revenue</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="cart" size={24} color={COLORS.neonCyan} />
                  <Text style={styles.statValue}>
                    {merchandise.reduce((sum, m) => sum + m.unitsSold, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Units Sold</Text>
                </View>
              </View>
            </Card>

            <View style={styles.actionButtons}>
              <Button
                title="➕ Create Product"
                onPress={() => setShowCreateModal(true)}
                variant="neon"
                style={{ flex: 1 }}
              />
              <Button
                title="💰 Simulate Sales"
                onPress={handleSimulateSales}
                variant="gold"
                style={{ flex: 1 }}
              />
            </View>

            {/* Products */}
            <Text style={styles.sectionTitle}>Your Products</Text>
            {merchandise.length === 0 ? (
              <Card>
                <Text style={styles.emptyText}>No products yet. Create your first merch!</Text>
              </Card>
            ) : (
              merchandise.map((item) => (
                <Card key={item.id} style={styles.merchCard}>
                  <View style={styles.merchHeader}>
                    <Ionicons
                      name={
                        item.type === 'clothing'
                          ? 'shirt'
                          : item.type === 'vinyl'
                          ? 'disc'
                          : item.type === 'cd'
                          ? 'disc'
                          : 'image'
                      }
                      size={32}
                      color={COLORS.neonPurple}
                    />
                    <View style={styles.merchInfo}>
                      <Text style={styles.merchName}>{item.name}</Text>
                      <Text style={styles.merchType}>{item.type.toUpperCase()}</Text>
                    </View>
                    <View style={styles.merchPrice}>
                      <Text style={styles.priceText}>${item.price}</Text>
                    </View>
                  </View>
                  <View style={styles.merchStats}>
                    <Text style={styles.merchStat}>Units Sold: {item.unitsSold}</Text>
                    <Text style={styles.merchStat}>Revenue: ${item.revenue.toLocaleString()}</Text>
                  </View>
                </Card>
              ))
            )}
          </>
        ) : (
          <>
            {/* Luxury Stats */}
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="diamond" size={24} color={COLORS.gold} />
                  <Text style={styles.statValue}>
                    {luxuryItems.filter((i) => i.owned).length}
                  </Text>
                  <Text style={styles.statLabel}>Owned</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="crown" size={24} color={COLORS.gold} />
                  <Text style={styles.statValue}>{artist.prestige}</Text>
                  <Text style={styles.statLabel}>Prestige</Text>
                </View>
                <View style={styles.stat}>
                  <MaterialCommunityIcons name="cash" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.statValue}>${(artist.money / 1000).toFixed(0)}K</Text>
                  <Text style={styles.statLabel}>Cash</Text>
                </View>
              </View>
            </Card>

            {/* Luxury Categories */}
            {['car', 'jet', 'villa', 'penthouse'].map((category) => {
              const items = LUXURY_ITEMS.filter((i) => i.category === category);
              return (
                <View key={category}>
                  <Text style={styles.categoryTitle}>
                    {category === 'car'
                      ? '🚗 Sports Cars'
                      : category === 'jet'
                      ? '✈️ Private Jets'
                      : category === 'villa'
                      ? '🏡 Villas'
                      : '🏙️ Penthouses'}
                  </Text>
                  {items.map((item) => {
                    const isOwned = luxuryItems.find((i) => i.id === item.id)?.owned;
                    const cardStyle = isOwned ? { ...styles.luxuryCard, ...styles.luxuryCardOwned } : styles.luxuryCard;
                    return (
                      <Card
                        key={item.id}
                        style={cardStyle}
                        variant={isOwned ? 'gold' : 'default'}
                      >
                        <View style={styles.luxuryHeader}>
                          <Ionicons
                            name={getCategoryIcon(item.category)}
                            size={40}
                            color={isOwned ? COLORS.gold : COLORS.neonCyan}
                          />
                          <View style={styles.luxuryInfo}>
                            <Text style={styles.luxuryName}>{item.name}</Text>
                            <Text style={styles.luxuryPrestige}>+{item.prestige} Prestige</Text>
                            <Text style={styles.luxuryCost}>
                              ${item.cost.toLocaleString()}
                            </Text>
                          </View>
                          {isOwned ? (
                            <View style={styles.ownedBadge}>
                              <Ionicons name="checkmark-circle" size={32} color={COLORS.gold} />
                            </View>
                          ) : (
                            <TouchableOpacity
                              style={styles.buyButton}
                              onPress={() => handlePurchaseLuxury(item)}
                            >
                              <Text style={styles.buyButtonText}>BUY</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </Card>
                    );
                  })}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Create Merch Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Product</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Product Type</Text>
            <View style={styles.templateGrid}>
              {MERCH_TEMPLATES.map((template) => (
                <TouchableOpacity
                  key={template.name}
                  style={[
                    styles.templateCard,
                    selectedTemplate.name === template.name && styles.templateCardActive,
                  ]}
                  onPress={() => setSelectedTemplate(template)}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templatePrice}>${template.basePrice}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Product Name</Text>
            <TextInput
              style={styles.input}
              value={newMerchName}
              onChangeText={setNewMerchName}
              placeholder="e.g., Summer Tour Hoodie"
              placeholderTextColor={COLORS.textTertiary}
            />

            <Button
              title="Create Product"
              onPress={handleCreateMerch}
              variant="gold"
              size="lg"
              style={{ marginTop: SIZES.spacing.lg }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  prestigeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    gap: 4,
  },
  prestigeText: {
    color: COLORS.gold,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    gap: SIZES.spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
  },
  statsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.xs,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: SIZES.md,
  },
  merchCard: {
    marginBottom: SIZES.spacing.md,
  },
  merchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.sm,
  },
  merchInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  merchName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  merchType: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  merchPrice: {
    backgroundColor: COLORS.neonGreen,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.md,
  },
  priceText: {
    color: '#000',
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
  merchStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  merchStat: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  categoryTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  luxuryCard: {
    marginBottom: SIZES.spacing.md,
  },
  luxuryCardOwned: {
    backgroundColor: COLORS.surfaceLight,
  },
  luxuryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  luxuryInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  luxuryName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  luxuryPrestige: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    marginTop: 2,
  },
  luxuryCost: {
    fontSize: SIZES.sm,
    color: COLORS.neonGreen,
    marginTop: 2,
  },
  ownedBadge: {
    padding: SIZES.spacing.sm,
  },
  buyButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: SIZES.radius.md,
  },
  buyButtonText: {
    color: '#000',
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    padding: SIZES.spacing.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  modalTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  inputLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.lg,
  },
  templateCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceLight,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    alignItems: 'center',
  },
  templateCardActive: {
    backgroundColor: COLORS.neonPurple,
  },
  templateName: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  templatePrice: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
  },
});
