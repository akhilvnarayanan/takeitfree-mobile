import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Platform, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import ItemCard from '@/components/ItemCard';
import RequestSheet from '@/components/RequestSheet';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { items, currentUser, requestItem } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [requestModal, setRequestModal] = useState<{ visible: boolean; itemId: string; itemTitle: string }>({
    visible: false,
    itemId: '',
    itemTitle: '',
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
    </View>
  );

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
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
          if (Platform.OS !== 'web') {
            import('expo-haptics').then(h => h.impactAsync(h.ImpactFeedbackStyle.Medium));
          }
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  listContent: {
    paddingTop: 8,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 10,
  },
});
