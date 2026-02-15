import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface RequestSheetProps {
  visible: boolean;
  itemTitle: string;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export default function RequestSheet({ visible, itemTitle, onClose, onSubmit }: RequestSheetProps) {
  const [reason, setReason] = useState('');
  const insets = useSafeAreaInsets();

  const handleSubmit = () => {
    if (!reason.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onSubmit(reason.trim());
    setReason('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Request Item</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Colors.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.itemLabel}>Requesting:</Text>
          <Text style={styles.itemName}>{itemTitle}</Text>

          <Text style={styles.inputLabel}>Why do you need this item?</Text>
          <TextInput
            style={styles.input}
            placeholder="Share your reason briefly..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
            textAlignVertical="top"
          />

          <Pressable
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.submitBtn,
              { opacity: reason.trim() ? (pressed ? 0.9 : 1) : 0.5 },
            ]}
            disabled={!reason.trim()}
          >
            <Ionicons name="send" size={18} color="#fff" />
            <Text style={styles.submitText}>Send Request</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  itemLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    minHeight: 100,
    marginBottom: 20,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
  },
  submitText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
});
