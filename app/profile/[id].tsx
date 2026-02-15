import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Alert, ActivityIndicator, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import ItemCard from '@/components/ItemCard';
import ReportSheet from '@/components/ReportSheet';

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentUser, getUserById, getUserItems, getUserMoments, createOrGetChat } = useApp();
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!id) {
    return (
      <View style={styles.container}>
        <Text>User not found</Text>
      </View>
    );
  }

  const user = getUserById(id);
  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>User not found</Text>
      </View>
    );
  }

  const userItems = getUserItems(id);
  const userMoments = getUserMoments(id);
  const isCurrentUser = currentUser?.id === id;

  const handleStartChat = async () => {
    if (!currentUser || isCurrentUser) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    try {
      const chat = createOrGetChat(id);
      setIsLoading(false);
      router.push(`/chats/${chat.id}`);
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to start chat');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.light.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{user.displayName}</Text>
        <Pressable onPress={() => setShowReportSheet(true)}>
          <Ionicons name="ellipsis-vertical" size={24} color={Colors.light.text} />
        </Pressable>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Info Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={80} color={Colors.light.tint} />
          </View>

          <Text style={styles.displayName}>{user.displayName}</Text>
          <Text style={styles.username}>@{user.username}</Text>

          {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userItems.length}</Text>
              <Text style={styles.statLabel}>Items Shared</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userMoments.length}</Text>
              <Text style={styles.statLabel}>Moments</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userItems.reduce((sum: number, item: any) => sum + item.appreciations, 0)}</Text>
              <Text style={styles.statLabel}>Appreciations</Text>
            </View>
          </View>

          {/* Action Buttons */}
          {!isCurrentUser && (
            <View style={styles.actionButtonsContainer}>
              <Pressable
                style={[styles.actionButton, styles.chatButton]}
                onPress={handleStartChat}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="chatbubble-outline" size={18} color="#fff" />
                    <Text style={styles.actionButtonText}>Message</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* Active Listings Section */}
        {userItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Listings ({userItems.length})</Text>
            {userItems.map((item: any) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* Moments Section */}
        {userMoments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Moments ({userMoments.length})</Text>
            {userMoments.map((moment: any) => (
              <View key={moment.id} style={styles.momentCard}>
                <View style={styles.momentHeader}>
                  <View>
                    <Text style={styles.momentUsername}>{moment.username}</Text>
                    <Text style={styles.momentRole}>
                      {moment.role === 'giver' ? 'Shared as giver' : 'Received this'}
                    </Text>
                  </View>
                  <Text style={styles.momentDate}>
                    {new Date(moment.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.momentCaption}>{moment.caption}</Text>
                {moment.imageUri && (
                  <View style={styles.momentImage}>
                    <Ionicons name="image" size={40} color={Colors.light.tabIconDefault} />
                  </View>
                )}
                <View style={styles.momentFooter}>
                  <View style={styles.momentStat}>
                    <Ionicons name="heart" size={16} color="#e74c3c" />
                    <Text style={styles.momentStatText}>{moment.appreciations}</Text>
                  </View>
                  <View style={styles.momentStat}>
                    <Ionicons name="chatbubble" size={16} color={Colors.light.tint} />
                    <Text style={styles.momentStatText}>{moment.commentCount}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {userItems.length === 0 && userMoments.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="box-outline" size={48} color={Colors.light.tabIconDefault} />
            <Text style={styles.emptyStateText}>No items or moments yet</Text>
          </View>
        )}
      </ScrollView>

      {/* Report Sheet Modal */}
      <ReportSheet
        visible={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        reportedUserId={id}
        reportedUsername={user.username}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '20',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.background,
  },
  avatarPlaceholder: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  chatButton: {
    backgroundColor: Colors.light.tint,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 8,
    borderBottomColor: Colors.light.background,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  momentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '20',
  },
  momentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  momentUsername: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  momentRole: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  momentDate: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  momentCaption: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  momentImage: {
    height: 120,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  momentFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  momentStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  momentStatText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    marginTop: 12,
    color: Colors.light.tabIconDefault,
    fontSize: 14,
  },
});
