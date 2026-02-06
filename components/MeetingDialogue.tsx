import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { GameState } from '@/types/game';
import { generateText } from '@fastshot/ai';

interface MeetingDialogueProps {
  visible: boolean;
  onClose: () => void;
  meetingType: 'banker' | 'agent' | 'rival';
  gameState: GameState;
  onChoice: (outcome: 'positive' | 'negative' | 'neutral') => void;
}

interface DialogueOption {
  id: string;
  text: string;
  outcome: 'positive' | 'negative' | 'neutral';
  impact: string;
}

export const MeetingDialogue: React.FC<MeetingDialogueProps> = ({
  visible,
  onClose,
  meetingType,
  gameState,
  onChoice,
}) => {
  const t = useLocale();
  const [dialogue, setDialogue] = useState<string>('');
  const [options, setOptions] = useState<DialogueOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');

  React.useEffect(() => {
    if (visible) {
      generateDialogue();
    }
  }, [visible]);

  const generateDialogue = async () => {
    setLoading(true);
    setShowResult(false);

    try {
      const meetingContext = t.meetings[meetingType];

      const prompt = `Tu es un scénariste pour un jeu de gestion musicale.

Crée un dialogue de réunion immersive en français pour l'artiste "${gameState.artist.stageName}".

Type de réunion: ${meetingType}
Contexte: ${meetingContext.greeting}
Prestige de l'artiste: ${gameState.artist.prestige}
Argent disponible: ${gameState.artist.money.toLocaleString()}€
Nombre de fans: ${gameState.fanbase.total.toLocaleString()}

Le dialogue doit:
1. Commencer par une introduction du personnage (banquier/agent/rival)
2. Présenter une situation/proposition
3. Être écrit en français professionnel et immersif
4. Faire 150-200 mots

Ensuite, propose 3 choix de réponse avec leurs impacts:
- Option positive: améliore la relation/situation
- Option neutre: maintient le statu quo
- Option négative: peut avoir des conséquences

Format JSON:
{
  "dialogue": "Le texte du dialogue...",
  "options": [
    {
      "id": "1",
      "text": "Réponse du joueur",
      "outcome": "positive/negative/neutral",
      "impact": "Description de l'impact"
    }
  ]
}`;

      const result = await generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 600,
      });

      const parsed = JSON.parse(result.text);
      setDialogue(parsed.dialogue);
      setOptions(parsed.options || []);
    } catch (error) {
      console.error('Error generating dialogue:', error);
      // Fallback dialogue
      setDialogue(t.meetings[meetingType].greeting);
      setOptions([
        {
          id: '1',
          text: 'Accepter la proposition',
          outcome: 'positive',
          impact: 'Améliore votre situation',
        },
        {
          id: '2',
          text: 'Refuser poliment',
          outcome: 'neutral',
          impact: 'Maintient le statu quo',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (option: DialogueOption) => {
    setSelectedOutcome(option.impact);
    setShowResult(true);
    setTimeout(() => {
      onChoice(option.outcome);
      onClose();
    }, 2000);
  };

  const getMeetingIcon = () => {
    switch (meetingType) {
      case 'banker':
        return 'bank';
      case 'agent':
        return 'briefcase';
      case 'rival':
        return 'account-alert';
      default:
        return 'account';
    }
  };

  const getMeetingColor = () => {
    switch (meetingType) {
      case 'banker':
        return COLORS.neonGreen;
      case 'agent':
        return COLORS.electricBlue;
      case 'rival':
        return COLORS.ruby;
      default:
        return COLORS.textSecondary;
    }
  };

  const getMeetingTitle = () => {
    return t.meetings[meetingType].title;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <BlurView intensity={80} style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <LinearGradient
            colors={[getMeetingColor() + '40', getMeetingColor() + '10']}
            style={styles.header}
          >
            <View style={styles.headerLeft}>
              <View style={[styles.iconContainer, { backgroundColor: getMeetingColor() + '20' }]}>
                <MaterialCommunityIcons name={getMeetingIcon() as any} size={40} color={getMeetingColor()} />
              </View>
              <View>
                <Text style={styles.title}>{getMeetingTitle()}</Text>
                <Text style={styles.subtitle}>Conversation Immersive</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* AI Badge */}
            <View style={styles.aiBadge}>
              <MaterialCommunityIcons name="robot" size={16} color={COLORS.electricBlue} />
              <Text style={styles.aiBadgeText}>Dialogue généré par Newell AI</Text>
            </View>

            {/* Dialogue Box */}
            <Card style={styles.dialogueCard}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <MaterialCommunityIcons name="loading" size={32} color={getMeetingColor()} />
                  <Text style={styles.loadingText}>Génération du dialogue...</Text>
                </View>
              ) : (
                <>
                  <View style={styles.characterAvatar}>
                    <MaterialCommunityIcons
                      name={getMeetingIcon() as any}
                      size={48}
                      color={getMeetingColor()}
                    />
                  </View>
                  <Text style={styles.dialogueText}>{dialogue}</Text>
                </>
              )}
            </Card>

            {/* Choice Options */}
            {!loading && !showResult && options.length > 0 && (
              <View style={styles.optionsContainer}>
                <Text style={styles.optionsTitle}>Votre Réponse:</Text>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.optionButton,
                      option.outcome === 'positive' && styles.optionPositive,
                      option.outcome === 'negative' && styles.optionNegative,
                    ]}
                    onPress={() => handleChoice(option)}
                  >
                    <Text style={styles.optionText}>{option.text}</Text>
                    <View style={styles.optionImpact}>
                      <MaterialCommunityIcons
                        name={
                          option.outcome === 'positive'
                            ? 'arrow-up-circle'
                            : option.outcome === 'negative'
                            ? 'arrow-down-circle'
                            : 'minus-circle'
                        }
                        size={16}
                        color={
                          option.outcome === 'positive'
                            ? COLORS.neonGreen
                            : option.outcome === 'negative'
                            ? COLORS.error
                            : COLORS.textSecondary
                        }
                      />
                      <Text style={styles.optionImpactText}>{option.impact}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Result */}
            {showResult && (
              <Card style={styles.resultCard}>
                <MaterialCommunityIcons name="check-circle" size={48} color={COLORS.neonGreen} />
                <Text style={styles.resultText}>{selectedOutcome}</Text>
              </Card>
            )}
          </ScrollView>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: SIZES.radius.xxl,
    borderTopRightRadius: SIZES.radius.xxl,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: SIZES.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  closeButton: {
    padding: SIZES.spacing.sm,
  },
  content: {
    padding: SIZES.spacing.xl,
  },
  aiBadge: {
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
  aiBadgeText: {
    fontSize: SIZES.xs,
    color: COLORS.electricBlue,
    fontWeight: '600',
  },
  dialogueCard: {
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.xxxl,
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
  },
  characterAvatar: {
    alignSelf: 'center',
    marginBottom: SIZES.spacing.lg,
  },
  dialogueText: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  optionsTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  optionButton: {
    backgroundColor: COLORS.surface,
    padding: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.md,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  optionPositive: {
    borderColor: COLORS.neonGreen,
  },
  optionNegative: {
    borderColor: COLORS.error,
  },
  optionText: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.sm,
  },
  optionImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  optionImpactText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  resultCard: {
    alignItems: 'center',
    padding: SIZES.spacing.xxxl,
  },
  resultText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SIZES.spacing.md,
    textAlign: 'center',
  },
});
