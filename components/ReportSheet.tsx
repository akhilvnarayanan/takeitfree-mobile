import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, Modal, Platform, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp, REPORT_REASONS, ReportReason } from '@/contexts/AppContext';

interface ReportSheetProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUsername: string;
}

export default function ReportSheet({ visible, onClose, reportedUserId, reportedUsername }: ReportSheetProps) {
  const { currentUser, addReport } = useApp();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !currentUser) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(true);
    await addReport({
      reporterId: currentUser.id,
      reporterName: currentUser.displayName,
      reportedUserId,
      reportedUsername,
      reason: selectedReason,
      details: details.trim(),
    });
    setIsSubmitting(false);
    setSelectedReason(null);
    setDetails('');
    onClose();
    Alert.alert('Report Submitted', 'Thank you for helping keep the community safe. We\'ll review this report shortly.');
  };

  const handleClose = () => {
    setSelectedReason(null);
    setDetails('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Pressable onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </Pressable>
            <Text style={styles.headerTitle}>Report User</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.subtitle}>
              Why are you reporting @{reportedUsername}?
            </Text>

            <View style={styles.reasonList}>
              {REPORT_REASONS.map(reason => (
                <Pressable
                  key={reason.key}
                  onPress={() => {
                    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedReason(reason.key);
                  }}
                  style={[
                    styles.reasonItem,
                    selectedReason === reason.key && styles.reasonItemActive,
                  ]}
                >
                  <Ionicons
                    name={reason.icon as any}
                    size={20}
                    color={selectedReason === reason.key ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[
                    styles.reasonText,
                    selectedReason === reason.key && styles.reasonTextActive,
                  ]}>
                    {reason.label}
                  </Text>
                  {selectedReason === reason.key && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  )}
                </Pressable>
              ))}
            </View>

            <Text style={styles.detailsLabel}>Additional details (optional)</Text>
            <TextInput
              style={styles.detailsInput}
              value={details}
              onChangeText={setDetails}
              placeholder="Tell us more about what happened..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={500}
            />

            <Pressable
              onPress={handleSubmit}
              disabled={!selectedReason || isSubmitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { opacity: selectedReason ? (pressed ? 0.9 : 1) : 0.5 },
              ]}
            >
              <Ionicons name="shield-checkmark" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '85%', paddingBottom: 40,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, textAlign: 'center' },
  subtitle: {
    fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary,
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12,
  },
  reasonList: { paddingHorizontal: 20, gap: 8 },
  reasonItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14,
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
  },
  reasonItemActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + '08' },
  reasonText: { flex: 1, fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.text },
  reasonTextActive: { color: Colors.primary },
  detailsLabel: {
    fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary,
    paddingHorizontal: 20, marginTop: 20, marginBottom: 8,
  },
  detailsInput: {
    marginHorizontal: 20, backgroundColor: Colors.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, fontFamily: 'Nunito_400Regular',
    color: Colors.text, borderWidth: 1, borderColor: Colors.border, minHeight: 80,
  },
  submitBtn: {
    marginHorizontal: 20, marginTop: 24, backgroundColor: Colors.error, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14,
  },
  submitBtnText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#fff' },
});
