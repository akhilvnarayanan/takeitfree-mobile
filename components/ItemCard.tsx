import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { ShareItem, useApp } from '@/contexts/AppContext';

interface ItemCardProps {
  item: ShareItem;
  onPress: () => void;
  onRequest?: () => void;
}

function getInitials(name: string) {
  return name.split('_').map(w => w[0]?.toUpperCase()).join('').slice(0, 2);
}

function getCategoryColor(category: string): string {
  const key = category.toLowerCase() as keyof typeof Colors.categories;
  return Colors.categories[key] || Colors.categories.other;
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

export default function ItemCard({ item, onPress, onRequest }: ItemCardProps) {
  const { currentUser, appreciateItem } = useApp();
  const isAppreciated = currentUser ? item.appreciatedBy.includes(currentUser.id) : false;
  const catColor = getCategoryColor(item.category);

  const handleAppreciate = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    appreciateItem(item.id);
  };

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: catColor + '20' }]}>
          <Text style={[styles.avatarText, { color: catColor }]}>{getInitials(item.username)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
            {item.location ? (
              <>
                <View style={styles.dot} />
                <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
                <Text style={styles.locationText}>{item.location}</Text>
              </>
            ) : null}
          </View>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: catColor + '15' }]}>
          <Text style={[styles.categoryText, { color: catColor }]}>{item.category}</Text>
        </View>
      </View>

      <View style={styles.imageArea}>
        <View style={[styles.placeholderImage, { backgroundColor: catColor + '12' }]}>
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
            size={48}
            color={catColor + '60'}
          />
        </View>
        {item.status === 'claimed' && (
          <View style={styles.claimedOverlay}>
            <Text style={styles.claimedText}>Claimed</Text>
          </View>
        )}
        <View style={[styles.conditionTag, { backgroundColor: Colors.surface }]}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {item.story ? (
          <Text style={styles.story} numberOfLines={2}>{item.story}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        <Pressable onPress={handleAppreciate} style={styles.actionBtn} hitSlop={8}>
          <Ionicons
            name={isAppreciated ? 'heart' : 'heart-outline'}
            size={22}
            color={isAppreciated ? Colors.appreciate : Colors.textSecondary}
          />
          <Text style={[styles.actionCount, isAppreciated && { color: Colors.appreciate }]}>
            {item.appreciations}
          </Text>
        </Pressable>

        <Pressable onPress={onPress} style={styles.actionBtn} hitSlop={8}>
          <Ionicons name="chatbubble-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.actionCount}>{item.commentCount}</Text>
        </Pressable>

        {item.status === 'available' && onRequest && (
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              onRequest();
            }}
            style={styles.requestBtn}
          >
            <Feather name="send" size={14} color={Colors.surface} />
            <Text style={styles.requestBtnText}>Request</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
    marginHorizontal: 6,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginLeft: 2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  imageArea: {
    height: 220,
    position: 'relative',
  },
  placeholderImage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimedText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 1,
  },
  conditionTag: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  conditionText: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 4,
  },
  story: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionCount: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginLeft: 'auto',
  },
  requestBtnText: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.surface,
  },
});
