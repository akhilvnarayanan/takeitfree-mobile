import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function CreateMomentScreen() {
  const insets = useSafeAreaInsets();
  const { itemId, itemTitle, role } = useLocalSearchParams<{ itemId: string; itemTitle: string; role: string }>();
  const { currentUser, addMoment } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!caption.trim()) {
      Alert.alert('Missing Caption', 'Please add a caption for your moment.');
      return;
    }
    if (!currentUser) return;

    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSubmitting(true);
    await addMoment({
      userId: currentUser.id,
      username: currentUser.username,
      userAvatar: currentUser.avatar,
      itemId: itemId || '',
      itemTitle: itemTitle || '',
      caption: caption.trim(),
      imageUri,
      role: (role as 'giver' | 'receiver') || 'receiver',
    });
    setIsSubmitting(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 + webTopInset }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Share Moment</Text>
        <Pressable onPress={handleSubmit} disabled={isSubmitting || !caption.trim()} hitSlop={12}>
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="checkmark" size={26} color={caption.trim() ? Colors.primary : Colors.textTertiary} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.exchangeInfo}>
          <View style={styles.exchangeIcon}>
            <Ionicons name={role === 'giver' ? 'gift-outline' : 'heart-outline'} size={22} color={Colors.primary} />
          </View>
          <View style={styles.exchangeTextWrap}>
            <Text style={styles.exchangeLabel}>
              {role === 'giver' ? 'You gave away' : 'You received'}
            </Text>
            <Text style={styles.exchangeTitle} numberOfLines={1}>{itemTitle || 'An item'}</Text>
          </View>
        </View>

        <Pressable onPress={handlePickImage} style={styles.imagePickerCard}>
          {imageUri ? (
            <View style={styles.imagePreview}>
              <Ionicons name="image" size={48} color={Colors.primary} />
              <Text style={styles.imagePickerText}>Photo selected</Text>
              <Text style={styles.imagePickerHint}>Tap to change</Text>
            </View>
          ) : (
            <View style={styles.imagePickerEmpty}>
              <View style={styles.imagePickerIcon}>
                <Ionicons name="camera-outline" size={32} color={Colors.primary} />
              </View>
              <Text style={styles.imagePickerText}>Add a Photo</Text>
              <Text style={styles.imagePickerHint}>Share the exchange moment</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          value={caption}
          onChangeText={setCaption}
          placeholder="Tell the story of this exchange..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={280}
        />
        <Text style={styles.charCount}>{caption.length}/280</Text>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={18} color={Colors.accent} />
          <Text style={styles.tipText}>
            Share how this exchange made you feel. Your story inspires others to share too!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, gap: 12,
  },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, textAlign: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 20 },
  exchangeInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary + '08', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.primary + '15', marginBottom: 24,
  },
  exchangeIcon: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  exchangeTextWrap: { flex: 1 },
  exchangeLabel: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary },
  exchangeTitle: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, marginTop: 2 },
  imagePickerCard: {
    borderRadius: 16, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed',
    overflow: 'hidden', marginBottom: 24,
  },
  imagePickerEmpty: { alignItems: 'center', paddingVertical: 40 },
  imagePreview: { alignItems: 'center', paddingVertical: 40, backgroundColor: Colors.primary + '05' },
  imagePickerIcon: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary + '10',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  imagePickerText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: Colors.text, marginTop: 4 },
  imagePickerHint: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textTertiary, marginTop: 4 },
  label: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginBottom: 8 },
  captionInput: {
    backgroundColor: Colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 16,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.text, borderWidth: 1,
    borderColor: Colors.border, minHeight: 120,
  },
  charCount: {
    fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textTertiary, textAlign: 'right', marginTop: 6,
  },
  tipCard: {
    flexDirection: 'row', gap: 10, backgroundColor: Colors.accent + '10', borderRadius: 12,
    padding: 14, marginTop: 20,
  },
  tipText: { flex: 1, fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.text, lineHeight: 20 },
});
