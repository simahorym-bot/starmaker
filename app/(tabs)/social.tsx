import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '@/constants/theme';
import { useGame } from '@/components/GameProvider';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTextGeneration } from '@fastshot/ai';
import { Post, Relationship } from '@/types/game';

type TabType = 'stargram' | 'twittart' | 'relationships';

const CELEBRITY_NAMES = [
  'Luna Nova', 'Asnta Boile', 'ATSNI', 'Alex Rica', 'Luna Wanny',
  'Drake Shadow', 'Bella Rose', 'Max Thunder', 'Skye Walker'
];

export default function Social() {
  const { gameState, updateGameState } = useGame();
  const { generateText, isLoading: aiLoading } = useTextGeneration();

  const [activeTab, setActiveTab] = useState<TabType>('stargram');
  const [postContent, setPostContent] = useState('');
  const [generatingContent, setGeneratingContent] = useState(false);

  if (!gameState) return null;

  const { socialMedia, fanbase, relationships } = gameState;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const handleGeneratePost = async () => {
    setGeneratingContent(true);
    try {
      const prompt = `Generate a short, engaging social media post (max 2 sentences) for a ${gameState.artist.genre} artist. Make it about music, lifestyle, or fan appreciation. Keep it authentic and relatable.`;
      const content = await generateText(prompt);
      setPostContent(content || '');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setGeneratingContent(false);
    }
  };

  const handlePublishPost = async () => {
    if (!postContent.trim()) {
      Alert.alert('Empty Post', 'Please write something to post');
      return;
    }

    // Generate AI comments
    const commentsPrompt = `Generate 3 short fan comments (each 5-10 words) reacting to this post: "${postContent}". Mix positive excitement with some questions. Separate with |`;

    try {
      const commentsText = await generateText(commentsPrompt);
      const commentTexts = commentsText ? commentsText.split('|').slice(0, 3) : ['Love this! 🔥', 'Can\'t wait!', 'You\'re the best!'];

      const newPost: Post = {
        id: Date.now().toString(),
        content: postContent,
        likes: Math.floor(Math.random() * (fanbase.total / 10)),
        comments: commentTexts.map((text, idx) => ({
          id: `${Date.now()}_${idx}`,
          author: CELEBRITY_NAMES[Math.floor(Math.random() * CELEBRITY_NAMES.length)],
          content: text.trim(),
          sentiment: 'positive' as const,
        })),
        timestamp: Date.now(),
        isViral: Math.random() > 0.8,
      };

      const newFollowers = Math.floor(Math.random() * 100);

      await updateGameState({
        ...gameState,
        socialMedia: {
          ...socialMedia,
          starGram: {
            followers: socialMedia.starGram.followers + newFollowers,
            posts: [newPost, ...socialMedia.starGram.posts].slice(0, 20),
          },
        },
        fanbase: {
          ...fanbase,
          total: fanbase.total + newFollowers,
          casual: fanbase.casual + newFollowers,
        },
      });

      setPostContent('');
      Alert.alert('Posted!', `Gained ${newFollowers} new followers!`);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish post');
    }
  };

  const handleStartCollaboration = async (celeb: string) => {
    const existing = relationships.find((r) => r.name === celeb);
    if (existing) {
      Alert.alert('Already Connected', `You're already connected with ${celeb}`);
      return;
    }

    const newRelationship: Relationship = {
      id: Date.now().toString(),
      name: celeb,
      type: 'collaboration',
      affinity: 30,
      interactions: 1,
    };

    await updateGameState({
      ...gameState,
      relationships: [...relationships, newRelationship],
    });

    Alert.alert('Connection Made!', `Started collaboration with ${celeb}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Social</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'stargram' && styles.tabActive]}
          onPress={() => setActiveTab('stargram')}
        >
          <Ionicons
            name="camera"
            size={20}
            color={activeTab === 'stargram' ? COLORS.neonPurple : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'stargram' && styles.tabTextActive]}>
            StarGram
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'twittart' && styles.tabActive]}
          onPress={() => setActiveTab('twittart')}
        >
          <MaterialCommunityIcons
            name="twitter"
            size={20}
            color={activeTab === 'twittart' ? COLORS.neonCyan : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'twittart' && styles.tabTextActive]}>
            TwittArt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'relationships' && styles.tabActive]}
          onPress={() => setActiveTab('relationships')}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'relationships' ? COLORS.gold : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'relationships' && styles.tabTextActive]}>
            Network
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* StarGram Tab */}
        {activeTab === 'stargram' && (
          <>
            {/* Stats */}
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatNumber(socialMedia.starGram.followers)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{socialMedia.starGram.posts.length}</Text>
                  <Text style={styles.statLabel}>Posts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {socialMedia.starGram.posts.reduce((sum, p) => sum + p.likes, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Total Likes</Text>
                </View>
              </View>
            </Card>

            {/* Create Post */}
            <Card style={styles.createPostCard}>
              <Text style={styles.cardTitle}>Create Post</Text>
              <TextInput
                style={styles.postInput}
                value={postContent}
                onChangeText={setPostContent}
                placeholder="What's on your mind?"
                placeholderTextColor={COLORS.textTertiary}
                multiline
              />
              <View style={styles.postActions}>
                <Button
                  title="✨ AI Generate"
                  onPress={handleGeneratePost}
                  variant="neon"
                  size="sm"
                  loading={generatingContent}
                />
                <Button
                  title="📤 Publish"
                  onPress={handlePublishPost}
                  variant="gold"
                  size="sm"
                  loading={aiLoading}
                />
              </View>
            </Card>

            {/* Posts Feed */}
            {socialMedia.starGram.posts.map((post) => (
              <Card key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>⭐</Text>
                  </View>
                  <View style={styles.postMeta}>
                    <Text style={styles.posterName}>{gameState.artist.stageName}</Text>
                    <Text style={styles.postTime}>
                      {new Date(post.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                  {post.isViral && (
                    <View style={styles.viralBadge}>
                      <Ionicons name="flame" size={16} color="#FF6B35" />
                      <Text style={styles.viralText}>VIRAL</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.postContent}>{post.content}</Text>
                <View style={styles.postStats}>
                  <View style={styles.postStat}>
                    <Ionicons name="heart" size={18} color={COLORS.error} />
                    <Text style={styles.postStatText}>{formatNumber(post.likes)} likes</Text>
                  </View>
                  <View style={styles.postStat}>
                    <Ionicons name="chatbubble" size={18} color={COLORS.neonCyan} />
                    <Text style={styles.postStatText}>{post.comments.length} comments</Text>
                  </View>
                </View>
                {post.comments.length > 0 && (
                  <View style={styles.comments}>
                    {post.comments.slice(0, 2).map((comment) => (
                      <View key={comment.id} style={styles.comment}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentText}>{comment.content}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}

            {socialMedia.starGram.posts.length === 0 && (
              <Card>
                <Text style={styles.emptyText}>No posts yet. Create your first post!</Text>
              </Card>
            )}
          </>
        )}

        {/* TwittArt Tab */}
        {activeTab === 'twittart' && (
          <>
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatNumber(socialMedia.twittArt.followers)}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{socialMedia.twittArt.tweets.length}</Text>
                  <Text style={styles.statLabel}>Tweets</Text>
                </View>
              </View>
            </Card>
            <Card>
              <Text style={styles.emptyText}>TwittArt feed coming soon!</Text>
            </Card>
          </>
        )}

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <>
            <Card style={styles.statsCard}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{relationships.length}</Text>
                  <Text style={styles.statLabel}>Connections</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {relationships.filter((r) => r.type === 'collaboration').length}
                  </Text>
                  <Text style={styles.statLabel}>Collabs</Text>
                </View>
              </View>
            </Card>

            <Text style={styles.sectionTitle}>Your Network</Text>
            {relationships.map((rel) => (
              <Card key={rel.id} style={styles.relationshipCard}>
                <View style={styles.relationshipHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{rel.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.relationshipInfo}>
                    <Text style={styles.relationshipName}>{rel.name}</Text>
                    <Text style={styles.relationshipType}>{rel.type}</Text>
                  </View>
                  <View style={styles.affinityBadge}>
                    <Text style={styles.affinityText}>{rel.affinity}</Text>
                  </View>
                </View>
              </Card>
            ))}

            <Text style={styles.sectionTitle}>Discover Artists</Text>
            {CELEBRITY_NAMES.slice(0, 5).map((celeb) => (
              <Card key={celeb} style={styles.celebrityCard}>
                <View style={styles.celebrityContent}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{celeb.charAt(0)}</Text>
                  </View>
                  <View style={styles.celebrityInfo}>
                    <Text style={styles.celebrityName}>{celeb}</Text>
                    <Text style={styles.celebrityGenre}>
                      {['Pop', 'Hip-Hop', 'R&B', 'Electronic'][Math.floor(Math.random() * 4)]} Artist
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.connectButton}
                    onPress={() => handleStartCollaboration(celeb)}
                  >
                    <Ionicons name="add-circle" size={32} color={COLORS.neonPurple} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </>
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
  header: {
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.xxxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceLight,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.md,
    gap: SIZES.spacing.xs,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: SIZES.spacing.lg,
  },
  statsCard: {
    marginBottom: SIZES.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  createPostCard: {
    marginBottom: SIZES.spacing.lg,
  },
  cardTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
  },
  postInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    color: COLORS.textPrimary,
    fontSize: SIZES.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: SIZES.spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
  },
  postCard: {
    marginBottom: SIZES.spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gold,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacing.sm,
  },
  avatarText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: '#000',
  },
  postMeta: {
    flex: 1,
  },
  posterName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  postTime: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
  },
  viralBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B35',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius.sm,
    gap: 4,
  },
  viralText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: '#000',
  },
  postContent: {
    fontSize: SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: 20,
    marginBottom: SIZES.spacing.md,
  },
  postStats: {
    flexDirection: 'row',
    gap: SIZES.spacing.lg,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.sm,
  },
  comments: {
    marginTop: SIZES.spacing.md,
    paddingTop: SIZES.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceLight,
  },
  comment: {
    marginBottom: SIZES.spacing.sm,
  },
  commentAuthor: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  commentText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
  },
  relationshipCard: {
    marginBottom: SIZES.spacing.md,
  },
  relationshipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  relationshipInfo: {
    flex: 1,
  },
  relationshipName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  relationshipType: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  affinityBadge: {
    backgroundColor: COLORS.neonPurple,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius.md,
  },
  affinityText: {
    color: '#000',
    fontWeight: '700',
    fontSize: SIZES.sm,
  },
  celebrityCard: {
    marginBottom: SIZES.spacing.md,
  },
  celebrityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  celebrityInfo: {
    flex: 1,
  },
  celebrityName: {
    fontSize: SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  celebrityGenre: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  connectButton: {
    padding: SIZES.spacing.xs,
  },
});
