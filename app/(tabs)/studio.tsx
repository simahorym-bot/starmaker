import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import { Song } from '@/types/game';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

type RecordingStage = 'idle' | 'writing' | 'recording' | 'mastering' | 'complete';

export default function Studio() {
  const { gameState, updateGameState } = useGame();
  const { generateText, isLoading: aiLoading } = useTextGeneration();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songType, setSongType] = useState<'single' | 'ep' | 'album'>('single');
  const [theme, setTheme] = useState('');
  const [recordingStage, setRecordingStage] = useState<RecordingStage>('idle');
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [generatedLyrics, setGeneratedLyrics] = useState('');

  if (!gameState) return null;

  const { artist, studio, songs } = gameState;

  const getRecordingCost = () => {
    switch (songType) {
      case 'single':
        return 1000;
      case 'ep':
        return 3000;
      case 'album':
        return 10000;
      default:
        return 0;
    }
  };

  const getEnergyCost = () => {
    switch (songType) {
      case 'single':
        return 10;
      case 'ep':
        return 25;
      case 'album':
        return 50;
      default:
        return 0;
    }
  };

  const handleGenerateLyrics = async () => {
    if (!songTitle.trim() || !theme.trim()) {
      Alert.alert('Missing Info', 'Please enter song title and theme');
      return;
    }

    try {
      const prompt = `Write creative and catchy song lyrics for a ${artist.genre} song titled "${songTitle}" with the theme of ${theme}. Make it emotional and memorable. Include verses, chorus, and bridge. Format it nicely.`;

      const lyrics = await generateText(prompt);
      setGeneratedLyrics(lyrics || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate lyrics. Please try again.');
    }
  };

  const handleStartRecording = async () => {
    if (!songTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a song title');
      return;
    }

    const cost = getRecordingCost();
    const energyCost = getEnergyCost();

    if (artist.money < cost) {
      Alert.alert('Insufficient Funds', `You need $${cost} to record this ${songType}`);
      return;
    }

    if (artist.energy < energyCost) {
      Alert.alert('Not Enough Energy', `You need ${energyCost} energy to record this ${songType}`);
      return;
    }

    // Deduct costs
    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money - cost,
        energy: artist.energy - energyCost,
      },
    });

    // Start recording animation
    setRecordingStage('writing');
    simulateRecording();
  };

  const simulateRecording = () => {
    const stages: RecordingStage[] = ['writing', 'recording', 'mastering', 'complete'];
    let currentStageIndex = 0;
    let progress = 0;

    const interval = setInterval(() => {
      progress += 2;
      setRecordingProgress(progress);

      if (progress >= 100) {
        currentStageIndex++;
        if (currentStageIndex < stages.length) {
          setRecordingStage(stages[currentStageIndex]);
          progress = 0;
        } else {
          clearInterval(interval);
          completeSong();
        }
      }
    }, 50);
  };

  const completeSong = async () => {
    const quality = Math.min(studio.quality * 10 + Math.random() * 20, 100);

    const newSong: Song = {
      id: Date.now().toString(),
      title: songTitle,
      type: songType,
      genre: artist.genre,
      quality: Math.round(quality),
      streams: 0,
      earnings: 0,
      releaseDate: Date.now(),
      chartPosition: 0,
      lyrics: generatedLyrics,
    };

    await updateGameState({
      ...gameState,
      songs: [...songs, newSong],
      artist: {
        ...artist,
        experience: artist.experience + 100,
        reputation: artist.reputation + 5,
      },
    });

    setTimeout(() => {
      setRecordingStage('idle');
      setRecordingProgress(0);
      setShowCreateModal(false);
      setSongTitle('');
      setTheme('');
      setGeneratedLyrics('');
      Alert.alert('Success!', `"${newSong.title}" has been recorded with ${quality.toFixed(0)}% quality!`);
    }, 1000);
  };

  const getStageText = () => {
    switch (recordingStage) {
      case 'writing':
        return 'Writing melody...';
      case 'recording':
        return 'Recording vocals...';
      case 'mastering':
        return 'Mastering track...';
      case 'complete':
        return 'Complete!';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Studio</Text>
          <View style={styles.studioQuality}>
            <MaterialCommunityIcons name="music-box" size={20} color={COLORS.neonPurple} />
            <Text style={styles.qualityText}>Quality: {studio.quality}/10</Text>
          </View>
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="music-note" size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{songs.length}</Text>
              <Text style={styles.statLabel}>Songs</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="cash" size={24} color={COLORS.neonGreen} />
              <Text style={styles.statValue}>${artist.money.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Budget</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flash" size={24} color={COLORS.neonCyan} />
              <Text style={styles.statValue}>{artist.energy}</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </View>
        </Card>

        {/* Create New */}
        <Button
          title="🎵 Create New Song"
          onPress={() => setShowCreateModal(true)}
          variant="gold"
          size="lg"
          style={{ marginBottom: SIZES.spacing.lg }}
        />

        {/* Song Library */}
        <Text style={styles.sectionTitle}>Your Songs</Text>
        {songs.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No songs yet. Create your first hit!</Text>
          </Card>
        ) : (
          songs.map((song) => (
            <Card key={song.id} style={styles.songCard}>
              <View style={styles.songHeader}>
                <View style={styles.songInfo}>
                  <Text style={styles.songTitle}>{song.title}</Text>
                  <Text style={styles.songMeta}>
                    {song.type.toUpperCase()} • {song.genre}
                  </Text>
                </View>
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityBadgeText}>{song.quality}%</Text>
                </View>
              </View>
              <View style={styles.songStats}>
                <View style={styles.songStat}>
                  <Ionicons name="play" size={16} color={COLORS.neonPurple} />
                  <Text style={styles.songStatText}>{song.streams.toLocaleString()} streams</Text>
                </View>
                <View style={styles.songStat}>
                  <MaterialCommunityIcons name="cash" size={16} color={COLORS.neonGreen} />
                  <Text style={styles.songStatText}>${song.earnings.toLocaleString()}</Text>
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Studio Upgrades */}
        <Text style={styles.sectionTitle}>Studio Upgrades</Text>
        <Card style={styles.upgradeCard}>
          <View style={styles.upgradeHeader}>
            <MaterialCommunityIcons name="music-box-multiple" size={32} color={COLORS.neonPurple} />
            <View style={styles.upgradeInfo}>
              <Text style={styles.upgradeName}>Premium Equipment</Text>
              <Text style={styles.upgradeDescription}>Increase studio quality to level {studio.quality + 1}</Text>
            </View>
          </View>
          <Button
            title={`Upgrade - $${(studio.quality + 1) * 5000}`}
            onPress={() => {
              const cost = (studio.quality + 1) * 5000;
              if (artist.money >= cost) {
                updateGameState({
                  ...gameState,
                  artist: { ...artist, money: artist.money - cost },
                  studio: { ...studio, quality: studio.quality + 1 },
                });
              } else {
                Alert.alert('Insufficient Funds', `You need $${cost}`);
              }
            }}
            variant="neon"
          />
        </Card>
      </ScrollView>

      {/* Create Song Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {recordingStage === 'idle' ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Create New Song</Text>
                  <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                    <Ionicons name="close" size={28} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Song Title</Text>
                    <TextInput
                      style={styles.input}
                      value={songTitle}
                      onChangeText={setSongTitle}
                      placeholder="Enter song title"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Type</Text>
                    <View style={styles.typeButtons}>
                      {(['single', 'ep', 'album'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeButton,
                            songType === type && styles.typeButtonActive,
                          ]}
                          onPress={() => setSongType(type)}
                        >
                          <Text
                            style={[
                              styles.typeButtonText,
                              songType === type && styles.typeButtonTextActive,
                            ]}
                          >
                            {type.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Theme (for AI lyrics)</Text>
                    <TextInput
                      style={styles.input}
                      value={theme}
                      onChangeText={setTheme}
                      placeholder="e.g., heartbreak, celebration, motivation"
                      placeholderTextColor={COLORS.textTertiary}
                    />
                  </View>

                  <Button
                    title="✨ Generate Lyrics with AI"
                    onPress={handleGenerateLyrics}
                    variant="neon"
                    loading={aiLoading}
                    style={{ marginBottom: SIZES.spacing.md }}
                  />

                  {generatedLyrics && (
                    <View style={styles.lyricsContainer}>
                      <Text style={styles.lyricsLabel}>Generated Lyrics:</Text>
                      <ScrollView style={styles.lyricsScroll}>
                        <Text style={styles.lyricsText}>{generatedLyrics}</Text>
                      </ScrollView>
                    </View>
                  )}

                  <View style={styles.costInfo}>
                    <View style={styles.costItem}>
                      <MaterialCommunityIcons name="cash" size={20} color={COLORS.gold} />
                      <Text style={styles.costText}>${getRecordingCost()}</Text>
                    </View>
                    <View style={styles.costItem}>
                      <Ionicons name="flash" size={20} color={COLORS.neonCyan} />
                      <Text style={styles.costText}>{getEnergyCost()} Energy</Text>
                    </View>
                  </View>

                  <Button
                    title="🎙️ Start Recording"
                    onPress={handleStartRecording}
                    variant="gold"
                    size="lg"
                  />
                </ScrollView>
              </>
            ) : (
              <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.recordingContainer}>
                <MaterialCommunityIcons
                  name="music-note"
                  size={80}
                  color={COLORS.neonPurple}
                  style={{ marginBottom: SIZES.spacing.xl }}
                />
                <Text style={styles.recordingTitle}>{getStageText()}</Text>
                <ProgressBar
                  progress={recordingProgress}
                  color={COLORS.neonPurple}
                  height={12}
                  showPercentage
                  style={{ width: '100%', marginTop: SIZES.spacing.xl }}
                />
              </Animated.View>
            )}
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
    color: COLORS.textPrimary,
  },
  studioQuality: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
  },
  qualityText: {
    color: COLORS.neonPurple,
    fontWeight: '600',
    marginLeft: SIZES.spacing.xs,
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
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: SIZES.md,
  },
  songCard: {
    marginBottom: SIZES.spacing.md,
  },
  songHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.spacing.sm,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  songMeta: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  qualityBadge: {
    backgroundColor: COLORS.neonPurple,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.md,
  },
  qualityBadgeText: {
    color: '#000',
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
  songStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  songStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  songStatText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  upgradeCard: {
    marginBottom: SIZES.spacing.xl,
  },
  upgradeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  upgradeInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  upgradeName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  upgradeDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
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
    maxHeight: '90%',
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
  inputGroup: {
    marginBottom: SIZES.spacing.lg,
  },
  inputLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: SIZES.spacing.md,
    paddingHorizontal: SIZES.spacing.sm,
    borderRadius: SIZES.radius.md,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.neonPurple,
  },
  typeButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  typeButtonTextActive: {
    color: '#000',
  },
  lyricsContainer: {
    marginBottom: SIZES.spacing.lg,
  },
  lyricsLabel: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.neonPurple,
    marginBottom: SIZES.spacing.sm,
  },
  lyricsScroll: {
    maxHeight: 200,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
  },
  lyricsText: {
    color: COLORS.textPrimary,
    fontSize: SIZES.sm,
    lineHeight: 20,
  },
  costInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: SIZES.spacing.md,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.lg,
  },
  costItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  costText: {
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  recordingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  recordingTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.neonPurple,
  },
});
