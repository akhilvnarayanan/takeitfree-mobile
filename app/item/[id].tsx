import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import RequestSheet from '@/components/RequestSheet';
import ReportSheet from '@/components/ReportSheet';

function getCatColor(cat: string) {
  return (Colors.categories as any)[cat.toLowerCase()] || Colors.categories.other;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { getItemById, currentUser, appreciateItem, addComment, requestItem } = useApp();
  const [commentText, setCommentText] = useState('');
  const [showRequestSheet, setShowRequestSheet] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);

  const item = getItemById(id);

  if (!item) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <View style={styles.notFound}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.notFoundTitle}>Item not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const catColor = getCatColor(item.category);
  const isAppreciated = currentUser ? item.appreciatedBy.includes(currentUser.id) : false;
  const isOwner = currentUser?.id === item.userId;
  const hasRequested = currentUser ? item.requests.some(r => r.requesterId === currentUser.id) : false;

  const handleAppreciate = () => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    appreciateItem(item.id);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addComment(item.id, commentText.trim());
    setCommentText('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        {currentUser && !isOwner ? (
          <Pressable onPress={() => setShowReportSheet(true)} hitSlop={12}>
            <Ionicons name="flag-outline" size={20} color={Colors.textTertiary} />
          </Pressable>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.heroImage, { backgroundColor: catColor + '10' }]}>
          <Ionicons
            name={
              item.category === 'Books' ? 'book-outline' :
              item.category === 'Clothes' ? 'shirt-outline' :
              item.category === 'Electronics' ? 'laptop-outline' :
              item.category === 'Furniture' ? 'bed-outline' :
              item.category === 'Toys' ? 'game-controller-outline' :
              item.category === 'Kitchen' ? 'restaurant-outline' :
              item.category === 'Sports' ? 'bicycle-outline' :
              'cube-outline'
            }
            size={64}
            color={catColor + '50'}
          />
          {item.status === 'claimed' && (
            <View style={styles.claimedBanner}>
              <Ionicons name="checkmark-circle" size={16} color="#fff" />
              <Text style={styles.claimedBannerText}>Claimed</Text>
            </View>
          )}
          {item.status === 'completed' && (
            <View style={[styles.claimedBanner, { backgroundColor: Colors.secondary }]}>
              <Ionicons name="checkmark-done" size={16} color="#fff" />
              <Text style={styles.claimedBannerText}>Completed</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.titleInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={[styles.catBadge, { backgroundColor: catColor + '15' }]}>
                <Text style={[styles.catBadgeText, { color: catColor }]}>{item.category}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.userPill}>
              <View style={[styles.userAvatar, { backgroundColor: catColor + '20' }]}>
                <Text style={[styles.userAvatarText, { color: catColor }]}>
                  {item.username.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.userPillName}>{item.username}</Text>
            </View>
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>

          <View style={styles.detailsSection}>
            <DetailRow icon="checkmark-circle-outline" label="Condition" value={item.condition} />
            {item.location ? <DetailRow icon="location-outline" label="Location" value={item.location} /> : null}
            {item.pickupInfo ? <DetailRow icon="time-outline" label="Pickup" value={item.pickupInfo} /> : null}
          </View>

          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.descriptionText}>{item.description}</Text>

          {item.story ? (
            <>
              <Text style={styles.sectionLabel}>The Story</Text>
              <View style={styles.storyCard}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color={Colors.primary} />
                <Text style={styles.storyText}>{item.story}</Text>
              </View>
            </>
          ) : null}

          <View style={styles.interactRow}>
            <Pressable onPress={handleAppreciate} style={styles.interactBtn} hitSlop={8}>
              <Ionicons
                name={isAppreciated ? 'heart' : 'heart-outline'}
                size={24}
                color={isAppreciated ? Colors.appreciate : Colors.textSecondary}
              />
              <Text style={[styles.interactCount, isAppreciated && { color: Colors.appreciate }]}>
                {item.appreciations}
              </Text>
            </Pressable>
            <View style={styles.interactBtn}>
              <Ionicons name="chatbubble-outline" size={22} color={Colors.textSecondary} />
              <Text style={styles.interactCount}>{item.comments.length}</Text>
            </View>
            <View style={styles.interactBtn}>
              <Feather name="send" size={20} color={Colors.textSecondary} />
              <Text style={styles.interactCount}>{item.requests.length}</Text>
            </View>
          </View>

          {!isOwner && item.status === 'available' && currentUser && !hasRequested && (
            <Pressable
              onPress={() => setShowRequestSheet(true)}
              style={({ pressed }) => [styles.requestFullBtn, { opacity: pressed ? 0.9 : 1 }]}
            >
              <Feather name="send" size={18} color="#fff" />
              <Text style={styles.requestFullBtnText}>Request This Item</Text>
            </Pressable>
          )}

          {hasRequested && (
            <View style={styles.requestedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              <Text style={styles.requestedText}>You've requested this item</Text>
            </View>
          )}

          {item.comments.length > 0 && (
            <View style={styles.commentsSection}>
              <Text style={styles.sectionLabel}>Comments</Text>
              {item.comments.map(comment => (
                <View key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentUser}>{comment.username}</Text>
                    <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {currentUser && (
        <View style={[styles.commentBar, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.textTertiary}
            value={commentText}
            onChangeText={setCommentText}
          />
          <Pressable
            onPress={handleComment}
            disabled={!commentText.trim()}
            style={({ pressed }) => [styles.sendBtn, { opacity: commentText.trim() ? (pressed ? 0.8 : 1) : 0.4 }]}
          >
            <Ionicons name="send" size={20} color={Colors.primary} />
          </Pressable>
        </View>
      )}

      <RequestSheet
        visible={showRequestSheet}
        itemTitle={item.title}
        onClose={() => setShowRequestSheet(false)}
        onSubmit={(reason) => requestItem(item.id, reason)}
      />

      {!isOwner && (
        <ReportSheet
          visible={showReportSheet}
          onClose={() => setShowReportSheet(false)}
          reportedUserId={item.userId}
          reportedUsername={item.username}
        />
      )}
    </KeyboardAvoidingView>
  );
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={18} color={Colors.textTertiary} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, textAlign: 'center' },
  scrollContent: { paddingBottom: 100 },
  heroImage: { height: 240, alignItems: 'center', justifyContent: 'center' },
  claimedBanner: {
    position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  claimedBannerText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#fff' },
  body: { padding: 20 },
  titleRow: { marginBottom: 12 },
  titleInfo: { gap: 8 },
  itemTitle: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  catBadgeText: { fontSize: 12, fontFamily: 'Nunito_700Bold' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  userPill: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userAvatar: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { fontSize: 13, fontFamily: 'Nunito_700Bold' },
  userPillName: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  timeText: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textTertiary },
  detailsSection: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 20, gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textTertiary, width: 70 },
  detailValue: { flex: 1, fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  sectionLabel: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 8, marginTop: 4 },
  descriptionText: { fontSize: 15, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 22, marginBottom: 16 },
  storyCard: {
    flexDirection: 'row', backgroundColor: Colors.primary + '08', borderRadius: 12, padding: 14,
    gap: 10, marginBottom: 20, borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  storyText: { flex: 1, fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.text, lineHeight: 21, fontStyle: 'italic' as const },
  interactRow: {
    flexDirection: 'row', gap: 24, paddingVertical: 14, borderTopWidth: 1,
    borderTopColor: Colors.borderLight, marginBottom: 8,
  },
  interactBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  interactCount: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  requestFullBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14, marginBottom: 20,
  },
  requestFullBtnText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#fff' },
  requestedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.success + '10',
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 20,
  },
  requestedText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.success },
  commentsSection: { marginTop: 8 },
  commentCard: { backgroundColor: Colors.surface, borderRadius: 12, padding: 12, marginBottom: 8 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  commentUser: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: Colors.text },
  commentTime: { fontSize: 11, fontFamily: 'Nunito_400Regular', color: Colors.textTertiary },
  commentText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, lineHeight: 20 },
  commentBar: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10,
    backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: 8,
  },
  commentInput: {
    flex: 1, backgroundColor: Colors.surfaceSecondary, borderRadius: 20, paddingHorizontal: 16,
    paddingVertical: 10, fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.text,
  },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  notFound: { alignItems: 'center', paddingHorizontal: 40 },
  notFoundTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text, marginTop: 16 },
  backButton: { marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: Colors.primary, borderRadius: 12 },
  backButtonText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#fff' },
});
