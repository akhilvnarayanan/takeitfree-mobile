import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import ItemCard from '@/components/ItemCard';
import CategoryPill from '@/components/CategoryPill';
import RequestSheet from '@/components/RequestSheet';

export default function DiscoverScreen() {
  const insets = useSafeAreaInsets();
  const { items, categories, currentUser, requestItem } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [requestModal, setRequestModal] = useState<{ visible: boolean; itemId: string; itemTitle: string }>({
    visible: false, itemId: '', itemTitle: '',
  });

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const filteredItems = useMemo(() => {
    let filtered = items.filter(i => i.status === 'available');
    if (selectedCategory) {
      filtered = filtered.filter(i => i.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [items, selectedCategory, search]);

  const trendingItems = useMemo(() => {
    return [...items]
      .filter(i => i.status === 'available')
      .sort((a, b) => b.appreciations - a.appreciations)
      .slice(0, 5);
  }, [items]);

  const showTrending = !selectedCategory && !search.trim();

  const renderHeader = () => (
    <View>
      <View style={[styles.topSection, { paddingTop: insets.top + 12 + webTopInset }]}>
        <Text style={styles.title}>Discover</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={Colors.textTertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search items..."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScroll}
      >
        <CategoryPill
          name="All"
          isSelected={!selectedCategory}
          onPress={() => setSelectedCategory(null)}
        />
        {categories.map(cat => (
          <CategoryPill
            key={cat}
            name={cat}
            isSelected={selectedCategory === cat}
            onPress={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
          />
        ))}
      </ScrollView>

      {showTrending && trendingItems.length > 0 && (
        <View style={styles.trendingSection}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Trending</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingScroll}>
            {trendingItems.map(item => (
              <TrendingCard key={item.id} item={item} onPress={() => router.push({ pathname: '/item/[id]', params: { id: item.id } })} />
            ))}
          </ScrollView>
        </View>
      )}

      {filteredItems.length > 0 && (
        <View style={styles.resultHeader}>
          <Text style={styles.resultCount}>
            {selectedCategory ? selectedCategory : 'All items'} ({filteredItems.length})
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No items found</Text>
            <Text style={styles.emptyText}>Try a different search or category</Text>
          </View>
        }
      />
      <RequestSheet
        visible={requestModal.visible}
        itemTitle={requestModal.itemTitle}
        onClose={() => setRequestModal({ visible: false, itemId: '', itemTitle: '' })}
        onSubmit={(reason) => requestItem(requestModal.itemId, reason)}
      />
    </View>
  );
}

function TrendingCard({ item, onPress }: { item: any; onPress: () => void }) {
  const catColor = (Colors.categories as any)[item.category.toLowerCase()] || Colors.categories.other;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.trendingCard, { opacity: pressed ? 0.9 : 1 }]}>
      <View style={[styles.trendingIcon, { backgroundColor: catColor + '15' }]}>
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
          size={24}
          color={catColor}
        />
      </View>
      <Text style={styles.trendingTitle} numberOfLines={1}>{item.title}</Text>
      <View style={styles.trendingMeta}>
        <Ionicons name="heart" size={12} color={Colors.appreciate} />
        <Text style={styles.trendingCount}>{item.appreciations}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    marginLeft: 10,
    height: '100%',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  trendingSection: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  trendingScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  trendingCard: {
    width: 140,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  trendingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  trendingTitle: {
    fontSize: 13,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 6,
  },
  trendingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendingCount: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  resultHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  resultCount: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  listContent: {
    paddingTop: 4,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
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
});
