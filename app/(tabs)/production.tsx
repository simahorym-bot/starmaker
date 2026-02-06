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
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/hooks/useLocale';
import { MusicVideo, FashionLine, PopupStore } from '@/types/game';
import { TrophyWall } from '@/components/TrophyWall';

export default function ProductionScreen() {
  const t = useLocale();
  const { gameState, updateGameState } = useGame();
  const [selectedTab, setSelectedTab] = useState<'video' | 'fashion' | 'legacy' | 'trophies'>('video');

  if (!gameState) return null;

  const { artist, songs, awards = [], fashionLines = [], popupStores = [], retirementProgress = 0 } = gameState;

  const directors = [
    {
      id: 'lune-nerer',
      name: 'Lune Nerer',
      specialty: 'Clips Cinématiques',
      quality: 9,
      cost: 50000,
      image: '🎬',
    },
    {
      id: 'yung-bemov',
      name: 'Yung Bemov',
      specialty: 'Style Urbain',
      quality: 8,
      cost: 35000,
      image: '📹',
    },
    {
      id: 'jonno-bosh',
      name: 'Jonno Bosh',
      specialty: 'Avant-Garde',
      quality: 10,
      cost: 75000,
      image: '🎥',
    },
  ];

  const fashionCategories = [
    {
      type: 'tshirt' as const,
      name: 'T-Shirts',
      basePrice: 35,
      icon: 'tshirt-crew',
    },
    {
      type: 'hoodie' as const,
      name: 'Hoodies',
      basePrice: 75,
      icon: 'hanger',
    },
    {
      type: 'jacket' as const,
      name: 'Vestes',
      basePrice: 150,
      icon: 'coat-rack',
    },
    {
      type: 'accessories' as const,
      name: 'Accessoires',
      basePrice: 45,
      icon: 'sunglasses',
    },
  ];

  const availableCities: Array<'Paris' | 'Tokyo' | 'NYC' | 'London' | 'Milan'> = [
    'Paris',
    'Tokyo',
    'NYC',
    'London',
    'Milan',
  ];

  const handleCreateMusicVideo = async (director: any, songId: string) => {
    if (artist.money < director.cost) {
      Alert.alert(t.messages.insufficientFunds, `Budget nécessaire: ${director.cost.toLocaleString()}€`);
      return;
    }

    if (!songId) {
      Alert.alert('Aucune Chanson', 'Créez d\'abord une chanson dans le studio');
      return;
    }

    const video: MusicVideo = {
      id: Date.now().toString(),
      director: director.name,
      budget: director.cost,
      views: 0,
      quality: director.quality * 10,
    };

    const updatedSongs = songs.map(s =>
      s.id === songId ? { ...s, musicVideo: video } : s
    );

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - director.cost,
        prestige: artist.prestige + director.quality * 5,
      },
      songs: updatedSongs,
    });

    Alert.alert(
      t.common.success,
      `Clip tourné avec ${director.name} ! +${director.quality * 5} Prestige`
    );
  };

  const handleCreateFashionLine = async () => {
    const lineCost = 50000;
    if (artist.money < lineCost) {
      Alert.alert(t.messages.insufficientFunds, `Coût: ${lineCost.toLocaleString()}€`);
      return;
    }

    const newLine: FashionLine = {
      id: Date.now().toString(),
      name: `Collection ${artist.stageName} ${new Date().getFullYear()}`,
      pieces: [],
      launched: true,
      revenue: 0,
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - lineCost,
        prestige: artist.prestige + 30,
      },
      fashionLines: [...fashionLines, newLine],
    });

    Alert.alert(t.common.success, 'Ligne de mode lancée ! +30 Prestige');
  };

  const handleOpenPopupStore = async (city: 'Paris' | 'Tokyo' | 'NYC' | 'London' | 'Milan') => {
    const storeCost = 25000;
    if (artist.money < storeCost) {
      Alert.alert(t.messages.insufficientFunds, `Coût: ${storeCost.toLocaleString()}€`);
      return;
    }

    const existing = popupStores.find(s => s.city === city && s.opened);
    if (existing) {
      Alert.alert('Déjà Ouvert', `Vous avez déjà une boutique à ${city}`);
      return;
    }

    const newStore: PopupStore = {
      id: Date.now().toString(),
      city,
      opened: true,
      revenue: 0,
      duration: 30,
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - storeCost,
      },
      popupStores: [...popupStores, newStore],
    });

    Alert.alert(t.common.success, `Boutique éphémère ouverte à ${city} !`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.production.title}</Text>
            <Text style={styles.subtitle}>Créez votre empire créatif</Text>
          </View>
          <View style={styles.legacyBadge}>
            <MaterialCommunityIcons name="trophy" size={20} color={COLORS.gold} />
            <Text style={styles.legacyText}>{artist.prestige} Prestige</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'video' && styles.tabActive]}
            onPress={() => setSelectedTab('video')}
          >
            <MaterialCommunityIcons
              name="video"
              size={20}
              color={selectedTab === 'video' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'video' && styles.tabTextActive,
              ]}
            >
              {t.production.musicVideo.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'fashion' && styles.tabActive]}
            onPress={() => setSelectedTab('fashion')}
          >
            <MaterialCommunityIcons
              name="hanger"
              size={20}
              color={selectedTab === 'fashion' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'fashion' && styles.tabTextActive,
              ]}
            >
              {t.production.fashion.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'trophies' && styles.tabActive]}
            onPress={() => setSelectedTab('trophies')}
          >
            <MaterialCommunityIcons
              name="trophy-variant"
              size={20}
              color={selectedTab === 'trophies' ? COLORS.gold24K : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'trophies' && styles.tabTextActive,
              ]}
            >
              Trophées
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'legacy' && styles.tabActive]}
            onPress={() => setSelectedTab('legacy')}
          >
            <MaterialCommunityIcons
              name="star-box"
              size={20}
              color={selectedTab === 'legacy' ? COLORS.gold24K : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'legacy' && styles.tabTextActive,
              ]}
            >
              Héritage
            </Text>
          </TouchableOpacity>
        </View>

        {/* Music Video Tab */}
        {selectedTab === 'video' && (
          <View>
            <Text style={styles.sectionTitle}>{t.production.musicVideo.title}</Text>

            {/* Director Selection */}
            <Text style={styles.subsectionTitle}>{t.production.musicVideo.directorChoice}</Text>
            {directors.map((director) => (
              <Card key={director.id} style={styles.directorCard}>
                <View style={styles.directorHeader}>
                  <Text style={styles.directorIcon}>{director.image}</Text>
                  <View style={styles.directorInfo}>
                    <Text style={styles.directorName}>{director.name}</Text>
                    <Text style={styles.directorSpecialty}>{director.specialty}</Text>
                    <View style={styles.directorStats}>
                      <View style={styles.directorStat}>
                        <MaterialCommunityIcons name="star" size={16} color={COLORS.gold} />
                        <Text style={styles.directorStatText}>Qualité: {director.quality}/10</Text>
                      </View>
                      <View style={styles.directorStat}>
                        <MaterialCommunityIcons name="cash" size={16} color={COLORS.neonGreen} />
                        <Text style={styles.directorStatText}>
                          {director.cost.toLocaleString()}€
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {songs.length > 0 ? (
                  <Button
                    title="Créer un Clip"
                    onPress={() => handleCreateMusicVideo(director, songs[0]?.id)}
                    variant="gold"
                    size="sm"
                  />
                ) : (
                  <Text style={styles.noSongsText}>Créez une chanson d'abord</Text>
                )}
              </Card>
            ))}

            {/* Existing Music Videos */}
            {songs.filter(s => s.musicVideo).length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Vos Clips</Text>
                {songs
                  .filter(s => s.musicVideo)
                  .map((song) => (
                    <Card key={song.id} style={styles.videoCard}>
                      <View style={styles.videoHeader}>
                        <MaterialCommunityIcons
                          name="play-circle"
                          size={50}
                          color={COLORS.neonPurple}
                        />
                        <View style={styles.videoInfo}>
                          <Text style={styles.videoTitle}>{song.title}</Text>
                          <Text style={styles.videoDirector}>
                            Réalisé par {song.musicVideo?.director}
                          </Text>
                          <View style={styles.videoStats}>
                            <View style={styles.videoStat}>
                              <Ionicons name="eye" size={16} color={COLORS.neonCyan} />
                              <Text style={styles.videoStatText}>
                                {(song.musicVideo?.views || 0).toLocaleString()} vues
                              </Text>
                            </View>
                            <View style={styles.videoStat}>
                              <MaterialCommunityIcons
                                name="quality-high"
                                size={16}
                                color={COLORS.gold}
                              />
                              <Text style={styles.videoStatText}>
                                {song.musicVideo?.quality}% qualité
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </Card>
                  ))}
              </>
            )}
          </View>
        )}

        {/* Trophy Wall Tab */}
        {selectedTab === 'trophies' && (
          <TrophyWall gameState={gameState} />
        )}

        {/* Fashion Tab */}
        {selectedTab === 'fashion' && (
          <View>
            <Text style={styles.sectionTitle}>{t.production.fashion.title}</Text>

            {/* Fashion Studio */}
            <Card style={styles.fashionStudioCard}>
              <View style={styles.studioHeader}>
                <MaterialCommunityIcons name="palette" size={40} color={COLORS.neonPurple} />
                <View style={styles.studioInfo}>
                  <Text style={styles.studioTitle}>{t.production.fashion.designStudio}</Text>
                  <Text style={styles.studioDesc}>
                    Créez votre propre ligne de vêtements
                  </Text>
                </View>
              </View>
              <Button
                title={`${t.production.fashion.clothingLine} - 50 000€`}
                onPress={handleCreateFashionLine}
                variant="gold"
                size="sm"
              />
            </Card>

            {/* Fashion Lines */}
            {fashionLines.length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Vos Collections</Text>
                {fashionLines.map((line) => (
                  <Card key={line.id} style={styles.fashionCard}>
                    <View style={styles.fashionHeader}>
                      <MaterialCommunityIcons
                        name="hanger"
                        size={40}
                        color={COLORS.gold}
                      />
                      <View style={styles.fashionInfo}>
                        <Text style={styles.fashionName}>{line.name}</Text>
                        <Text style={styles.fashionRevenue}>
                          Revenus: {line.revenue.toLocaleString()}€
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </>
            )}

            {/* E-Shop */}
            <Text style={styles.subsectionTitle}>{t.production.fashion.eshop}</Text>
            <Card style={styles.eshopCard}>
              <Text style={styles.eshopTitle}>Boutique en Ligne</Text>
              <Text style={styles.eshopDesc}>
                Vendez vos créations dans le monde entier
              </Text>
              <View style={styles.eshopStats}>
                <View style={styles.eshopStat}>
                  <MaterialCommunityIcons name="cart" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.eshopStatValue}>
                    {fashionLines.reduce((sum, l) => sum + l.revenue, 0).toLocaleString()}€
                  </Text>
                  <Text style={styles.eshopStatLabel}>Ventes Totales</Text>
                </View>
              </View>
            </Card>

            {/* Popup Stores */}
            <Text style={styles.subsectionTitle}>{t.production.fashion.popupStores}</Text>
            {availableCities.map((city) => {
              const store = popupStores.find(s => s.city === city && s.opened);
              return (
                <Card key={city} style={styles.popupCard}>
                  <View style={styles.popupHeader}>
                    <MaterialCommunityIcons
                      name="store"
                      size={40}
                      color={store ? COLORS.neonGreen : COLORS.neonPurple}
                    />
                    <View style={styles.popupInfo}>
                      <Text style={styles.popupCity}>{city}</Text>
                      {store ? (
                        <>
                          <Text style={styles.popupRevenue}>
                            Revenus: {store.revenue.toLocaleString()}€
                          </Text>
                          <Text style={styles.popupDuration}>
                            {store.duration} jours restants
                          </Text>
                        </>
                      ) : (
                        <Text style={styles.popupStatus}>Non ouvert</Text>
                      )}
                    </View>
                  </View>
                  {!store && (
                    <Button
                      title="Ouvrir - 25 000€"
                      onPress={() => handleOpenPopupStore(city)}
                      variant="neon"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Legacy Tab */}
        {selectedTab === 'legacy' && (
          <View>
            <Text style={styles.sectionTitle}>{t.production.hallOfFame.title}</Text>

            {/* Hall of Fame */}
            <Card style={styles.hofCard}>
              <View style={styles.hofGrid}>
                <View style={styles.hofItem}>
                  <Text style={styles.hofIcon}>🏆</Text>
                  <Text style={styles.hofLabel}>{t.production.hallOfFame.awards}</Text>
                  <Text style={styles.hofValue}>{awards.filter(a => a.won).length}</Text>
                </View>
                <View style={styles.hofItem}>
                  <Text style={styles.hofIcon}>⭐</Text>
                  <Text style={styles.hofLabel}>{t.production.hallOfFame.achievements}</Text>
                  <Text style={styles.hofValue}>{artist.level * 2}</Text>
                </View>
                <View style={styles.hofItem}>
                  <Text style={styles.hofIcon}>💿</Text>
                  <Text style={styles.hofLabel}>Disques</Text>
                  <Text style={styles.hofValue}>{songs.length}</Text>
                </View>
                <View style={styles.hofItem}>
                  <Text style={styles.hofIcon}>⭐</Text>
                  <Text style={styles.hofLabel}>Étoile</Text>
                  <Text style={styles.hofValue}>{artist.prestige}</Text>
                </View>
              </View>
            </Card>

            {/* Awards */}
            <Text style={styles.subsectionTitle}>Trophées & Distinctions</Text>
            <Card style={styles.awardsCard}>
              <View style={styles.awardsList}>
                {[
                  { name: 'Meilleur Artiste', year: 2026, won: artist.level >= 10 },
                  { name: 'Album de l\'Année', year: 2026, won: songs.length >= 5 },
                  { name: 'Chanson de l\'Année', year: 2026, won: songs.some(s => s.quality > 90) },
                  { name: 'Révélation', year: 2025, won: artist.level >= 5 },
                ].map((award, index) => (
                  <View key={index} style={styles.awardItem}>
                    <MaterialCommunityIcons
                      name={award.won ? 'trophy' : 'trophy-outline'}
                      size={32}
                      color={award.won ? COLORS.gold : COLORS.textSecondary}
                    />
                    <View style={styles.awardInfo}>
                      <Text style={styles.awardName}>{award.name}</Text>
                      <Text style={styles.awardYear}>{award.year}</Text>
                    </View>
                    {award.won && (
                      <View style={styles.wonBadge}>
                        <Text style={styles.wonText}>Remporté</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Card>

            {/* Retirement Plan */}
            <Text style={styles.subsectionTitle}>{t.production.retirement.title}</Text>
            <Card style={styles.retirementCard}>
              <Text style={styles.retirementTitle}>Planification de la Retraite</Text>
              <Text style={styles.retirementDesc}>
                Construisez un héritage durable pour garantir votre avenir
              </Text>
              <ProgressBar
                progress={retirementProgress}
                label="Progression vers la retraite"
                showPercentage
                color={COLORS.gold}
                style={{ marginTop: SIZES.spacing.md }}
              />
              <View style={styles.retirementGoals}>
                <Text style={styles.goalsTitle}>{t.production.retirement.goals}:</Text>
                <View style={styles.goal}>
                  <Ionicons
                    name={artist.money >= 10000000 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={artist.money >= 10000000 ? COLORS.neonGreen : COLORS.textSecondary}
                  />
                  <Text style={styles.goalText}>Accumuler 10M€</Text>
                </View>
                <View style={styles.goal}>
                  <Ionicons
                    name={songs.length >= 20 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={songs.length >= 20 ? COLORS.neonGreen : COLORS.textSecondary}
                  />
                  <Text style={styles.goalText}>Sortir 20 chansons</Text>
                </View>
                <View style={styles.goal}>
                  <Ionicons
                    name={awards.length >= 5 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={awards.length >= 5 ? COLORS.neonGreen : COLORS.textSecondary}
                  />
                  <Text style={styles.goalText}>Gagner 5 trophées</Text>
                </View>
                <View style={styles.goal}>
                  <Ionicons
                    name={artist.prestige >= 500 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={artist.prestige >= 500 ? COLORS.neonGreen : COLORS.textSecondary}
                  />
                  <Text style={styles.goalText}>Atteindre 500 Prestige</Text>
                </View>
              </View>
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
    color: COLORS.gold,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  legacyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.xs,
  },
  legacyText: {
    color: COLORS.gold,
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
  directorCard: {
    marginBottom: SIZES.spacing.md,
  },
  directorHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  directorIcon: {
    fontSize: 60,
  },
  directorInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
    justifyContent: 'center',
  },
  directorName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  directorSpecialty: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  directorStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  directorStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  directorStatText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  noSongsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  videoCard: {
    marginBottom: SIZES.spacing.md,
  },
  videoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  videoTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  videoDirector: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  videoStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  videoStatText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  fashionStudioCard: {
    marginBottom: SIZES.spacing.lg,
  },
  studioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  studioInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  studioTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  studioDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  fashionCard: {
    marginBottom: SIZES.spacing.md,
  },
  fashionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fashionInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  fashionName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  fashionRevenue: {
    fontSize: SIZES.sm,
    color: COLORS.neonGreen,
    fontWeight: '600',
  },
  eshopCard: {
    marginBottom: SIZES.spacing.lg,
  },
  eshopTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eshopDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.md,
  },
  eshopStats: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  eshopStat: {
    alignItems: 'center',
  },
  eshopStatValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.neonGreen,
    marginTop: SIZES.spacing.xs,
  },
  eshopStatLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  popupCard: {
    marginBottom: SIZES.spacing.md,
  },
  popupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  popupInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  popupCity: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  popupRevenue: {
    fontSize: SIZES.sm,
    color: COLORS.neonGreen,
    fontWeight: '600',
  },
  popupDuration: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  popupStatus: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  hofCard: {
    marginBottom: SIZES.spacing.lg,
  },
  hofGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hofItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  hofIcon: {
    fontSize: 50,
    marginBottom: SIZES.spacing.xs,
  },
  hofLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  hofValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  awardsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  awardsList: {
    gap: SIZES.spacing.md,
  },
  awardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
  },
  awardInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  awardName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  awardYear: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  wonBadge: {
    backgroundColor: COLORS.gold,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius.sm,
  },
  wonText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: '#000',
  },
  retirementCard: {
    marginBottom: SIZES.spacing.lg,
  },
  retirementTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  retirementDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.md,
    lineHeight: 18,
  },
  retirementGoals: {
    marginTop: SIZES.spacing.lg,
  },
  goalsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  goalText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
});
