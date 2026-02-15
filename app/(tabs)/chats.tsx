import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ChatsScreen() {
  const insets = useSafeAreaInsets();
  const { chats, currentUser, deleteChat } = useApp();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Please log in to view chats</Text>
      </View>
    );
  }

  const handleChatPress = (chatId: string) => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/chats/${chatId}`);
  };

  const handleDeleteChat = (chatId: string) => {
    Alert.alert(
      'Delete Chat',
      'Are you sure you want to delete this conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteChat(chatId);
            setSelectedChatId(null);
          },
        },
      ]
    );
  };

  const renderChatItem = ({ item }: { item: any }) => {
    const isSelected = selectedChatId === item.id;
    const otherParticipant = currentUser.id === item.participantOneId 
      ? item.participantTwoName 
      : item.participantOneName;

    return (
      <Pressable
        style={[styles.chatItem, isSelected && styles.chatItemSelected]}
        onPress={() => handleChatPress(item.id)}
        onLongPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setSelectedChatId(item.id);
        }}
      >
        <View style={styles.chatItemContent}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person-circle" size={48} color={Colors.light.tint} />
            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{Math.min(item.unreadCount, 9)}</Text>
              </View>
            )}
          </View>

          <View style={styles.chatInfo}>
            <Text style={styles.chatName}>{otherParticipant}</Text>
            {item.itemTitle && (
              <Text style={styles.itemTitle}>Re: {item.itemTitle}</Text>
            )}
            {item.lastMessage && (
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            )}
          </View>

          <View style={styles.chatMeta}>
            {item.lastMessageTime && (
              <Text style={styles.timestamp}>
                {new Date(item.lastMessageTime).toLocaleDateString()}
              </Text>
            )}
          </View>
        </View>

        {isSelected && (
          <View style={styles.actionButtons}>
            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteChat(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#e74c3c" />
            </Pressable>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Messages</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>Start a conversation with someone from their profile</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChatItem}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '20',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 8,
    textAlign: 'center',
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '10',
    alignItems: 'center',
  },
  chatItemSelected: {
    backgroundColor: Colors.light.background,
  },
  chatItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    marginRight: 12,
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#e74c3c',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  chatInfo: {
    flex: 1,
    marginRight: 12,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  itemTitle: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 13,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
  },
});
