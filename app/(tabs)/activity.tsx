import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, ItemRequest } from '@/contexts/AppContext';

type Tab = 'incoming' | 'outgoing';

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const { getIncomingRequests, getOutgoingRequests, approveRequest, declineRequest, currentUser } = useApp();
  const [tab, setTab] = useState<Tab>('incoming');

  const incoming = getIncomingRequests();
  const outgoing = getOutgoingRequests();
  const data = tab === 'incoming' ? incoming : outgoing;

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const renderRequest = ({ item }: { item: ItemRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestAvatar}>
          <Text style={styles.requestAvatarText}>
            {(tab === 'incoming' ? item.requesterName : item.ownerName).charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.requestInfo}>
          <Text style={styles.requestName}>
            {tab === 'incoming' ? item.requesterName : item.ownerName}
          </Text>
          <Text style={styles.requestItem} numberOfLines={1}>{item.itemTitle}</Text>
        </View>
        <View style={[styles.statusBadge, {
          backgroundColor:
            item.status === 'pending' ? Colors.warning + '15' :
            item.status === 'approved' ? Colors.success + '15' :
            Colors.error + '15'
        }]}>
          <Text style={[styles.statusText, {
            color:
              item.status === 'pending' ? Colors.warning :
              item.status === 'approved' ? Colors.success :
              Colors.error
          }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>Reason</Text>
        <Text style={styles.reasonText}>{item.reason}</Text>
      </View>

      {tab === 'incoming' && item.status === 'pending' && (
        <View style={styles.actionRow}>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              approveRequest(item.itemId, item.id);
            }}
            style={[styles.actionButton, styles.approveBtn]}
          >
            <Ionicons name="checkmark" size={18} color="#fff" />
            <Text style={styles.approveBtnText}>Approve</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              declineRequest(item.itemId, item.id);
            }}
            style={[styles.actionButton, styles.declineBtn]}
          >
            <Ionicons name="close" size={18} color={Colors.error} />
            <Text style={styles.declineBtnText}>Decline</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 12 + webTopInset }]}>
        <Text style={styles.title}>Activity</Text>
        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setTab('incoming')}
            style={[styles.tabBtn, tab === 'incoming' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === 'incoming' && styles.tabTextActive]}>
              Incoming{incoming.length > 0 ? ` (${incoming.length})` : ''}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('outgoing')}
            style={[styles.tabBtn, tab === 'outgoing' && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, tab === 'outgoing' && styles.tabTextActive]}>
              Sent{outgoing.length > 0 ? ` (${outgoing.length})` : ''}
            </Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={renderRequest}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name={tab === 'incoming' ? 'inbox' : 'send'} size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>
              {tab === 'incoming' ? 'No incoming requests' : 'No sent requests'}
            </Text>
            <Text style={styles.emptyText}>
              {tab === 'incoming'
                ? 'When someone requests your items, they\'ll appear here'
                : 'Items you request will show up here'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
  },
  tabBtnActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  requestCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.secondary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestAvatarText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.secondary,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  requestItem: {
    fontSize: 13,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Nunito_700Bold',
  },
  reasonBox: {
    marginTop: 12,
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 12,
  },
  reasonLabel: {
    fontSize: 11,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  approveBtn: {
    backgroundColor: Colors.success,
  },
  approveBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  declineBtn: {
    backgroundColor: Colors.error + '10',
    borderWidth: 1,
    borderColor: Colors.error + '30',
  },
  declineBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: Colors.error,
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
    lineHeight: 20,
  },
});
