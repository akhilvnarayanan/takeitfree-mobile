import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, setupProfile, getUserItems, items } = useApp();
  const [isSetup, setIsSetup] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  if (!currentUser && !isSetup) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.setupContent, { paddingTop: insets.top + 40 + webTopInset }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.setupIconWrap}>
            <Ionicons name="person-add" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.setupTitle}>Join the Community</Text>
          <Text style={styles.setupSubtitle}>Create your profile to start sharing and connecting</Text>
          <Pressable
            onPress={() => setIsSetup(true)}
            style={({ pressed }) => [styles.setupBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Text style={styles.setupBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (!currentUser && isSetup) {
    const canSubmit = username.trim().length >= 3 && displayName.trim().length >= 2;
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 20 + webTopInset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => setIsSetup(false)} style={styles.backBtn} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </Pressable>
          <Text style={styles.formTitle}>Create Profile</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., akhil_shares"
            placeholderTextColor={Colors.textTertiary}
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            placeholderTextColor={Colors.textTertiary}
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Text style={styles.label}>Bio (optional)</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            placeholder="Tell the community about yourself..."
            placeholderTextColor={Colors.textTertiary}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Pressable
            onPress={async () => {
              if (!canSubmit) return;
              if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await setupProfile({
                username: username.trim(),
                displayName: displayName.trim(),
                bio: bio.trim(),
                avatar: null,
              });
            }}
            style={({ pressed }) => [
              styles.createBtn,
              { opacity: canSubmit ? (pressed ? 0.9 : 1) : 0.5 },
            ]}
            disabled={!canSubmit}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Create Profile</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  const userItems = getUserItems(currentUser!.id);
  const totalAppreciations = userItems.reduce((sum, i) => sum + i.appreciations, 0);
  const activeItems = userItems.filter(i => i.status === 'available');
  const sharedItems = userItems.filter(i => i.status === 'claimed' || i.status === 'completed');

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.profileContent, { paddingTop: insets.top + 16 + webTopInset, paddingBottom: 100 + (Platform.OS === 'web' ? 34 : 0) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatarLarge}>
            <Text style={styles.profileAvatarLargeText}>
              {currentUser!.displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{currentUser!.displayName}</Text>
          <Text style={styles.profileUsername}>@{currentUser!.username}</Text>
          {currentUser!.bio ? (
            <Text style={styles.profileBio}>{currentUser!.bio}</Text>
          ) : null}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userItems.length}</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalAppreciations}</Text>
            <Text style={styles.statLabel}>Appreciated</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeItems.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
        </View>

        {activeItems.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Active Shares</Text>
            {activeItems.map(item => (
              <View key={item.id} style={styles.miniCard}>
                <View style={[styles.miniIcon, { backgroundColor: getCatColor(item.category) + '12' }]}>
                  <Ionicons name={getCatIconName(item.category)} size={18} color={getCatColor(item.category)} />
                </View>
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.miniMeta}>{item.category} · {item.requests.length} requests</Text>
                </View>
                <View style={styles.miniAppreciation}>
                  <Ionicons name="heart" size={14} color={Colors.appreciate} />
                  <Text style={styles.miniCount}>{item.appreciations}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {sharedItems.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Sharing History</Text>
            {sharedItems.map(item => (
              <View key={item.id} style={[styles.miniCard, { opacity: 0.7 }]}>
                <View style={[styles.miniIcon, { backgroundColor: Colors.success + '12' }]}>
                  <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                </View>
                <View style={styles.miniInfo}>
                  <Text style={styles.miniTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.miniMeta}>Given away</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {userItems.length === 0 && (
          <View style={styles.emptyProfile}>
            <Feather name="gift" size={40} color={Colors.textTertiary} />
            <Text style={styles.emptyProfileTitle}>No items shared yet</Text>
            <Text style={styles.emptyProfileText}>Tap the + button to share your first item</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function getCatColor(cat: string) {
  return (Colors.categories as any)[cat.toLowerCase()] || Colors.categories.other;
}
function getCatIconName(cat: string): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    Books: 'book-outline', Clothes: 'shirt-outline', Electronics: 'laptop-outline',
    Furniture: 'bed-outline', Toys: 'game-controller-outline', Kitchen: 'restaurant-outline',
    Sports: 'bicycle-outline',
  };
  return map[cat] || 'cube-outline';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  setupContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  setupIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + '12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  setupTitle: {
    fontSize: 26,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  setupSubtitle: {
    fontSize: 15,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  setupBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  setupBtnText: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  formContent: {
    paddingHorizontal: 20,
  },
  backBtn: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 28,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  bioInput: {
    minHeight: 80,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,
  },
  createBtnText: {
    fontSize: 16,
    fontFamily: 'Nunito_700Bold',
    color: '#fff',
  },
  profileContent: {
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileAvatarLarge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  profileAvatarLargeText: {
    fontSize: 34,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.primary,
  },
  profileName: {
    fontSize: 22,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  profileUsername: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileBio: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Nunito_800ExtraBold',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginBottom: 12,
  },
  miniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  miniIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniInfo: {
    flex: 1,
    marginLeft: 12,
  },
  miniTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.text,
  },
  miniMeta: {
    fontSize: 12,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  miniAppreciation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniCount: {
    fontSize: 13,
    fontFamily: 'Nunito_600SemiBold',
    color: Colors.textSecondary,
  },
  emptyProfile: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  emptyProfileTitle: {
    fontSize: 17,
    fontFamily: 'Nunito_700Bold',
    color: Colors.text,
    marginTop: 16,
  },
  emptyProfileText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
