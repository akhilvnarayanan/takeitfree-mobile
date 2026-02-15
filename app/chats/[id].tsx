import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Platform, KeyboardAvoidingView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { chats, messages, currentUser, sendMessage, getChatMessages, markMessagesAsRead } = useApp();
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const chat = chats.find(c => c.id === id);

  useEffect(() => {
    if (chat?.id) {
      markMessagesAsRead(chat.id);
    }
  }, [chat?.id, markMessagesAsRead]);

  if (!chat) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Chat not found</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Please log in to view messages</Text>
      </View>
    );
  }

  const otherParticipant = currentUser.id === chat.participantOneId
    ? { name: chat.participantTwoName, avatar: chat.participantTwoAvatar, id: chat.participantTwoId }
    : { name: chat.participantOneName, avatar: chat.participantOneAvatar, id: chat.participantOneId };

  const chatMessages = getChatMessages(chat.id);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setIsSending(true);
    sendMessage(chat.id, messageText.trim());
    setMessageText('');
    setIsSending(false);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isOwn = item.senderId === currentUser.id;
    return (
      <View style={[styles.messageContainer, isOwn && styles.ownMessage]}>
        <View style={[styles.messageBubble, isOwn && styles.ownMessageBubble]}>
          <Text style={[styles.messageText, isOwn && styles.ownMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isOwn && styles.ownMessageTime]}>
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.light.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{otherParticipant.name}</Text>
          {chat.itemTitle && (
            <Text style={styles.headerItem}>{chat.itemTitle}</Text>
          )}
        </View>
        <Pressable onPress={() => router.push(`/profile/${otherParticipant.id}`)}>
          <Ionicons name="person-circle" size={32} color={Colors.light.tint} />
        </Pressable>
      </View>

      {/* Messages List */}
      {chatMessages.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="chatbubble-outline" size={48} color={Colors.light.tabIconDefault} />
          <Text style={styles.emptyStateText}>No messages yet</Text>
          <Text style={styles.emptyStateSubtext}>Start the conversation!</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={chatMessages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          inverted
          scrollEnabled={true}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input Section */}
      <View style={[styles.inputContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={Colors.light.tabIconDefault}
            value={messageText}
            onChangeText={setMessageText}
            multiline
            maxLength={500}
            editable={!isSending}
          />
          <Pressable
            style={[styles.sendButton, (!messageText.trim() || isSending) && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault + '20',
    gap: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerItem: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 8,
  },
  messageContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'flex-end',
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.light.tabIconDefault + '10',
  },
  ownMessageBubble: {
    backgroundColor: Colors.light.tint,
  },
  messageText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.tabIconDefault + '20',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.tabIconDefault + '10',
    fontSize: 14,
    color: Colors.light.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
