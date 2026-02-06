import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '@/constants/theme';
import { useLocale } from '@/hooks/useLocale';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { Card } from './ui/Card';
import { GameState } from '@/types/game';
import { generateText } from '@fastshot/ai';

interface Post {
  id: string;
  author: string;
  content: string;
  hashtags: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  aiGenerated: boolean;
}

interface AISocialFeedProps {
  gameState: GameState;
}

export const AISocialFeed: React.FC<AISocialFeedProps> = ({ gameState }) => {
  const t = useLocale();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);

  useEffect(() => {
    generateInitialFeed();
  }, []);

  const generateInitialFeed = async () => {
    setLoading(true);
    try {
      // Set trending hashtags based on player's career
      const hashtags = [
        t.socialFeed.hashtags.nouveauAlbum,
        t.socialFeed.hashtags.clashMusique,
        t.socialFeed.hashtags.tournéeMondiale,
        t.socialFeed.hashtags.disqueDor,
        t.socialFeed.hashtags.featuring,
        t.socialFeed.hashtags.studioSession,
      ];
      setTrendingHashtags(hashtags);

      // Generate initial posts
      await generateNewPost();
    } finally {
      setLoading(false);
    }
  };

  const generateNewPost = async () => {
    setLoading(true);
    try {
      const context = {
        artistName: gameState.artist.stageName,
        genre: gameState.artist.genre,
        prestige: gameState.artist.prestige,
        fans: gameState.fanbase.total,
        recentSong: gameState.songs[gameState.songs.length - 1]?.title || 'un nouveau hit',
      };

      const prompt = `Tu es un générateur de posts de réseaux sociaux pour l'industrie musicale française.

Crée 3 posts courts et engageants (maximum 100 caractères chacun) qui parlent de l'artiste "${context.artistName}".

Les posts peuvent être:
- Des commentaires de fans enthousiastes
- Des annonces excitantes
- Des rumeurs sur de nouvelles collaborations
- Des réactions à ${context.recentSong}

Contexte:
- Genre: ${context.genre}
- Prestige: ${context.prestige}/100
- Fans: ${context.fans.toLocaleString()}

Format de réponse (JSON):
[
  {
    "author": "Nom du fan/journaliste",
    "content": "Contenu du post en français",
    "hashtags": ["#Tag1", "#Tag2"]
  }
]`;

      const result = await generateText({
        prompt,
        model: 'gpt-4o-mini',
        maxTokens: 400,
      });

      try {
        const generatedPosts = JSON.parse(result.text);
        const newPosts: Post[] = generatedPosts.map((post: any, index: number) => ({
          id: Date.now().toString() + index,
          author: post.author,
          content: post.content,
          hashtags: post.hashtags || [],
          likes: Math.floor(Math.random() * 10000) + 100,
          comments: Math.floor(Math.random() * 500) + 10,
          shares: Math.floor(Math.random() * 1000) + 50,
          timestamp: new Date().toISOString(),
          aiGenerated: true,
        }));

        setPosts((prev) => [...newPosts, ...prev].slice(0, 10));
      } catch (parseError) {
        // Fallback to manual post creation
        const fallbackPost: Post = {
          id: Date.now().toString(),
          author: 'Fan Enthousiaste',
          content: `Incroyable performance de ${context.artistName} ! 🔥`,
          hashtags: [t.socialFeed.hashtags.nouveauAlbum, t.socialFeed.hashtags.livePerformance],
          likes: 5234,
          comments: 234,
          shares: 567,
          timestamp: new Date().toISOString(),
          aiGenerated: true,
        };
        setPosts((prev) => [fallbackPost, ...prev].slice(0, 10));
      }
    } catch (error) {
      console.error('Error generating social posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const postDate = new Date(timestamp);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `il y a ${diffMins}min`;
    if (diffMins < 1440) return `il y a ${Math.floor(diffMins / 60)}h`;
    return `il y a ${Math.floor(diffMins / 1440)}j`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.neonPurple + '30', COLORS.neonPurple + '10']}
        style={styles.header}
      >
        <MaterialCommunityIcons name="trending-up" size={40} color={COLORS.neonPurple} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{t.socialFeed.title}</Text>
          <Text style={styles.subtitle}>{t.socialFeed.subtitle}</Text>
        </View>
      </LinearGradient>

      {/* Trending Hashtags */}
      <Card style={styles.hashtagsCard}>
        <View style={styles.hashtagsHeader}>
          <MaterialCommunityIcons name="fire" size={24} color={COLORS.gold24K} />
          <Text style={styles.hashtagsTitle}>{t.socialFeed.trending}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hashtagsScroll}>
          {trendingHashtags.map((hashtag, index) => (
            <TouchableOpacity key={index} style={styles.hashtagBadge}>
              <Text style={styles.hashtagText}>{hashtag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      {/* Social Feed */}
      <ScrollView
        style={styles.feed}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={generateNewPost}
            tintColor={COLORS.electricBlue}
          />
        }
      >
        {posts.map((post) => (
          <Card key={post.id} style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.avatarContainer}>
                <MaterialCommunityIcons name="account-circle" size={40} color={COLORS.neonCyan} />
              </View>
              <View style={styles.postAuthorInfo}>
                <Text style={styles.postAuthor}>{post.author}</Text>
                <Text style={styles.postTimestamp}>{formatTimestamp(post.timestamp)}</Text>
              </View>
              {post.aiGenerated && (
                <View style={styles.aiGeneratedBadge}>
                  <MaterialCommunityIcons name="robot" size={16} color={COLORS.electricBlue} />
                </View>
              )}
            </View>

            <Text style={styles.postContent}>{post.content}</Text>

            {post.hashtags.length > 0 && (
              <View style={styles.postHashtags}>
                {post.hashtags.map((hashtag, index) => (
                  <Text key={index} style={styles.postHashtag}>
                    {hashtag}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.postStats}>
              <View style={styles.statItem}>
                <Ionicons name="heart" size={18} color={COLORS.ruby} />
                <Text style={styles.statText}>{post.likes.toLocaleString()}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="chatbubble" size={18} color={COLORS.neonCyan} />
                <Text style={styles.statText}>{post.comments}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="share-social" size={18} color={COLORS.neonGreen} />
                <Text style={styles.statText}>{post.shares}</Text>
              </View>
            </View>
          </Card>
        ))}

        {posts.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons name="twitter" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>Aucun post pour le moment</Text>
            <Text style={styles.emptyHint}>Tirez vers le bas pour générer des posts</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.xl,
    borderRadius: SIZES.radius.lg,
    marginBottom: SIZES.spacing.lg,
  },
  headerText: {
    marginLeft: SIZES.spacing.lg,
    flex: 1,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '900',
    color: COLORS.neonPurple,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  hashtagsCard: {
    padding: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.lg,
  },
  hashtagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  hashtagsTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: SIZES.spacing.sm,
  },
  hashtagsScroll: {
    flexGrow: 0,
  },
  hashtagBadge: {
    backgroundColor: COLORS.surfaceLight,
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    borderRadius: SIZES.radius.xl,
    marginRight: SIZES.spacing.sm,
    borderWidth: 1,
    borderColor: COLORS.gold24K,
  },
  hashtagText: {
    color: COLORS.gold24K,
    fontWeight: '600',
    fontSize: SIZES.sm,
  },
  feed: {
    flex: 1,
  },
  postCard: {
    marginBottom: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  avatarContainer: {
    marginRight: SIZES.spacing.md,
  },
  postAuthorInfo: {
    flex: 1,
  },
  postAuthor: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  postTimestamp: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
  },
  aiGeneratedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.electricBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 22,
    marginBottom: SIZES.spacing.md,
  },
  postHashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.md,
  },
  postHashtag: {
    color: COLORS.electricBlue,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  postStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  statText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    padding: SIZES.spacing.xxxl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
  },
  emptyHint: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
    textAlign: 'center',
  },
});
