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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/hooks/useLocale';
import { Contract, StudioRoom } from '@/types/game';
import { ProfitLossDashboard } from '@/components/ProfitLossDashboard';
import { StudioInventory } from '@/components/StudioInventory';

export default function LabelScreen() {
  const t = useLocale();
  const { gameState, updateGameState } = useGame();
  const [selectedTab, setSelectedTab] = useState<'equipment' | 'rooms' | 'contracts' | 'pnl' | 'inventory'>('equipment');

  if (!gameState) return null;

  const { artist, studio, contracts = [] } = gameState;

  const equipmentList = [
    {
      id: 'u87',
      name: 'Neumann U87',
      description: t.label.equipment.u87.description,
      type: 'microphone',
      cost: 15000,
      quality: 9,
      icon: 'microphone',
    },
    {
      id: 'ssl',
      name: 'Console SSL',
      description: t.label.equipment.ssl.description,
      type: 'console',
      cost: 50000,
      quality: 10,
      icon: 'mixer',
    },
    {
      id: 'neve',
      name: 'Console Neve',
      description: t.label.equipment.neve.description,
      type: 'console',
      cost: 75000,
      quality: 10,
      icon: 'tune',
    },
  ];

  const roomsList = [
    {
      id: 'vocal-booth',
      name: t.label.rooms.vocalBooth.name,
      description: t.label.rooms.vocalBooth.description,
      type: 'vocal-booth' as const,
      cost: 25000,
      boost: 15,
    },
    {
      id: 'live-room',
      name: t.label.rooms.liveRoom.name,
      description: t.label.rooms.liveRoom.description,
      type: 'live-room' as const,
      cost: 40000,
      boost: 20,
    },
    {
      id: 'writing-room',
      name: t.label.rooms.writingRoom.name,
      description: t.label.rooms.writingRoom.description,
      type: 'writing-room' as const,
      cost: 30000,
      boost: 25,
    },
  ];

  const contractTemplates = [
    {
      type: 'distribution' as const,
      partner: 'Universal Music',
      royaltyRate: 0.12,
      value: 100000,
      duration: 24,
    },
    {
      type: 'licensing' as const,
      partner: 'Sony Publishing',
      royaltyRate: 0.15,
      value: 50000,
      duration: 12,
    },
    {
      type: 'publishing' as const,
      partner: 'Warner Chappell',
      royaltyRate: 0.20,
      value: 75000,
      duration: 36,
    },
  ];

  const handlePurchaseEquipment = async (equipment: any) => {
    if (artist.money < equipment.cost) {
      Alert.alert(t.messages.insufficientFunds, `Coût: ${equipment.cost}€`);
      return;
    }

    const ownedEquipment = studio.equipment.find(e => e.id === equipment.id);
    if (ownedEquipment) {
      Alert.alert('Déjà possédé', 'Vous possédez déjà cet équipement');
      return;
    }

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - equipment.cost,
      },
      studio: {
        ...studio,
        equipment: [
          ...studio.equipment,
          {
            id: equipment.id,
            name: equipment.name,
            type: equipment.type,
            quality: equipment.quality,
            cost: equipment.cost,
          },
        ],
        quality: Math.min(studio.quality + 1, 10),
        soundFidelity: (studio.soundFidelity || 50) + 10,
      },
    });

    Alert.alert(t.common.success, `${equipment.name} acheté avec succès !`);
  };

  const handleBuildRoom = async (room: any) => {
    if (artist.money < room.cost) {
      Alert.alert(t.messages.insufficientFunds, `Coût: ${room.cost}€`);
      return;
    }

    const ownedRoom = (studio.rooms || []).find(r => r.id === room.id);
    if (ownedRoom) {
      Alert.alert('Déjà construite', 'Cette salle existe déjà');
      return;
    }

    const newRoom: StudioRoom = {
      id: room.id,
      name: room.name,
      type: room.type,
      level: 1,
      boost: room.boost,
      owned: true,
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - room.cost,
      },
      studio: {
        ...studio,
        rooms: [...(studio.rooms || []), newRoom],
      },
    });

    Alert.alert(t.common.success, `${room.name} construite !`);
  };

  const handleSignContract = async (template: any) => {
    if (contracts.find(c => c.type === template.type && c.signed)) {
      Alert.alert('Contrat existant', 'Vous avez déjà un contrat de ce type');
      return;
    }

    const newContract: Contract = {
      id: Date.now().toString(),
      type: template.type,
      partner: template.partner,
      royaltyRate: template.royaltyRate,
      value: template.value,
      duration: template.duration,
      signed: true,
      earnings: 0,
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money + template.value,
        prestige: artist.prestige + 10,
      },
      contracts: [...contracts, newContract],
    });

    Alert.alert(t.notifications.contractSigned, `Contrat signé avec ${template.partner} !`);
  };

  const handleInventoryPurchase = async (itemId: string, cost: number, qualityBoost: number) => {
    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - cost,
      },
      studio: {
        ...studio,
        upgrades: [
          ...(studio.upgrades || []),
          {
            id: itemId,
            name: itemId,
            level: 1,
            cost,
            benefit: `+${qualityBoost}% qualité`,
          },
        ],
        soundFidelity: Math.min((studio.soundFidelity || 50) + qualityBoost, 100),
      },
    });

    Alert.alert(t.common.success, 'Équipement acheté avec succès !');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t.label.title}</Text>
          <View style={styles.fidelityBadge}>
            <MaterialCommunityIcons name="music-note" size={20} color={COLORS.gold} />
            <Text style={styles.fidelityText}>
              {t.label.soundFidelity}: {studio.soundFidelity || 50}%
            </Text>
          </View>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'pnl' && styles.tabActive]}
              onPress={() => setSelectedTab('pnl')}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color={selectedTab === 'pnl' ? COLORS.gold24K : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'pnl' && styles.tabTextActive,
                ]}
              >
                P&L
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'inventory' && styles.tabActive]}
              onPress={() => setSelectedTab('inventory')}
            >
              <MaterialCommunityIcons
                name="toolbox"
                size={20}
                color={selectedTab === 'inventory' ? COLORS.gold24K : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'inventory' && styles.tabTextActive,
                ]}
              >
                Inventaire
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'equipment' && styles.tabActive]}
              onPress={() => setSelectedTab('equipment')}
            >
              <MaterialCommunityIcons
                name="microphone"
                size={20}
                color={selectedTab === 'equipment' ? COLORS.gold24K : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'equipment' && styles.tabTextActive,
                ]}
              >
                {t.label.equipment.title}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'rooms' && styles.tabActive]}
              onPress={() => setSelectedTab('rooms')}
            >
              <MaterialCommunityIcons
                name="office-building"
                size={20}
                color={selectedTab === 'rooms' ? COLORS.gold24K : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'rooms' && styles.tabTextActive,
                ]}
              >
                {t.label.specializedRooms}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, selectedTab === 'contracts' && styles.tabActive]}
              onPress={() => setSelectedTab('contracts')}
            >
              <MaterialCommunityIcons
                name="file-document"
                size={20}
                color={selectedTab === 'contracts' ? COLORS.gold24K : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === 'contracts' && styles.tabTextActive,
                ]}
              >
                {t.label.contracts}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* P&L Dashboard Tab */}
        {selectedTab === 'pnl' && (
          <ProfitLossDashboard gameState={gameState} />
        )}

        {/* Studio Inventory Tab */}
        {selectedTab === 'inventory' && (
          <StudioInventory gameState={gameState} onPurchase={handleInventoryPurchase} />
        )}

        {/* Equipment Tab */}
        {selectedTab === 'equipment' && (
          <View>
            <Text style={styles.sectionTitle}>{t.label.infrastructure}</Text>
            {equipmentList.map((equipment) => {
              const owned = studio.equipment.find(e => e.id === equipment.id);
              return (
                <Card key={equipment.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <MaterialCommunityIcons
                      name={equipment.icon as any}
                      size={40}
                      color={owned ? COLORS.neonGreen : COLORS.neonPurple}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{equipment.name}</Text>
                      <Text style={styles.itemDescription}>{equipment.description}</Text>
                      <View style={styles.itemStats}>
                        <View style={styles.statBadge}>
                          <Text style={styles.statBadgeText}>Qualité: {equipment.quality}/10</Text>
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
                      title={`Acheter - ${equipment.cost.toLocaleString()}€`}
                      onPress={() => handlePurchaseEquipment(equipment)}
                      variant="gold"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Rooms Tab */}
        {selectedTab === 'rooms' && (
          <View>
            <Text style={styles.sectionTitle}>{t.label.specializedRooms}</Text>
            {roomsList.map((room) => {
              const owned = (studio.rooms || []).find(r => r.id === room.id);
              return (
                <Card key={room.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <MaterialCommunityIcons
                      name="door"
                      size={40}
                      color={owned ? COLORS.neonGreen : COLORS.neonCyan}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{room.name}</Text>
                      <Text style={styles.itemDescription}>{room.description}</Text>
                      <View style={styles.itemStats}>
                        <View style={styles.statBadge}>
                          <Text style={styles.statBadgeText}>Boost: +{room.boost}%</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {owned ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Construite</Text>
                    </View>
                  ) : (
                    <Button
                      title={`Construire - ${room.cost.toLocaleString()}€`}
                      onPress={() => handleBuildRoom(room)}
                      variant="neon"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Contracts Tab */}
        {selectedTab === 'contracts' && (
          <View>
            <Text style={styles.sectionTitle}>{t.label.contracts}</Text>

            {/* Active Contracts */}
            {contracts.filter(c => c.signed).length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Contrats Actifs</Text>
                {contracts
                  .filter(c => c.signed)
                  .map((contract) => (
                    <Card key={contract.id} style={styles.contractCard}>
                      <View style={styles.contractHeader}>
                        <MaterialCommunityIcons
                          name="file-document-check"
                          size={32}
                          color={COLORS.neonGreen}
                        />
                        <View style={styles.contractInfo}>
                          <Text style={styles.contractPartner}>{contract.partner}</Text>
                          <Text style={styles.contractType}>
                            {t.label.contractTypes[contract.type]}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.contractDetails}>
                        <View style={styles.contractStat}>
                          <Text style={styles.contractLabel}>{t.label.royalties}:</Text>
                          <Text style={styles.contractValue}>
                            {(contract.royaltyRate * 100).toFixed(0)}%
                          </Text>
                        </View>
                        <View style={styles.contractStat}>
                          <Text style={styles.contractLabel}>Valeur:</Text>
                          <Text style={styles.contractValue}>
                            {contract.value.toLocaleString()}€
                          </Text>
                        </View>
                        <View style={styles.contractStat}>
                          <Text style={styles.contractLabel}>Durée:</Text>
                          <Text style={styles.contractValue}>{contract.duration} mois</Text>
                        </View>
                      </View>
                    </Card>
                  ))}
              </>
            )}

            {/* Available Contracts */}
            <Text style={styles.subsectionTitle}>Contrats Disponibles</Text>
            {contractTemplates.map((template, index) => {
              const hasContract = contracts.find(
                c => c.type === template.type && c.signed
              );
              return (
                <Card key={index} style={styles.contractCard}>
                  <View style={styles.contractHeader}>
                    <MaterialCommunityIcons
                      name="file-document-outline"
                      size={32}
                      color={COLORS.gold}
                    />
                    <View style={styles.contractInfo}>
                      <Text style={styles.contractPartner}>{template.partner}</Text>
                      <Text style={styles.contractType}>
                        {t.label.contractTypes[template.type]}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.contractDetails}>
                    <View style={styles.contractStat}>
                      <Text style={styles.contractLabel}>{t.label.royalties}:</Text>
                      <Text style={styles.contractValue}>
                        {(template.royaltyRate * 100).toFixed(0)}%
                      </Text>
                    </View>
                    <View style={styles.contractStat}>
                      <Text style={styles.contractLabel}>Avance:</Text>
                      <Text style={styles.contractValue}>
                        {template.value.toLocaleString()}€
                      </Text>
                    </View>
                    <View style={styles.contractStat}>
                      <Text style={styles.contractLabel}>Durée:</Text>
                      <Text style={styles.contractValue}>{template.duration} mois</Text>
                    </View>
                  </View>
                  {hasContract ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Signé</Text>
                    </View>
                  ) : (
                    <Button
                      title="Signer le Contrat"
                      onPress={() => handleSignContract(template)}
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
    color: COLORS.gold,
  },
  fidelityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  fidelityText: {
    color: COLORS.gold,
    fontWeight: '600',
    marginLeft: SIZES.spacing.xs,
    fontSize: SIZES.sm,
  },
  tabsScroll: {
    marginBottom: SIZES.spacing.xl,
  },
  tabs: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    paddingRight: SIZES.spacing.lg,
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
    fontSize: SIZES.xs,
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
  itemCard: {
    marginBottom: SIZES.spacing.md,
  },
  itemHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  itemInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  itemName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.sm,
  },
  itemStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  statBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius.sm,
  },
  statBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.neonPurple,
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
  contractCard: {
    marginBottom: SIZES.spacing.md,
  },
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  contractInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  contractPartner: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  contractType: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  contractDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.md,
  },
  contractStat: {
    alignItems: 'center',
  },
  contractLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  contractValue: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
});
