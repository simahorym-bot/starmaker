import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GameState } from '@/types/game';

interface StudioInventoryProps {
  gameState: GameState;
  onPurchase: (itemId: string, cost: number, qualityBoost: number) => void;
}

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  qualityBoost: number;
  icon: string;
  rarity: 'common' | 'rare' | 'legendary';
  category: 'soundproofing' | 'plugin';
}

export const StudioInventory: React.FC<StudioInventoryProps> = ({ gameState, onPurchase }) => {
  const t = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<'soundproofing' | 'plugin'>('soundproofing');

  const soundproofingItems: InventoryItem[] = [
    {
      id: 'soundproof-basic',
      name: t.studioInventory.soundproofing.basic,
      description: 'Isolation de base pour réduire les bruits externes',
      cost: 15000,
      qualityBoost: 5,
      icon: 'wall',
      rarity: 'common',
      category: 'soundproofing',
    },
    {
      id: 'soundproof-premium',
      name: t.studioInventory.soundproofing.premium,
      description: 'Panneaux acoustiques professionnels haut de gamme',
      cost: 45000,
      qualityBoost: 15,
      icon: 'wall-sconce',
      rarity: 'rare',
      category: 'soundproofing',
    },
    {
      id: 'soundproof-ultimate',
      name: t.studioInventory.soundproofing.ultimate,
      description: 'Système d\'isolation total pour studio de référence',
      cost: 100000,
      qualityBoost: 30,
      icon: 'shield-check',
      rarity: 'legendary',
      category: 'soundproofing',
    },
  ];

  const pluginItems: InventoryItem[] = [
    {
      id: 'plugin-eq',
      name: t.studioInventory.plugins.eq,
      description: 'Égaliseur paramétrique de précision studio',
      cost: 8000,
      qualityBoost: 8,
      icon: 'tune-vertical',
      rarity: 'rare',
      category: 'plugin',
    },
    {
      id: 'plugin-compressor',
      name: t.studioInventory.plugins.compressor,
      description: 'Compression dynamique transparente ou colorée',
      cost: 12000,
      qualityBoost: 10,
      icon: 'waveform',
      rarity: 'rare',
      category: 'plugin',
    },
    {
      id: 'plugin-reverb',
      name: t.studioInventory.plugins.reverb,
      description: 'Réverbération convolutive pour espaces réalistes',
      cost: 10000,
      qualityBoost: 12,
      icon: 'waves',
      rarity: 'rare',
      category: 'plugin',
    },
    {
      id: 'plugin-autotune',
      name: t.studioInventory.plugins.autotune,
      description: 'Correction pitch en temps réel niveau Grammy',
      cost: 25000,
      qualityBoost: 20,
      icon: 'microphone-variant',
      rarity: 'legendary',
      category: 'plugin',
    },
  ];

  const allItems = selectedCategory === 'soundproofing' ? soundproofingItems : pluginItems;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return COLORS.textSecondary;
      case 'rare':
        return COLORS.neonPurple;
      case 'legendary':
        return COLORS.gold24K;
      default:
        return COLORS.textSecondary;
    }
  };

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return [COLORS.surface, COLORS.surfaceLight];
      case 'rare':
        return [COLORS.neonPurple + '30', COLORS.neonPurple + '10'];
      case 'legendary':
        return [COLORS.gold24K + '30', COLORS.gold24K + '10'];
      default:
        return [COLORS.surface, COLORS.surfaceLight];
    }
  };

  const isOwned = (itemId: string): boolean => {
    return gameState.studio.equipment.some(e => e.id === itemId) ||
           (gameState.studio.upgrades && gameState.studio.upgrades.some(u => u.id === itemId));
  };

  const handlePurchase = (item: InventoryItem) => {
    if (gameState.artist.money < item.cost) {
      Alert.alert(
        t.messages.insufficientFunds,
        `Coût: ${item.cost.toLocaleString()}€\nVous avez: ${gameState.artist.money.toLocaleString()}€`
      );
      return;
    }

    if (isOwned(item.id)) {
      Alert.alert(t.studioInventory.owned, 'Vous possédez déjà cet équipement');
      return;
    }

    Alert.alert(
      'Confirmer l\'achat',
      `${item.name}\n\nCoût: ${item.cost.toLocaleString()}€\nAmélioration qualité: +${item.qualityBoost}`,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.studioInventory.purchase,
          onPress: () => onPurchase(item.id, item.cost, item.qualityBoost),
        },
      ]
    );
  };

  const currentQuality = gameState.studio.soundFidelity || 50;

  return (
    <View style={styles.container}>
      {/* Quality Indicator */}
      <Card style={styles.qualityCard}>
        <View style={styles.qualityHeader}>
          <MaterialCommunityIcons name="certificate" size={32} color={COLORS.gold24K} />
          <View style={styles.qualityInfo}>
            <Text style={styles.qualityLabel}>{t.studioInventory.quality}</Text>
            <Text style={styles.qualityValue}>{currentQuality}%</Text>
          </View>
        </View>
        <View style={styles.qualityBar}>
          <View style={[styles.qualityFill, { width: `${currentQuality}%` }]} />
        </View>
      </Card>

      {/* Category Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedCategory === 'soundproofing' && styles.tabActive]}
          onPress={() => setSelectedCategory('soundproofing')}
        >
          <MaterialCommunityIcons
            name="wall"
            size={24}
            color={selectedCategory === 'soundproofing' ? COLORS.electricBlue : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              selectedCategory === 'soundproofing' && styles.tabTextActive,
            ]}
          >
            {t.studioInventory.soundproofing.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedCategory === 'plugin' && styles.tabActive]}
          onPress={() => setSelectedCategory('plugin')}
        >
          <MaterialCommunityIcons
            name="music-box-multiple"
            size={24}
            color={selectedCategory === 'plugin' ? COLORS.electricBlue : COLORS.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              selectedCategory === 'plugin' && styles.tabTextActive,
            ]}
          >
            {t.studioInventory.plugins.title}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Inventory Items */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {allItems.map((item) => {
          const owned = isOwned(item.id);
          return (
            <LinearGradient
              key={item.id}
              colors={getRarityGradient(item.rarity)}
              style={styles.itemCard}
            >
              <View style={styles.itemHeader}>
                <View style={[styles.iconContainer, { borderColor: getRarityColor(item.rarity) }]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={40}
                    color={getRarityColor(item.rarity)}
                  />
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.rarityBadge}>
                    <Text style={[styles.rarityText, { color: getRarityColor(item.rarity) }]}>
                      {item.rarity.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.itemDescription}>{item.description}</Text>

              <View style={styles.itemStats}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="arrow-up-bold" size={20} color={COLORS.neonGreen} />
                  <Text style={styles.statText}>+{item.qualityBoost}% Qualité</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="cash" size={20} color={COLORS.gold24K} />
                  <Text style={styles.statText}>{item.cost.toLocaleString()}€</Text>
                </View>
              </View>

              {owned ? (
                <View style={styles.ownedBadge}>
                  <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.ownedText}>{t.studioInventory.owned}</Text>
                </View>
              ) : (
                <Button
                  title={`${t.studioInventory.purchase} - ${item.cost.toLocaleString()}€`}
                  onPress={() => handlePurchase(item)}
                  variant="electric"
                  size="sm"
                />
              )}
            </LinearGradient>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  qualityCard: {
    marginBottom: SIZES.spacing.lg,
    padding: SIZES.spacing.lg,
  },
  qualityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  qualityInfo: {
    marginLeft: SIZES.spacing.md,
    flex: 1,
  },
  qualityLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  qualityValue: {
    fontSize: SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.electricBlue,
  },
  qualityBar: {
    height: 12,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
    backgroundColor: COLORS.electricBlue,
    borderRadius: 6,
  },
  tabs: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginBottom: SIZES.spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.lg,
    gap: SIZES.spacing.sm,
  },
  tabActive: {
    backgroundColor: COLORS.surfaceLight,
    borderColor: COLORS.electricBlue,
    borderWidth: 2,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  tabTextActive: {
    color: COLORS.electricBlue,
  },
  scrollView: {
    flex: 1,
  },
  itemCard: {
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.surfaceDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  itemName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  rarityBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: SIZES.spacing.sm,
    backgroundColor: COLORS.surfaceDark,
    borderRadius: SIZES.radius.sm,
  },
  rarityText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    letterSpacing: 1,
  },
  itemDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SIZES.spacing.md,
  },
  itemStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  ownedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.neonGreen + '20',
    borderRadius: SIZES.radius.md,
  },
  ownedText: {
    color: COLORS.neonGreen,
    fontWeight: '700',
    fontSize: SIZES.md,
  },
});
