import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, Modal, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, Moment } from '@/contexts/AppContext';

interface MomentCardProps {
  moment: Moment;
  onProfilePress?: (userId: string) => void;
}

export default function MomentCard({ moment, onProfilePress }: MomentCardProps) {
  const { currentUser, appreciateMoment, addMomentComment } = useApp();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);

  const hasAppreciated = currentUser && moment.appreciatedBy.includes(currentUser.id);

  const handleAppreciate = () => {
    if (Platform !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    appreciateMoment(moment.id);
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !currentUser) return;
    
    setIsCommentSubmitting(true);
    addMomentComment(moment.id, commentText.trim());
    setCommentText('');
    setIsCommentSubmitting(false);
  };

  return (
    <>
      <View style={styles.container}>
        {/* Header with user info */}
        <Pressable 
          style={styles.header}
          onPress={() => onProfilePress?.(moment.userId)}
        >
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={44} color={Colors.light.tint} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{moment.username}</Text>
            <Text style={styles.role}>
              {moment.role === 'giver' ? '📤 Shared as giver' : '📥 Received this'}
            </Text>
            <Text style={styles.itemTitle}>{moment.itemTitle}</Text>
          </View>
          <Text style={styles.date}>
            {new Date(moment.createdAt).toLocaleDateString()}
          </Text>
        </Pressable>

        {/* Caption */}
        <Text style={styles.caption}>{moment.caption}</Text>

        {/* Image placeholder */}
        {moment.imageUri && (
          <View style={styles.imageContainer}>
            <Ionicons name="image" size={48} color={Colors.light.tabIconDefault} />
            <Text style={styles.imagePlaceholder}>Photo</Text>
          </View>
        )}

        {/* Engagement stats */}
        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={16} color="#e74c3c" />
            <Text style={styles.statText}>{moment.appreciations} appreciations</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={16} color={Colors.light.tint} />
            <Text style={styles.statText}>{moment.commentCount} comments</Text>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Pressable 
            style={[styles.actionButton, hasAppreciated && styles.actionButtonActive]}
            onPress={handleAppreciate}
          >
            <Ionicons 
              name={hasAppreciated ? 'heart' : 'heart-outline'} 
              size={20} 
              color={hasAppreciated ? '#e74c3c' : Colors.light.tabIconDefault}
            />
            <Text style={[styles.actionText, hasAppreciated && styles.actionTextActive]}>
              Appreciate
            </Text>
          </Pressable>

          <Pressable 
            style={styles.actionButton}
            onPress={() => setShowCommentModal(true)}
          >
            <Ionicons name="chatbubble-outline" size={20} color={Colors.light.tabIconDefault} />
            <Text style={styles.actionText}>Comment</Text>
          </Pressable>
        </View>

        {/* Recent comments preview */}
        {moment.comments.length > 0 && (
          <View style={styles.commentsPreview}>
            {moment.comments.slice(0, 2).map(comment => (
              <View key={comment.id} style={styles.commentPreview}>
                <Text style={styles.commentUsername}>{comment.username}</Text>
                <Text style={styles.commentText} numberOfLines={1}>
                  {comment.content}
                </Text>
              </View>
            ))}
            {moment.comments.length > 2 && (
              <Pressable onPress={() => setShowCommentModal(true)}>
                <Text style={styles.viewMoreComments}>
                  View {moment.comments.length - 2} more comment{moment.comments.length - 2 !== 1 ? 's' : ''}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>

      {/* Comment Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowCommentModal(false)}>
                <Text style={styles.closeButton}>Close</Text>
              </Pressable>
              <Text style={styles.modalTitle}>Comments</Text>
              <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {moment.comments.length === 0 ? (
                <Text style={styles.noComments}>No comments yet. Be the first!</Text>
              ) : (
                moment.comments.map(comment => (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Ionicons name="person-circle" size={32} color={Colors.light.tint} />
                    </View>
                    <View style={styles.commentContent}>
                      <Text style={styles.commentUsername}>{comment.username}</Text>
                      <Text style={styles.commentText}>{comment.content}</Text>
                      <Text style={styles.commentTime}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Comment input */}
            {currentUser && (
              <View style={styles.commentInputContainer}>
                <View style={styles.avatarPlaceholder2}>
                  <Ionicons name="person-circle" size={32} color={Colors.light.tint} />
                </View>
                <View style={styles.commentInputWrapper}>
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    placeholderTextColor={Colors.light.tabIconDefault}
                    value={commentText}
                    onChangeText={setCommentText}
                    maxLength={250}
                    editable={!isCommentSubmitting}
                  />
                  <Pressable
                    onPress={handleSubmitComment}
                    disabled={!commentText.trim() || isCommentSubmitting}
                  >
                    <Ionicons
                      name="send"
                      size={18}
                      color={commentText.trim() ? Colors.light.tint : Colors.light.tabIconDefault}
                    />
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    paddingBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault + '10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 10,
  },
  avatarPlaceholder: {
    marginRight: 4,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    color: Colors.light.text,
    fontSize: 14,
  },
  role: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  itemTitle: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  caption: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  imageContainer: {
    height: 200,
    marginHorizontal: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  imagePlaceholder: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  actionButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.light.tabIconDefault + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '10',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  actionButtonActive: {
    backgroundColor: '#e74c3c' + '08',
  },
  actionText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  actionTextActive: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  commentsPreview: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  commentPreview: {
    paddingVertical: 4,
  },
  commentUsername: {
    fontWeight: '600',
    fontSize: 12,
    color: Colors.light.text,
  },
  commentText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  viewMoreComments: {
    fontSize: 12,
    color: Colors.light.tint,
    fontWeight: '600',
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    flex: 1,
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    marginTop: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '20',
  },
  closeButton: {
    color: Colors.light.tint,
    fontWeight: '600',
    fontSize: 14,
  },
  modalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
    textAlign: 'center',
  },
  commentsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noComments: {
    textAlign: 'center',
    color: Colors.light.tabIconDefault,
    marginTop: 24,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  commentAvatar: {
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
  },
  commentTime: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  commentInputContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.tabIconDefault + '20',
  },
  avatarPlaceholder2: {},
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 20,
    paddingHorizontal: 12,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    minHeight: 36,
    fontSize: 14,
    color: Colors.light.text,
  },
});
