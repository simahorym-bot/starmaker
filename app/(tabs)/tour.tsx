import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Venue, Tour } from '@/types/game';

const WORLD_VENUES: Venue[] = [
  { id: '1', name: 'The Echo', city: 'Los Angeles', country: 'USA', capacity: 500, type: 'club', baseRevenue: 5000, played: false },
  { id: '2', name: 'Blue Note', city: 'New York', country: 'USA', capacity: 300, type: 'club', baseRevenue: 4000, played: false },
  { id: '3', name: 'The Roxy', city: 'London', country: 'UK', capacity: 600, type: 'theater', baseRevenue: 8000, played: false },
  { id: '4', name: 'Olympia', city: 'Paris', country: 'France', capacity: 2000, type: 'theater', baseRevenue: 15000, played: false },
  { id: '5', name: 'Nippon Budokan', city: 'Tokyo', country: 'Japan', capacity: 14000, type: 'arena', baseRevenue: 50000, played: false },
  { id: '6', name: 'Madison Square Garden', city: 'New York', country: 'USA', capacity: 20000, type: 'arena', baseRevenue: 200000, played: false },
  { id: '7', name: 'Wembley Stadium', city: 'London', country: 'UK', capacity: 90000, type: 'stadium', baseRevenue: 500000, played: false },
  { id: '8', name: 'Rose Bowl', city: 'Los Angeles', country: 'USA', capacity: 92000, type: 'stadium', baseRevenue: 600000, played: false },
];

export default function TourScreen() {
  const { gameState, updateGameState } = useGame();
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [showPerformModal, setShowPerformModal] = useState(false);

  if (!gameState) return null;

  const { artist, fanbase, tours } = gameState;
  const activeTour = tours.find((t) => t.status === 'active');

  const getVenueIcon = (type: string) => {
    switch (type) {
      case 'club':
        return 'musical-note';
      case 'theater':
        return 'business';
      case 'arena':
        return 'basketball';
      case 'stadium':
        return 'football';
      default:
        return 'location';
    }
  };

  const canPlayVenue = (venue: Venue) => {
    if (venue.type === 'stadium' && fanbase.total < 100000) return false;
    if (venue.type === 'arena' && fanbase.total < 50000) return false;
    if (venue.type === 'theater' && fanbase.total < 5000) return false;
    return artist.energy >= 20;
  };

  const handleBookVenue = (venue: Venue) => {
    setSelectedVenue(venue);
    setShowVenueModal(true);
  };

  const handlePerform = async () => {
    if (!selectedVenue) return;

    if (!canPlayVenue(selectedVenue)) {
      Alert.alert('Cannot Perform', 'Not enough fans or energy for this venue');
      return;
    }

    const energyCost = 20;
    const revenue = Math.floor(selectedVenue.baseRevenue * (0.8 + Math.random() * 0.4));
    const newFans = Math.floor(selectedVenue.capacity * 0.1 * Math.random());

    await updateGameState({
      ...gameState,
      artist: {
        ...artist,
        money: artist.money + revenue,
        energy: artist.energy - energyCost,
        experience: artist.experience + 50,
        prestige: artist.prestige + (selectedVenue.type === 'stadium' ? 10 : 5),
      },
      fanbase: {
        ...fanbase,
        total: fanbase.total + newFans,
        casual: fanbase.casual + newFans,
      },
    });

    setShowVenueModal(false);
    setShowPerformModal(false);
    Alert.alert(
      'Show Complete!',
      `Earned $${revenue.toLocaleString()}\nGained ${newFans} new fans!\n-${energyCost} energy`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>World Tour</Text>
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <MaterialCommunityIcons name="map-marker" size={24} color={COLORS.gold} />
              <Text style={styles.statValue}>{tours.length}</Text>
              <Text style={styles.statLabel}>Tours</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="people" size={24} color={COLORS.neonPurple} />
              <Text style={styles.statValue}>{fanbase.total.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Fans</Text>
            </View>
            <View style={styles.stat}>
              <Ionicons name="flash" size={24} color={COLORS.neonCyan} />
              <Text style={styles.statValue}>{artist.energy}</Text>
              <Text style={styles.statLabel}>Energy</Text>
            </View>
          </View>
        </Card>

        {/* Energy Bar */}
        <Card style={styles.energyCard}>
          <ProgressBar
            progress={(artist.energy / artist.maxEnergy) * 100}
            label="Tour Energy"
            showPercentage
            color={COLORS.neonCyan}
            height={10}
          />
        </Card>

        {/* Venues */}
        <Text style={styles.sectionTitle}>🌍 Global Venues</Text>

        {/* Clubs */}
        <Text style={styles.categoryTitle}>Clubs & Small Venues</Text>
        {WORLD_VENUES.filter((v) => v.type === 'club').map((venue) => (
          <Card key={venue.id} style={styles.venueCard} onPress={() => handleBookVenue(venue)}>
            <View style={styles.venueHeader}>
              <Ionicons name={getVenueIcon(venue.type)} size={32} color={COLORS.neonPurple} />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueLocation}>
                  {venue.city}, {venue.country}
                </Text>
                <Text style={styles.venueCapacity}>Capacity: {venue.capacity}</Text>
              </View>
              <View style={styles.venueRevenue}>
                <Text style={styles.revenueText}>${(venue.baseRevenue / 1000).toFixed(0)}K</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Theaters */}
        <Text style={styles.categoryTitle}>Theaters</Text>
        {WORLD_VENUES.filter((v) => v.type === 'theater').map((venue) => (
          <Card key={venue.id} style={styles.venueCard} onPress={() => handleBookVenue(venue)}>
            <View style={styles.venueHeader}>
              <Ionicons name={getVenueIcon(venue.type)} size={32} color={COLORS.neonCyan} />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueLocation}>
                  {venue.city}, {venue.country}
                </Text>
                <Text style={styles.venueCapacity}>Capacity: {venue.capacity.toLocaleString()}</Text>
              </View>
              <View style={styles.venueRevenue}>
                <Text style={styles.revenueText}>${(venue.baseRevenue / 1000).toFixed(0)}K</Text>
              </View>
            </View>
          </Card>
        ))}

        {/* Arenas */}
        <Text style={styles.categoryTitle}>Arenas</Text>
        {WORLD_VENUES.filter((v) => v.type === 'arena').map((venue) => {
          const isLocked = !canPlayVenue(venue);
          const cardStyle = isLocked ? { ...styles.venueCard, ...styles.venueCardLocked } : styles.venueCard;
          return (
          <Card
            key={venue.id}
            style={cardStyle}
            onPress={() => handleBookVenue(venue)}
          >
            <View style={styles.venueHeader}>
              <Ionicons name={getVenueIcon(venue.type)} size={32} color={COLORS.gold} />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueLocation}>
                  {venue.city}, {venue.country}
                </Text>
                <Text style={styles.venueCapacity}>Capacity: {venue.capacity.toLocaleString()}</Text>
                {fanbase.total < 50000 && (
                  <Text style={styles.requirementText}>Requires 50K fans</Text>
                )}
              </View>
              <View style={styles.venueRevenue}>
                <Text style={styles.revenueText}>${(venue.baseRevenue / 1000).toFixed(0)}K</Text>
              </View>
            </View>
          </Card>
        );
        })}

        {/* Stadiums */}
        <Text style={styles.categoryTitle}>⭐ Stadiums</Text>
        {WORLD_VENUES.filter((v) => v.type === 'stadium').map((venue) => {
          const isLocked = !canPlayVenue(venue);
          const cardStyle = isLocked ? { ...styles.venueCard, ...styles.venueCardLocked } : styles.venueCard;
          return (
          <Card
            key={venue.id}
            style={cardStyle}
            variant="gold"
            onPress={() => handleBookVenue(venue)}
          >
            <View style={styles.venueHeader}>
              <Ionicons name={getVenueIcon(venue.type)} size={32} color={COLORS.gold} />
              <View style={styles.venueInfo}>
                <Text style={styles.venueName}>{venue.name}</Text>
                <Text style={styles.venueLocation}>
                  {venue.city}, {venue.country}
                </Text>
                <Text style={styles.venueCapacity}>Capacity: {venue.capacity.toLocaleString()}</Text>
                {fanbase.total < 100000 && (
                  <Text style={styles.requirementText}>Requires 100K fans</Text>
                )}
              </View>
              <View style={styles.venueRevenue}>
                <Text style={styles.revenueText}>${(venue.baseRevenue / 1000).toFixed(0)}K</Text>
              </View>
            </View>
          </Card>
        );
        })}
      </ScrollView>

      {/* Venue Modal */}
      {selectedVenue && (
        <Modal
          visible={showVenueModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowVenueModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedVenue.name}</Text>
                <TouchableOpacity onPress={() => setShowVenueModal(false)}>
                  <Ionicons name="close" size={28} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.venueDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Location</Text>
                  <Text style={styles.detailValue}>
                    {selectedVenue.city}, {selectedVenue.country}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Capacity</Text>
                  <Text style={styles.detailValue}>{selectedVenue.capacity.toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Potential Revenue</Text>
                  <Text style={styles.detailValue}>${selectedVenue.baseRevenue.toLocaleString()}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Energy Cost</Text>
                  <Text style={styles.detailValue}>20 Energy</Text>
                </View>
              </View>

              {canPlayVenue(selectedVenue) ? (
                <Button
                  title="🎤 Perform Show"
                  onPress={handlePerform}
                  variant="gold"
                  size="lg"
                />
              ) : (
                <View>
                  <Text style={styles.cannotPerformText}>
                    {artist.energy < 20
                      ? 'Not enough energy'
                      : `Need ${selectedVenue.type === 'stadium' ? '100K' : '50K'} fans`}
                  </Text>
                  <Button
                    title="Not Available"
                    onPress={() => {}}
                    variant="secondary"
                    size="lg"
                    disabled
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      )}
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
    marginBottom: SIZES.spacing.xl,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  energyCard: {
    marginBottom: SIZES.spacing.xl,
  },
  sectionTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  categoryTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.sm,
  },
  venueCard: {
    marginBottom: SIZES.spacing.md,
  },
  venueCardLocked: {
    opacity: 0.5,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueInfo: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  venueName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  venueLocation: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  venueCapacity: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  requirementText: {
    fontSize: SIZES.xs,
    color: COLORS.error,
    marginTop: 4,
  },
  venueRevenue: {
    alignItems: 'flex-end',
  },
  revenueText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.neonGreen,
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
  venueDetails: {
    marginBottom: SIZES.spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  detailLabel: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cannotPerformText: {
    fontSize: SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    marginBottom: SIZES.spacing.md,
  },
});
