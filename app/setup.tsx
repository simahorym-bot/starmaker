import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { initializeNewGame, saveGameState } from '@/services/gameState';
import { useGame } from '@/components/GameProvider';

const GENRES = ['Pop', 'Hip-Hop', 'Rock', 'R&B', 'Electronic', 'Country', 'Jazz', 'Alternative'];

export default function Setup() {
  const router = useRouter();
  const { refreshGameState } = useGame();
  const [artistName, setArtistName] = useState('');
  const [stageName, setStageName] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('Pop');
  const [loading, setLoading] = useState(false);

  const handleStartGame = async () => {
    if (!artistName.trim() || !stageName.trim()) {
      alert('Please enter both artist name and stage name');
      return;
    }

    setLoading(true);
    try {
      const newGameState = initializeNewGame(artistName.trim(), stageName.trim(), selectedGenre);
      await saveGameState(newGameState);
      await refreshGameState();
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.logo}>⭐</Text>
        <Text style={styles.title}>Welcome to Starmaker</Text>
        <Text style={styles.subtitle}>Create your music empire</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Artist Name</Text>
            <TextInput
              style={styles.input}
              value={artistName}
              onChangeText={setArtistName}
              placeholder="Enter your artist name"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stage Name</Text>
            <TextInput
              style={styles.input}
              value={stageName}
              onChangeText={setStageName}
              placeholder="Enter your stage name"
              placeholderTextColor={COLORS.textTertiary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Genre</Text>
            <View style={styles.genreGrid}>
              {GENRES.map((genre) => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.genreChip,
                    selectedGenre === genre && styles.genreChipSelected,
                  ]}
                  onPress={() => setSelectedGenre(genre)}
                >
                  <Text
                    style={[
                      styles.genreText,
                      selectedGenre === genre && styles.genreTextSelected,
                    ]}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Start Your Journey"
            onPress={handleStartGame}
            variant="gold"
            size="lg"
            loading={loading}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.spacing.xl,
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginTop: 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreChip: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.surfaceLight,
  },
  genreChipSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  genreTextSelected: {
    color: '#000',
  },
});
