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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import { MediaEvent } from '@/types/game';

type MediaType = 'radio' | 'tv' | 'press';

const MEDIA_OPPORTUNITIES = {
  radio: [
    { name: 'Morning Drive Show', impact: 10, cost: 5000 },
    { name: 'Late Night Radio', impact: 15, cost: 8000 },
    { name: 'National Radio Interview', impact: 30, cost: 15000 },
  ],
  tv: [
    { name: 'Local News Segment', impact: 20, cost: 10000 },
    { name: 'Late Night Talk Show', impact: 50, cost: 30000 },
    { name: 'Music Documentary', impact: 100, cost: 75000 },
  ],
  press: [
    { name: 'Blog Feature', impact: 5, cost: 2000 },
    { name: 'Magazine Interview', impact: 25, cost: 12000 },
    { name: 'Rolling Stone Cover', impact: 150, cost: 100000 },
  ],
};

export default function Media() {
  const { gameState, updateGameState } = useGame();
  const { generateText, isLoading: aiLoading } = useTextGeneration();
  const [activeType, setActiveType] = useState<MediaType>('radio');
  const [generatingEvent, setGeneratingEvent] = useState(false);

  if (!gameState) return null;

  const { artist, fanbase, mediaEvents } = gameState;

  const handleBookMedia = async (opportunity: any, type: MediaType) => {
    if (artist.money < opportunity.cost) {
      Alert.alert('Insufficient Funds', `You need $${opportunity.cost.toLocaleString()}`);
      return;
    }

    if (artist.energy < 15) {
      Alert.alert('Not Enough Energy', 'You need 15 energy for this event');
      return;
    }

    setGeneratingEvent(true);

    try {
      // Generate AI content for the event
      const prompt = `Generate a short, exciting headline (one sentence) about ${artist.stageName}, a ${artist.genre} artist, appearing on "${opportunity.name}". Make it sound professional and newsworthy.`;

      const description = await generateText(prompt);

      const newEvent: MediaEvent = {
        id: Date.now().toString(),
        type,
        name: opportunity.name,
        impact: opportunity.impact,
        timestamp: Date.now(),
        description: description || `${artist.stageName} appears on ${opportunity.name}!`,
      };

      const newFans = Math.floor(opportunity.impact * 100 * (0.8 + Math.random() * 0.4));

      await updateGameState({
        ...gameState,
        artist: {
          ...artist,
          money: artist.money - opportunity.cost,
          energy: artist.energy - 15,
          reputation: artist.reputation + opportunity.impact,
          experience: artist.experience + 50,
        },
        fanbase: {
          ...fanbase,
          total: fanbase.total + newFans,
          casual: fanbase.casual + newFans,
        },
        mediaEvents: [newEvent, ...mediaEvents].slice(0, 50),
      });

      Alert.alert(
        'Media Success!',
        `${opportunity.name} complete!\n+${newFans} fans\n+${opportunity.impact} reputation`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book media event');
    } finally {
      setGeneratingEvent(false);
    }
  };

  const getMediaIcon = (type: MediaType) => {
    switch (type) {
      case 'radio':
        return 'radio';
      case 'tv':
        return 'tv';
      case 'press':
        return 'newspaper';
      default:
        return 'megaphone';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Media & PR</Text>
      </View>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <MaterialCommunityIcons name="broadcast" size={24} color={COLORS.neonCyan} />
            <Text style={styles.statValue}>{mediaEvents.length}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="star" size={24} color={COLORS.gold} />
            <Text style={styles.statValue}>{artist.reputation}</Text>
            <Text style={styles.statLabel}>Reputation</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={24} color={COLORS.neonPurple} />
            <Text style={styles.statValue}>{fanbase.total.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Fans</Text>
          </View>
        </View>
      </Card>

      {/* Type Selector */}
      <View style={styles.typeSelector}>
        {(['radio', 'tv', 'press'] as MediaType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, activeType === type && styles.typeButtonActive]}
            onPress={() => setActiveType(type)}
          >
            <Ionicons
              name={getMediaIcon(type)}
              size={24}
              color={activeType === type ? '#000' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.typeButtonText,
                activeType === type && styles.typeButtonTextActive,
              ]}
            >
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Opportunities */}
        <Text style={styles.sectionTitle}>Available Opportunities</Text>
        {MEDIA_OPPORTUNITIES[activeType].map((opp, index) => (
          <Card key={index} style={styles.oppCard}>
            <View style={styles.oppHeader}>
              <Ionicons name={getMediaIcon(activeType)} size={32} color={COLORS.neonCyan} />
              <View style={styles.oppInfo}>
                <Text style={styles.oppName}>{opp.name}</Text>
                <Text style={styles.oppImpact}>+{opp.impact} Reputation</Text>
                <Text style={styles.oppCost}>${opp.cost.toLocaleString()}</Text>
              </View>
            </View>
            <Button
              title="Book Event"
              onPress={() => handleBookMedia(opp, activeType)}
              variant="neon"
              loading={generatingEvent && aiLoading}
            />
          </Card>
        ))}

        {/* Recent Events */}
        <Text style={styles.sectionTitle}>Recent Media Coverage</Text>
        {mediaEvents.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>No media events yet. Book your first appearance!</Text>
          </Card>
        ) : (
          mediaEvents.slice(0, 10).map((event) => (
            <Card key={event.id} style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View
                  style={[
                    styles.eventIcon,
                    {
                      backgroundColor:
                        event.type === 'radio'
                          ? COLORS.neonCyan
                          : event.type === 'tv'
                          ? COLORS.neonPurple
                          : COLORS.gold,
                    },
                  ]}
                >
                  <Ionicons name={getMediaIcon(event.type)} size={20} color="#000" />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.name}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                  <Text style={styles.eventTime}>
                    {new Date(event.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.impactBadge}>
                  <Text style={styles.impactText}>+{event.impact}</Text>
                </View>
              </View>
            </Card>
          ))
        )}

        {/* Chart Performance */}
        <Text style={styles.sectionTitle}>📈 Chart Performance</Text>
        <Card>
          <View style={styles.chartSection}>
            <Text style={styles.chartTitle}>Streaming Charts</Text>
            {gameState.songs.length === 0 ? (
              <Text style={styles.emptyText}>No songs released yet</Text>
            ) : (
              gameState.songs.slice(0, 5).map((song, idx) => (
                <View key={song.id} style={styles.chartItem}>
                  <Text style={styles.chartPosition}>#{idx + 1}</Text>
                  <View style={styles.chartSongInfo}>
                    <Text style={styles.chartSongTitle}>{song.title}</Text>
                    <Text style={styles.chartSongStreams}>
                      {song.streams.toLocaleString()} streams
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statsCard: {
    marginHorizontal: SIZES.spacing.lg,
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
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.md,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
  },
  typeButtonActive: {
    backgroundColor: COLORS.neonCyan,
  },
  typeButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  typeButtonTextActive: {
    color: '#000',
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  oppCard: {
    marginBottom: SIZES.spacing.md,
  },
  oppHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  oppInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  oppName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  oppImpact: {
    fontSize: SIZES.sm,
    color: COLORS.gold,
    marginTop: 2,
  },
  oppCost: {
    fontSize: SIZES.sm,
    color: COLORS.neonGreen,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: SIZES.md,
  },
  eventCard: {
    marginBottom: SIZES.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  eventName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  eventDescription: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  eventTime: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  impactBadge: {
    backgroundColor: COLORS.gold,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.md,
  },
  impactText: {
    color: '#000',
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
  chartSection: {
    paddingTop: SIZES.spacing.sm,
  },
  chartTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.spacing.md,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  chartPosition: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    width: 40,
  },
  chartSongInfo: {
    flex: 1,
  },
  chartSongTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chartSongStreams: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
