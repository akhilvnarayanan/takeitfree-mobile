import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import CategoryPill from '@/components/CategoryPill';

const CONDITIONS = ['Like New', 'Excellent', 'Very Good', 'Good', 'Fair'];

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, addItem, categories } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [story, setStory] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [pickupInfo, setPickupInfo] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && description.trim() && category && condition && currentUser;

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      setImages(prev => [...prev, ...result.assets.map(a => a.uri)].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      await addItem({
        userId: currentUser!.id,
        username: currentUser!.username,
        userAvatar: currentUser!.avatar,
        title: title.trim(),
        description: description.trim(),
        story: story.trim(),
        category,
        condition,
        pickupInfo: pickupInfo.trim(),
        images,
        location: location.trim(),
      });
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Failed to share item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 60 }]}>
        <View style={styles.notLoggedIn}>
          <Ionicons name="person-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.notLoggedTitle}>Create a Profile First</Text>
          <Text style={styles.notLoggedText}>Go to the Profile tab to set up your account before sharing items</Text>
          <Pressable onPress={() => router.back()} style={styles.goBackBtn}>
            <Text style={styles.goBackBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={26} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Share Item</Text>
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          style={({ pressed }) => [
            styles.postBtn,
            { opacity: canSubmit && !submitting ? (pressed ? 0.8 : 1) : 0.4 },
          ]}
        >
          <Text style={styles.postBtnText}>{submitting ? 'Posting...' : 'Share'}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={pickImage} style={styles.imagePickerArea}>
          {images.length > 0 ? (
            <View style={styles.imagePreviewRow}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.imageThumbnail}>
                  <View style={[styles.imageThumbInner, { backgroundColor: Colors.secondary + '15' }]}>
                    <Ionicons name="image" size={20} color={Colors.secondary} />
                  </View>
                  <Pressable
                    onPress={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                    style={styles.removeImageBtn}
                  >
                    <Ionicons name="close-circle" size={20} color={Colors.error} />
                  </Pressable>
                </View>
              ))}
              {images.length < 5 && (
                <View style={styles.addMoreBtn}>
                  <Ionicons name="add" size={24} color={Colors.textTertiary} />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.imagePickerEmpty}>
              <Ionicons name="camera-outline" size={32} color={Colors.textTertiary} />
              <Text style={styles.imagePickerText}>Add Photos</Text>
              <Text style={styles.imagePickerHint}>Up to 5 photos</Text>
            </View>
          )}
        </Pressable>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="What are you sharing?"
          placeholderTextColor={Colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.multiInput]}
          placeholder="Describe the item..."
          placeholderTextColor={Colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Your Story</Text>
        <TextInput
          style={[styles.input, styles.multiInput]}
          placeholder="Why are you sharing this? What does it mean to you?"
          placeholderTextColor={Colors.textTertiary}
          value={story}
          onChangeText={setStory}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Category *</Text>
        <View style={styles.pillGrid}>
          {categories.map(cat => (
            <CategoryPill
              key={cat}
              name={cat}
              isSelected={category === cat}
              onPress={() => setCategory(category === cat ? '' : cat)}
            />
          ))}
        </View>

        <Text style={styles.label}>Condition *</Text>
        <View style={styles.conditionRow}>
          {CONDITIONS.map(c => (
            <Pressable
              key={c}
              onPress={() => setCondition(condition === c ? '' : c)}
              style={[styles.conditionPill, condition === c && styles.conditionPillActive]}
            >
              <Text style={[styles.conditionPillText, condition === c && styles.conditionPillTextActive]}>
                {c}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="General area (e.g., Downtown)"
          placeholderTextColor={Colors.textTertiary}
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Pickup Info</Text>
        <TextInput
          style={[styles.input, styles.multiInput]}
          placeholder="When and how can someone pick this up?"
          placeholderTextColor={Colors.textTertiary}
          value={pickupInfo}
          onChangeText={setPickupInfo}
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
  },
  postBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postBtnText: {
    fontSize: 14,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  formContent: {
    padding: 20,
  },
  imagePickerArea: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 20,
    overflow: 'hidden',
  },
  imagePickerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  imagePickerText: {
    fontSize: 15,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginTop: 8,
  },
  imagePickerHint: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textTertiary,
    marginTop: 4,
  },
  imagePreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 8,
  },
  imageThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: 'visible',
    position: 'relative',
  },
  imageThumbInner: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeImageBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  addMoreBtn: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  multiInput: {
    minHeight: 80,
  },
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  conditionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  conditionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  conditionPillActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  conditionPillText: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  conditionPillTextActive: {
    color: '#fff',
  },
  notLoggedIn: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  notLoggedTitle: {
    fontSize: 20,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 16,
  },
  notLoggedText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  goBackBtn: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  goBackBtnText: {
    fontSize: 15,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
});
