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
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocale } from '@/hooks/useLocale';
import { useTextGeneration } from '@fastshot/ai';
import { Relationship } from '@/types/game';

export default function RelationshipsScreen() {
  const t = useLocale();
  const { gameState, updateGameState } = useGame();
  const { generateText, isLoading: aiLoading } = useTextGeneration();
  const [selectedTab, setSelectedTab] = useState<'collaborations' | 'rivalry' | 'entourage'>(
    'collaborations'
  );
  const [generatedComments, setGeneratedComments] = useState<{ [key: string]: string[] }>({});

  if (!gameState) return null;

  const { artist, relationships = [] } = gameState;

  const availableArtists = [
    {
      id: 'luna-nova',
      name: 'Luna Nova',
      genre: 'Pop',
      affinity: 30,
      fanCount: '7M',
      image: '👩‍🎤',
    },
    {
      id: 'asenta-bolle',
      name: 'Asenta Bolle',
      genre: 'R&B',
      affinity: 25,
      fanCount: '9M',
      image: '🧑‍🎤',
    },
    {
      id: 'atsmi',
      name: 'ATSMI',
      genre: 'Hip Hop',
      affinity: 30,
      fanCount: '5M',
      image: '🎤',
    },
  ];

  const handleCollaborate = async (otherArtist: any) => {
    const existing = relationships.find(
      r => r.name === otherArtist.name && r.type === 'collaboration'
    );

    if (existing) {
      Alert.alert('Déjà Collaboré', 'Vous avez déjà collaboré avec cet artiste');
      return;
    }

    if (artist.energy < 20) {
      Alert.alert(t.messages.notEnoughEnergy, 'Vous avez besoin de 20 énergie');
      return;
    }

    const newRelationship: Relationship = {
      id: Date.now().toString(),
      name: otherArtist.name,
      type: 'collaboration',
      affinity: otherArtist.affinity,
      interactions: 1,
      impactOnCareer: 'positive',
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        energy: artist.energy - 20,
        reputation: artist.reputation + 10,
        prestige: artist.prestige + 15,
      },
      relationships: [...relationships, newRelationship],
    });

    Alert.alert(
      t.common.success,
      `Collaboration avec ${otherArtist.name} réussie ! +10 Réputation, +15 Prestige`
    );
  };

  const handleGenerateRivalryComments = async (rivalName: string) => {
    if (generatedComments[rivalName]) {
      return; // Already generated
    }

    try {
      const prompt = `Génère 3 commentaires de fans français sur une rivalité musicale entre ${artist.stageName} et ${rivalName}. Les commentaires doivent être variés : certains soutiennent ${artist.stageName}, d'autres ${rivalName}, et certains sont neutres. Fais-les courts et authentiques comme de vrais commentaires de fans sur les réseaux sociaux. Format: un commentaire par ligne, sans numéros.`;

      const response = await generateText(prompt);
      const comments = (response || '').split('\n').filter(c => c.trim().length > 0).slice(0, 3);

      setGeneratedComments({
        ...generatedComments,
        [rivalName]: comments,
      });
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de générer les commentaires');
    }
  };

  const handleCreateRivalry = async (otherArtist: any) => {
    const existing = relationships.find(
      r => r.name === otherArtist.name && r.type === 'rivalry'
    );

    if (existing) {
      Alert.alert('Rivalité Existante', 'Vous avez déjà une rivalité avec cet artiste');
      return;
    }

    const newRelationship: Relationship = {
      id: Date.now().toString(),
      name: otherArtist.name,
      type: 'rivalry',
      affinity: -20,
      interactions: 1,
      aiGenerated: true,
      impactOnCareer: 'positive', // Rivalry can boost visibility
    };

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        prestige: artist.prestige + 20, // Controversy boosts prestige
      },
      relationships: [...relationships, newRelationship],
    });

    // Generate comments immediately
    await handleGenerateRivalryComments(otherArtist.name);

    Alert.alert(
      'Rivalité Créée !',
      `La rivalité avec ${otherArtist.name} fait le buzz ! +20 Prestige`
    );
  };

  const handleRespondToRivalry = async (rivalName: string) => {
    Alert.alert(
      'Réponse à la Rivalité',
      'Choisissez votre stratégie',
      [
        {
          text: 'Ignorer',
          onPress: () => Alert.alert('Sagesse', 'Vous gardez votre calme'),
        },
        {
          text: 'Contre-attaquer',
          onPress: async () => {
            await updateGameState({
              ...gameState,
              artist: {
                ...artist,
                prestige: artist.prestige + 10,
              },
            });
            Alert.alert('Contre-Attaque !', 'Les fans adorent ! +10 Prestige');
          },
        },
        {
          text: 'Faire la Paix',
          onPress: async () => {
            const rivalry = relationships.find(
              r => r.name === rivalName && r.type === 'rivalry'
            );
            if (rivalry) {
              await updateGameState({
                ...gameState,
                relationships: relationships.map(r =>
                  r.id === rivalry.id ? { ...r, type: 'collaboration' as const, affinity: 50 } : r
                ),
                artist: {
                  ...artist,
                  reputation: artist.reputation + 15,
                },
              });
              Alert.alert('Réconciliation', 'Les fans respectent votre maturité ! +15 Réputation');
            }
          },
        },
      ]
    );
  };

  const entourageMembers = [
    {
      id: 'luna-nova-friend',
      name: 'Luna Nova',
      type: 'entourage' as const,
      description: 'Amie proche et confidente',
      moralImpact: 'positive' as const,
      affinity: 80,
    },
    {
      id: 'alex-rica',
      name: 'Alex Rica',
      type: 'entourage' as const,
      description: 'Partenaire romantique',
      moralImpact: 'positive' as const,
      affinity: 90,
    },
    {
      id: 'luna-wanny',
      name: 'Luna Wanny',
      type: 'entourage' as const,
      description: 'Mentor et conseiller',
      moralImpact: 'positive' as const,
      affinity: 75,
    },
  ];

  const handleAddToEntourage = async (member: any) => {
    const existing = relationships.find(r => r.name === member.name && r.type === 'entourage');

    if (existing) {
      Alert.alert('Déjà dans l\'Entourage', 'Cette personne fait déjà partie de votre entourage');
      return;
    }

    const newRelationship: Relationship = {
      id: Date.now().toString(),
      name: member.name,
      type: member.type,
      affinity: member.affinity,
      interactions: 1,
      impactOnCareer: member.moralImpact,
    };

    await updateGameState({
      ...gameState,
      relationships: [...relationships, newRelationship],
      artist: {
        ...artist,
        reputation: artist.reputation + 5,
      },
    });

    Alert.alert(t.common.success, `${member.name} ajouté(e) à votre entourage`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{t.relationships.title}</Text>
            <Text style={styles.subtitle}>Construisez votre réseau</Text>
          </View>
          <View style={styles.networkBadge}>
            <MaterialCommunityIcons name="account-group" size={20} color={COLORS.neonPurple} />
            <Text style={styles.networkText}>{relationships.length} Relations</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'collaborations' && styles.tabActive]}
            onPress={() => setSelectedTab('collaborations')}
          >
            <MaterialCommunityIcons
              name="handshake"
              size={20}
              color={selectedTab === 'collaborations' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'collaborations' && styles.tabTextActive,
              ]}
            >
              {t.relationships.collaborations.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'rivalry' && styles.tabActive]}
            onPress={() => setSelectedTab('rivalry')}
          >
            <MaterialCommunityIcons
              name="sword-cross"
              size={20}
              color={selectedTab === 'rivalry' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'rivalry' && styles.tabTextActive,
              ]}
            >
              {t.relationships.rivalry.title}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, selectedTab === 'entourage' && styles.tabActive]}
            onPress={() => setSelectedTab('entourage')}
          >
            <MaterialCommunityIcons
              name="account-heart"
              size={20}
              color={selectedTab === 'entourage' ? COLORS.gold : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === 'entourage' && styles.tabTextActive,
              ]}
            >
              {t.relationships.entourage.title}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Collaborations Tab */}
        {selectedTab === 'collaborations' && (
          <View>
            <Text style={styles.sectionTitle}>{t.relationships.collaborations.title}</Text>

            {/* Existing Collaborations */}
            {relationships.filter(r => r.type === 'collaboration').length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Collaborations Actives</Text>
                {relationships
                  .filter(r => r.type === 'collaboration')
                  .map((collab) => (
                    <Card key={collab.id} style={styles.relationCard}>
                      <View style={styles.relationHeader}>
                        <Text style={styles.artistIcon}>🎵</Text>
                        <View style={styles.relationInfo}>
                          <Text style={styles.relationName}>{collab.name}</Text>
                          <View style={styles.affinityBar}>
                            <View
                              style={[
                                styles.affinityFill,
                                { width: `${collab.affinity}%` },
                              ]}
                            />
                          </View>
                          <Text style={styles.affinityText}>
                            {t.relationships.collaborations.affinity}: {collab.affinity}%
                          </Text>
                        </View>
                      </View>
                    </Card>
                  ))}
              </>
            )}

            {/* Available Artists */}
            <Text style={styles.subsectionTitle}>{t.relationships.collaborations.artists}</Text>
            {availableArtists.map((artist) => {
              const hasCollab = relationships.find(
                r => r.name === artist.name && r.type === 'collaboration'
              );
              return (
                <Card key={artist.id} style={styles.artistCard}>
                  <View style={styles.artistHeader}>
                    <Text style={styles.artistIcon}>{artist.image}</Text>
                    <View style={styles.artistInfo}>
                      <Text style={styles.artistName}>{artist.name}</Text>
                      <Text style={styles.artistGenre}>{artist.genre}</Text>
                      <View style={styles.artistStats}>
                        <View style={styles.artistStat}>
                          <Ionicons name="people" size={14} color={COLORS.neonPurple} />
                          <Text style={styles.artistStatText}>{artist.fanCount} artistes</Text>
                        </View>
                        <View style={styles.artistStat}>
                          <MaterialCommunityIcons
                            name="heart"
                            size={14}
                            color={COLORS.neonPink}
                          />
                          <Text style={styles.artistStatText}>
                            {t.relationships.collaborations.affinity}: {artist.affinity}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  {hasCollab ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Collaboré</Text>
                    </View>
                  ) : (
                    <Button
                      title={t.relationships.collaborations.invite}
                      onPress={() => handleCollaborate(artist)}
                      variant="gold"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Rivalry Tab */}
        {selectedTab === 'rivalry' && (
          <View>
            <Text style={styles.sectionTitle}>{t.relationships.rivalry.title}</Text>

            {/* Active Rivalries */}
            {relationships.filter(r => r.type === 'rivalry').length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Rivalités Actives</Text>
                {relationships
                  .filter(r => r.type === 'rivalry')
                  .map((rivalry) => (
                    <Card key={rivalry.id} style={styles.rivalryCard}>
                      <View style={styles.rivalryHeader}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={40}
                          color={COLORS.neonPink}
                        />
                        <View style={styles.rivalryInfo}>
                          <Text style={styles.rivalryName}>{rivalry.name}</Text>
                          {rivalry.aiGenerated && (
                            <View style={styles.aiBadge}>
                              <MaterialCommunityIcons
                                name="robot"
                                size={14}
                                color={COLORS.neonCyan}
                              />
                              <Text style={styles.aiBadgeText}>{t.relationships.rivalry.generated}</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      {/* AI Generated Fan Comments */}
                      <View style={styles.commentsSection}>
                        <Text style={styles.commentsTitle}>
                          {t.relationships.rivalry.fanComments}:
                        </Text>
                        {generatedComments[rivalry.name] ? (
                          generatedComments[rivalry.name].map((comment, index) => (
                            <View key={index} style={styles.comment}>
                              <View style={styles.commentHeader}>
                                <MaterialCommunityIcons
                                  name="account-circle"
                                  size={24}
                                  color={COLORS.neonPurple}
                                />
                                <Text style={styles.commentAuthor}>Fan {index + 1}</Text>
                              </View>
                              <Text style={styles.commentText}>{comment}</Text>
                              <View style={styles.commentActions}>
                                <View style={styles.commentAction}>
                                  <Ionicons name="heart" size={14} color={COLORS.neonPink} />
                                  <Text style={styles.commentCount}>{Math.floor(Math.random() * 1000)}</Text>
                                </View>
                                <View style={styles.commentAction}>
                                  <Ionicons name="chatbubble" size={14} color={COLORS.neonCyan} />
                                  <Text style={styles.commentCount}>{Math.floor(Math.random() * 200)}</Text>
                                </View>
                              </View>
                            </View>
                          ))
                        ) : (
                          <Button
                            title="Générer Commentaires IA"
                            onPress={() => handleGenerateRivalryComments(rivalry.name)}
                            variant="neon"
                            size="sm"
                            loading={aiLoading}
                          />
                        )}
                      </View>

                      <Button
                        title={t.relationships.rivalry.rivalryResponse}
                        onPress={() => handleRespondToRivalry(rivalry.name)}
                        variant="gold"
                        size="sm"
                      />
                    </Card>
                  ))}
              </>
            )}

            {/* Create Rivalry */}
            <Text style={styles.subsectionTitle}>Créer une Rivalité</Text>
            {availableArtists.map((artist) => {
              const hasRivalry = relationships.find(
                r => r.name === artist.name && r.type === 'rivalry'
              );
              return (
                <Card key={artist.id} style={styles.artistCard}>
                  <View style={styles.artistHeader}>
                    <Text style={styles.artistIcon}>{artist.image}</Text>
                    <View style={styles.artistInfo}>
                      <Text style={styles.artistName}>{artist.name}</Text>
                      <Text style={styles.artistGenre}>{artist.genre}</Text>
                      <Text style={styles.rivalryDesc}>
                        Créer une rivalité pour booster votre visibilité
                      </Text>
                    </View>
                  </View>
                  {hasRivalry ? (
                    <View style={styles.ownedBadge}>
                      <MaterialCommunityIcons name="fire" size={20} color={COLORS.neonPink} />
                      <Text style={styles.ownedText}>Rivalité Active</Text>
                    </View>
                  ) : (
                    <Button
                      title="Clash"
                      onPress={() => handleCreateRivalry(artist)}
                      variant="neon"
                      size="sm"
                    />
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Entourage Tab */}
        {selectedTab === 'entourage' && (
          <View>
            <Text style={styles.sectionTitle}>{t.relationships.entourage.title}</Text>

            {/* Moral Status */}
            <Card style={styles.moralCard}>
              <Text style={styles.moralTitle}>{t.relationships.entourage.moralStatus}</Text>
              <View style={styles.moralStats}>
                <View style={styles.moralStat}>
                  <MaterialCommunityIcons name="heart" size={24} color={COLORS.neonPink} />
                  <Text style={styles.moralValue}>
                    {relationships.filter(r => r.type === 'entourage').length}/10
                  </Text>
                  <Text style={styles.moralLabel}>{t.relationships.entourage.relationships}</Text>
                </View>
                <View style={styles.moralStat}>
                  <MaterialCommunityIcons name="trending-up" size={24} color={COLORS.neonGreen} />
                  <Text style={styles.moralValue}>Positif</Text>
                  <Text style={styles.moralLabel}>{t.relationships.entourage.impact}</Text>
                </View>
              </View>
            </Card>

            {/* Current Entourage */}
            {relationships.filter(r => r.type === 'entourage').length > 0 && (
              <>
                <Text style={styles.subsectionTitle}>Votre Entourage</Text>
                {relationships
                  .filter(r => r.type === 'entourage')
                  .map((member) => (
                    <Card key={member.id} style={styles.entourageCard}>
                      <View style={styles.entourageHeader}>
                        <MaterialCommunityIcons
                          name="account-heart"
                          size={40}
                          color={COLORS.neonPurple}
                        />
                        <View style={styles.entourageInfo}>
                          <Text style={styles.entourageName}>{member.name}</Text>
                          <View style={styles.impactBadge}>
                            <MaterialCommunityIcons
                              name={
                                member.impactOnCareer === 'positive'
                                  ? 'trending-up'
                                  : 'trending-down'
                              }
                              size={16}
                              color={
                                member.impactOnCareer === 'positive'
                                  ? COLORS.neonGreen
                                  : COLORS.error
                              }
                            />
                            <Text
                              style={[
                                styles.impactText,
                                {
                                  color:
                                    member.impactOnCareer === 'positive'
                                      ? COLORS.neonGreen
                                      : COLORS.error,
                                },
                              ]}
                            >
                              Impact {member.impactOnCareer}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </Card>
                  ))}
              </>
            )}

            {/* Add to Entourage */}
            <Text style={styles.subsectionTitle}>Ajouter à l'Entourage</Text>
            {entourageMembers.map((member) => {
              const inEntourage = relationships.find(
                r => r.name === member.name && r.type === 'entourage'
              );
              return (
                <Card key={member.id} style={styles.entourageCard}>
                  <View style={styles.entourageHeader}>
                    <MaterialCommunityIcons
                      name="account"
                      size={40}
                      color={inEntourage ? COLORS.neonGreen : COLORS.neonPurple}
                    />
                    <View style={styles.entourageInfo}>
                      <Text style={styles.entourageName}>{member.name}</Text>
                      <Text style={styles.entourageDesc}>{member.description}</Text>
                      <View style={styles.moralBadge}>
                        <Text
                          style={[
                            styles.moralBadgeText,
                            { color: member.moralImpact === 'positive' ? COLORS.neonGreen : COLORS.error },
                          ]}
                        >
                          {t.relationships.entourage.moralStatus}: {member.moralImpact}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {inEntourage ? (
                    <View style={styles.ownedBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.neonGreen} />
                      <Text style={styles.ownedText}>Dans l'Entourage</Text>
                    </View>
                  ) : (
                    <Button
                      title="Ajouter"
                      onPress={() => handleAddToEntourage(member)}
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
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.xl,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.neonPurple,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    gap: SIZES.spacing.xs,
  },
  networkText: {
    color: COLORS.neonPurple,
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
  relationCard: {
    marginBottom: SIZES.spacing.md,
  },
  relationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistIcon: {
    fontSize: 50,
  },
  relationInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  relationName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  affinityBar: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 4,
    marginVertical: SIZES.spacing.xs,
    overflow: 'hidden',
  },
  affinityFill: {
    height: '100%',
    backgroundColor: COLORS.neonPurple,
  },
  affinityText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  artistCard: {
    marginBottom: SIZES.spacing.md,
  },
  artistHeader: {
    flexDirection: 'row',
    marginBottom: SIZES.spacing.md,
  },
  artistInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  artistName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  artistGenre: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  artistStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  artistStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  artistStatText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  rivalryCard: {
    marginBottom: SIZES.spacing.md,
  },
  rivalryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  rivalryInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  rivalryName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
  },
  rivalryDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius.sm,
    alignSelf: 'flex-start',
  },
  aiBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.neonCyan,
    fontWeight: '600',
  },
  commentsSection: {
    marginBottom: SIZES.spacing.md,
    backgroundColor: COLORS.surfaceLight,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  commentsTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  comment: {
    marginBottom: SIZES.spacing.md,
    padding: SIZES.spacing.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xs,
    gap: SIZES.spacing.xs,
  },
  commentAuthor: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  commentText: {
    fontSize: SIZES.sm,
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.xs,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentCount: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  moralCard: {
    marginBottom: SIZES.spacing.lg,
  },
  moralTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  moralStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moralStat: {
    alignItems: 'center',
  },
  moralValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.xs,
  },
  moralLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  entourageCard: {
    marginBottom: SIZES.spacing.md,
  },
  entourageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  entourageInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  entourageName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  entourageDesc: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.xs,
  },
  impactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  impactText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  moralBadge: {
    marginTop: SIZES.spacing.xs,
  },
  moralBadgeText: {
    fontSize: SIZES.sm,
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
});
