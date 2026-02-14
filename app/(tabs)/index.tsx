import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, Moment, ShareItem } from '@/contexts/AppContext';
import ItemCard from '@/components/ItemCard';
import RequestSheet from '@/components/RequestSheet';

type FeedItem = { type: 'moment'; data: Moment } | { type: 'item'; data: ShareItem };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { items, moments, currentUser, requestItem, appreciateMoment } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [showMoments, setShowMoments] = useState(false);
  const [requestModal, setRequestModal] = useState<{ visible: boolean; itemId: string; itemTitle: string }>({
    visible: false, itemId: '', itemTitle: '',
  });

  const availableItems = items.filter(i => i.status === 'available' || i.status === 'claimed');

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 12 + webTopInset }]}>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greeting}>
            {currentUser ? `Hey, ${currentUser.displayName.split(' ')[0]}` : 'Welcome'}
          </Text>
          <Text style={styles.subtitle}>Discover free items nearby</Text>
        </View>
        <Pressable style={styles.notifBtn} hitSlop={8} onPress={() => router.push('/(tabs)/activity')}>
          <Ionicons name="notifications-outline" size={22} color={Colors.text} />
        </Pressable>
      </View>

      <View style={styles.feedToggle}>
        <Pressable
          onPress={() => setShowMoments(false)}
          style={[styles.toggleBtn, !showMoments && styles.toggleBtnActive]}
        >
          <Ionicons name="grid-outline" size={16} color={!showMoments ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.toggleText, !showMoments && styles.toggleTextActive]}>Items</Text>
        </Pressable>
        <Pressable
          onPress={() => setShowMoments(true)}
          style={[styles.toggleBtn, showMoments && styles.toggleBtnActive]}
        >
          <Ionicons name="sparkles-outline" size={16} color={showMoments ? '#fff' : Colors.textSecondary} />
          <Text style={[styles.toggleText, showMoments && styles.toggleTextActive]}>Moments</Text>
        </Pressable>
      </View>
    </View>
  );

  if (showMoments) {
    return (
      <View style={styles.container}>
        <FlatList
          data={moments}
          keyExtractor={(m) => m.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item: moment }) => {
            const isAppreciated = currentUser ? moment.appreciatedBy.includes(currentUser.id) : false;
            return (
              <View style={styles.momentCard}>
                <View style={styles.momentUserRow}>
                  <View style={styles.momentAvatar}>
                    <Text style={styles.momentAvatarText}>{moment.username.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.momentUserInfo}>
                    <Text style={styles.momentUsername}>{moment.username}</Text>
                    <View style={[styles.momentRoleBadge, { backgroundColor: moment.role === 'giver' ? Colors.secondary + '12' : Colors.primary + '12' }]}>
                      <Ionicons
                        name={moment.role === 'giver' ? 'gift-outline' : 'heart-outline'}
                        size={12}
                        color={moment.role === 'giver' ? Colors.secondary : Colors.primary}
                      />
                      <Text style={[styles.momentRoleText, { color: moment.role === 'giver' ? Colors.secondary : Colors.primary }]}>
                        {moment.role === 'giver' ? 'Gave' : 'Received'} {moment.itemTitle}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.momentCaption}>{moment.caption}</Text>
                <Pressable
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    appreciateMoment(moment.id);
                  }}
                  style={styles.momentAppreciateRow}
                >
                  <Ionicons name={isAppreciated ? 'heart' : 'heart-outline'} size={20} color={isAppreciated ? Colors.appreciate : Colors.textTertiary} />
                  <Text style={[styles.momentAppreciateCount, isAppreciated && { color: Colors.appreciate }]}>{moment.appreciations}</Text>
                </Pressable>
              </View>
            );
          }}
          contentContainerStyle={[styles.listContent, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="sparkles-outline" size={48} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No moments yet</Text>
              <Text style={styles.emptyText}>Moments appear here after items are exchanged</Text>
            </View>
          }
        />
        <Pressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/create');
          }}
          style={({ pressed }) => [
            styles.fab,
            { bottom: 100 + (Platform.OS === 'web' ? 34 : 0), transform: [{ scale: pressed ? 0.92 : 1 }] },
          ]}
        >
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={availableItems}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <ItemCard
            item={item}
            onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })}
            onRequest={currentUser && item.userId !== currentUser.id ? () => {
              setRequestModal({ visible: true, itemId: item.id, itemTitle: item.title });
            } : undefined}
          />
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyText}>Be the first to share something with your community</Text>
          </View>
        }
      />

      <Pressable
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/create');
        }}
        style={({ pressed }) => [
          styles.fab,
          { bottom: 100 + (Platform.OS === 'web' ? 34 : 0), transform: [{ scale: pressed ? 0.92 : 1 }] },
        ]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>

      <RequestSheet
        visible={requestModal.visible}
        itemTitle={requestModal.itemTitle}
        onClose={() => setRequestModal({ visible: false, itemId: '', itemTitle: '' })}
        onSubmit={(reason) => requestItem(requestModal.itemId, reason)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  headerContainer: { paddingHorizontal: 20, paddingBottom: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 26, fontFamily: 'Nunito_800ExtraBold', color: Colors.text },
  subtitle: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginTop: 2 },
  notifBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  feedToggle: {
    flexDirection: 'row', backgroundColor: Colors.surfaceSecondary, borderRadius: 14,
    padding: 3, marginTop: 14,
  },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 9, borderRadius: 12,
  },
  toggleBtnActive: { backgroundColor: Colors.primary },
  toggleText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.textSecondary },
  toggleTextActive: { color: '#fff' },
  listContent: { paddingTop: 8 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: Colors.text, marginTop: 16 },
  emptyText: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, textAlign: 'center', marginTop: 6 },
  fab: {
    position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35,
    shadowRadius: 8, elevation: 6, zIndex: 10,
  },
  momentCard: {
    backgroundColor: Colors.surface, marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  momentUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  momentAvatar: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.secondary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  momentAvatarText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.secondary },
  momentUserInfo: { flex: 1 },
  momentUsername: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: Colors.text },
  momentRoleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 2 },
  momentRoleText: { fontSize: 11, fontFamily: 'Nunito_600SemiBold' },
  momentCaption: { fontSize: 15, fontFamily: 'Nunito_400Regular', color: Colors.text, lineHeight: 22 },
  momentAppreciateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  momentAppreciateCount: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
});
