import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GameState } from '@/types/game';
import { generateText } from '@fastshot/ai';

interface AIPressReleaseProps {
  gameState: GameState;
  achievement: {
    type: 'goldRecord' | 'platinumRecord' | 'number1Hit' | 'tourComplete' | 'awardWon';
    details: string;
  };
}

export const AIPressRelease: React.FC<AIPressReleaseProps> = ({ gameState, achievement }) => {
  const t = useLocale();
  const [pressRelease, setPressRelease] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generatePressRelease = async () => {
    setLoading(true);
    try {
      const prompt = `Tu es un attaché de presse professionnel dans l'industrie musicale française.

Rédige un communiqué de presse formel et élégant en français pour l'artiste "${gameState.artist.stageName}" concernant cette réalisation :

Type: ${achievement.type}
Détails: ${achievement.details}

Statistiques de l'artiste:
- Niveau de prestige: ${gameState.artist.prestige}
- Nombre de fans: ${gameState.fanbase.total.toLocaleString()}
- Nombre de singles/albums: ${gameState.songs.length}
- Genre musical: ${gameState.artist.genre}

Le communiqué doit:
1. Commencer par "COMMUNIQUÉ DE PRESSE" en en-tête
2. Inclure une date fictive récente
3. Avoir un titre accrocheur et professionnel
4. Contenir 3-4 paragraphes bien structurés
5. Utiliser un ton élégant et journalistique
6. Inclure des citations fictives de l'artiste ou de son équipe
7. Se terminer par une section "À propos de ${gameState.artist.stageName}"
8. Être optimiste et célébrer cette réussite

Longueur: environ 300-400 mots.`;

      const result = await generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 800,
      });

      setPressRelease(result.text);
    } catch (error) {
      console.error('Error generating press release:', error);
      Alert.alert('Erreur', 'Impossible de générer le communiqué de presse');
    } finally {
      setLoading(false);
    }
  };

  const getAchievementIcon = () => {
    switch (achievement.type) {
      case 'goldRecord':
      case 'platinumRecord':
        return 'disc';
      case 'number1Hit':
        return 'trophy';
      case 'tourComplete':
        return 'guitar-electric';
      case 'awardWon':
        return 'medal';
      default:
        return 'newspaper';
    }
  };

  const getAchievementColor = () => {
    switch (achievement.type) {
      case 'goldRecord':
        return COLORS.gold24K;
      case 'platinumRecord':
        return COLORS.platinum;
      case 'number1Hit':
        return COLORS.goldShimmer;
      case 'tourComplete':
        return COLORS.electricBlue;
      case 'awardWon':
        return COLORS.neonPurple;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.electricBlue + '30', COLORS.electricBlue + '10']}
        style={styles.header}
      >
        <MaterialCommunityIcons name="newspaper-variant" size={48} color={COLORS.electricBlue} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.ai.pressRelease}</Text>
          <Text style={styles.subtitle}>Communiqué Professionnel Généré par IA</Text>
        </View>
      </LinearGradient>

      {/* Achievement Badge */}
      <Card style={styles.achievementCard}>
        <View style={styles.achievementHeader}>
          <View style={[styles.achievementIcon, { backgroundColor: getAchievementColor() + '20' }]}>
            <MaterialCommunityIcons
              name={getAchievementIcon() as any}
              size={32}
              color={getAchievementColor()}
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementType}>Réalisation</Text>
            <Text style={styles.achievementDetails}>{achievement.details}</Text>
          </View>
        </View>
      </Card>

      {/* Generate Button */}
      {!pressRelease && (
        <Button
          title="Générer le Communiqué de Presse"
          onPress={generatePressRelease}
          variant="electric"
          size="lg"
          loading={loading}
          style={styles.generateButton}
        />
      )}

      {/* Press Release Content */}
      {pressRelease && (
        <Card style={styles.pressReleaseCard}>
          <View style={styles.pressReleaseHeader}>
            <MaterialCommunityIcons name="file-document" size={28} color={COLORS.gold24K} />
            <Text style={styles.pressReleaseTitle}>Communiqué de Presse</Text>
          </View>

          <View style={styles.aiPoweredBadge}>
            <MaterialCommunityIcons name="robot" size={16} color={COLORS.electricBlue} />
            <Text style={styles.aiPoweredText}>Généré par Newell AI</Text>
          </View>

          <Text style={styles.pressReleaseContent}>{pressRelease}</Text>

          <View style={styles.actionButtons}>
            <Button
              title="Régénérer"
              onPress={generatePressRelease}
              variant="secondary"
              size="sm"
              loading={loading}
              style={styles.actionButton}
            />
            <Button
              title="Partager"
              onPress={() => Alert.alert('Partagé !', 'Communiqué partagé avec les médias')}
              variant="electric"
              size="sm"
              style={styles.actionButton}
            />
          </View>
        </Card>
      )}

      {/* Tips */}
      <Card style={styles.tipsCard}>
        <MaterialCommunityIcons name="lightbulb-on" size={24} color={COLORS.goldDark} />
        <View style={styles.tipsContent}>
          <Text style={styles.tipsTitle}>Conseil Professionnel</Text>
          <Text style={styles.tipsText}>
            Les communiqués de presse générés par IA sont parfaits pour annoncer vos réussites
            aux médias et renforcer votre image professionnelle.
          </Text>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.xl,
  },
  headerText: {
    marginLeft: SIZES.spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.electricBlue,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  achievementCard: {
    marginBottom: SIZES.spacing.xl,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  achievementDetails: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  generateButton: {
    marginBottom: SIZES.spacing.xl,
  },
  pressReleaseCard: {
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.lg,
  },
  pressReleaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  pressReleaseTitle: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacing.md,
  },
  aiPoweredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.electricBlue + '20',
    paddingVertical: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.lg,
    gap: SIZES.spacing.xs,
  },
  aiPoweredText: {
    fontSize: SIZES.xs,
    color: COLORS.electricBlue,
    fontWeight: '600',
  },
  pressReleaseContent: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: SIZES.spacing.xl,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  tipsCard: {
    flexDirection: 'row',
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.xl,
  },
  tipsContent: {
    flex: 1,
    marginLeft: SIZES.spacing.md,
  },
  tipsTitle: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.gold24K,
    marginBottom: SIZES.spacing.xs,
  },
  tipsText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
