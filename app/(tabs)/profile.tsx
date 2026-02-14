import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, Moment } from '@/contexts/AppContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, getUserItems, getUserMoments, logout, appreciateMoment, items } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.setupContent, { paddingTop: insets.top + 60 + webTopInset }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.setupIconWrap}>
            <Ionicons name="person-add" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.setupTitle}>Join the Community</Text>
          <Text style={styles.setupSubtitle}>Create your profile to start sharing and connecting</Text>
          <Pressable
            onPress={() => router.push('/auth')}
            style={({ pressed }) => [styles.setupBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.setupBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const userItems = getUserItems(currentUser.id);
  const userMoments = getUserMoments(currentUser.id);
  const totalAppreciations = userItems.reduce((sum, i) => sum + i.appreciations, 0);
  const activeItems = userItems.filter(i => i.status === 'available');
  const sharedItems = userItems.filter(i => i.status === 'claimed' || i.status === 'completed');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.profileContent, { paddingTop: insets.top + 16 + webTopInset, paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topActions}>
          <Pressable onPress={() => router.push('/edit-profile')} hitSlop={12}>
            <Feather name="edit-2" size={20} color={Colors.text} />
          </Pressable>
          <Pressable
            onPress={async () => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await logout();
            }}
            hitSlop={12}
          >
            <Feather name="log-out" size={20} color={Colors.error} />
          </Pressable>
        </View>

        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileAvatarLargeText}>
              {currentUser.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{currentUser.displayName}</Text>
          <Text style={styles.profileUsername}>@{currentUser.username}</Text>
          {currentUser.bio ? <Text style={styles.profileBio}>{currentUser.bio}</Text> : null}
          <View style={styles.verifiedRow}>
            {currentUser.emailVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="mail" size={12} color={Colors.success} />
                <Text style={styles.verifiedLabel}>Email</Text>
              </View>
            )}
            {currentUser.phoneVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="call" size={12} color={Colors.success} />
                <Text style={styles.verifiedLabel}>Phone</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userItems.length}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalAppreciations}</Text>
            <Text style={styles.statLabel}>Appreciated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeItems.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {userMoments.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>My Moments</Text>
            {userMoments.map(moment => (
              <MomentCard key={moment.id} moment={moment} onAppreciate={() => appreciateMoment(moment.id)} currentUserId={currentUser.id} />
            ))}
          </View>
        )}

        {activeItems.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Active Shares</Text>
            {activeItems.map(item => (
              <Pressable key={item.id} onPress={() => router.push(`/item/${item.id}`)} style={styles.miniCard}>
                <View style={[styles.miniIcon, { backgroundColor: getCatColor(item.category) + '12' }]}>
                  <Ionicons name={getCatIconName(item.category)} size={18} color={getCatColor(item.category)} />
                </View>
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.miniMeta}>{item.category} · {item.requests.length} requests</Text>
                </View>
                <View style={styles.miniAppreciation}>
                  <Ionicons name="heart" size={14} color={Colors.appreciate} />
                  <Text style={styles.miniCount}>{item.appreciations}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {sharedItems.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sharing History</Text>
            {sharedItems.map(item => (
              <Pressable key={item.id} onPress={() => router.push(`/item/${item.id}`)} style={[styles.miniCard, { opacity: 0.7 }]}>
                <View style={[styles.miniIcon, { backgroundColor: Colors.success + '12' }]}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                </View>
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.miniMeta}>Given away</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {userItems.length === 0 && userMoments.length === 0 && (
          <View style={styles.emptyProfile}>
            <Feather name="gift" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyProfileTitle}>No items shared yet</Text>
            <Text style={styles.emptyProfileText}>Tap the + button to share your first item</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function MomentCard({ moment, onAppreciate, currentUserId }: { moment: Moment; onAppreciate: () => void; currentUserId: string }) {
  const isAppreciated = moment.appreciatedBy.includes(currentUserId);
  return (
    <View style={styles.momentCard}>
      <View style={styles.momentHeader}>
        <View style={[styles.momentRoleBadge, { backgroundColor: moment.role === 'giver' ? Colors.secondary + '12' : Colors.primary + '12' }]}>
          <Ionicons
            name={moment.role === 'giver' ? 'gift-outline' : 'heart-outline'}
            size={14}
            color={moment.role === 'giver' ? Colors.secondary : Colors.primary}
          />
          <Text style={[styles.momentRoleText, { color: moment.role === 'giver' ? Colors.secondary : Colors.primary }]}>
            {moment.role === 'giver' ? 'Gave' : 'Received'}
          </Text>
        </View>
        <Text style={styles.momentItemTitle} numberOfLines={1}>{moment.itemTitle}</Text>
      </View>
      <Text style={styles.momentCaption}>{moment.caption}</Text>
      <Pressable onPress={onAppreciate} style={styles.momentAppreciateRow}>
        <Ionicons name={isAppreciated ? 'heart' : 'heart-outline'} size={18} color={isAppreciated ? Colors.appreciate : Colors.textTertiary} />
        <Text style={[styles.momentAppreciateCount, isAppreciated && { color: Colors.appreciate }]}>{moment.appreciations}</Text>
      </Pressable>
    </View>
  );
}

function getCatColor(cat: string) {
  return (Colors.categories as any)[cat.toLowerCase()] || Colors.categories.other;
}
function getCatIconName(cat: string): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    Books: 'book-outline', Clothes: 'shirt-outline', Electronics: 'laptop-outline',
    Furniture: 'bed-outline', Toys: 'game-controller-outline', Kitchen: 'restaurant-outline',
    Sports: 'bicycle-outline',
  };
  return map[cat] || 'cube-outline';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  setupContent: { alignItems: 'center', paddingHorizontal: 40 },
  setupIconWrap: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: Colors.primary + '12',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  setupTitle: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, textAlign: 'center', marginBottom: 8 },
  setupSubtitle: { fontSize: 15, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  setupBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16,
  },
  setupBtnText: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: '#fff' },
  profileContent: { paddingHorizontal: 20 },
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 20, marginBottom: 4 },
  profileHeader: { alignItems: 'center', marginBottom: 20 },
  profileAvatarLarge: {
    width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  profileAvatarLargeText: { fontSize: 34, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  profileName: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  profileUsername: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginTop: 2 },
  profileBio: {
    fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary,
    textAlign: 'center', marginTop: 8, lineHeight: 20, paddingHorizontal: 20,
  },
  verifiedRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '10',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  verifiedLabel: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: Colors.success },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  statLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: Colors.border, marginVertical: 4 },
  sectionContainer: { marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 12 },
  miniCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 12,
    padding: 12, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  miniIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  miniInfo: { flex: 1, marginLeft: 12 },
  miniTitle: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  miniMeta: { fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginTop: 2 },
  miniAppreciation: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniCount: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  momentCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 14, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
  },
  momentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  momentRoleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  momentRoleText: { fontSize: 11, fontFamily: 'Nunito_700Bold' },
  momentItemTitle: { flex: 1, fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  momentCaption: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.text, lineHeight: 21 },
  momentAppreciateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
  momentAppreciateCount: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  emptyProfile: { alignItems: 'center', paddingTop: 40, paddingHorizontal: 40 },
  emptyProfileTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginTop: 16 },
  emptyProfileText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', marginTop: 6 },
});
