import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser, updateProfile } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [emailVerified, setEmailVerified] = useState(currentUser?.emailVerified || false);
  const [phoneVerified, setPhoneVerified] = useState(currentUser?.phoneVerified || false);
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [showPhoneVerify, setShowPhoneVerify] = useState(false);
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const emailChanged = email !== (currentUser?.email || '');
  const phoneChanged = phone !== (currentUser?.phone || '');

  useEffect(() => {
    if (emailChanged) {
      setEmailVerified(false);
      setShowEmailVerify(false);
    }
  }, [email]);

  useEffect(() => {
    if (phoneChanged) {
      setPhoneVerified(false);
      setShowPhoneVerify(false);
    }
  }, [phone]);

  const handleSendEmailCode = async () => {
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1200));
    setVerifying(false);
    setShowEmailVerify(true);
    Alert.alert('Code Sent', 'A verification code has been sent to your email.');
  };

  const handleVerifyEmail = async () => {
    if (emailCode.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the verification code.');
      return;
    }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1000));
    setVerifying(false);
    setEmailVerified(true);
    setShowEmailVerify(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSendPhoneCode = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1200));
    setVerifying(false);
    setShowPhoneVerify(true);
    Alert.alert('Code Sent', 'A verification code has been sent to your phone.');
  };

  const handleVerifyPhone = async () => {
    if (phoneCode.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the verification code.');
      return;
    }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1000));
    setVerifying(false);
    setPhoneVerified(true);
    setShowPhoneVerify(false);
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleSave = async () => {
    if (displayName.trim().length < 2) {
      Alert.alert('Invalid Name', 'Display name must be at least 2 characters.');
      return;
    }
    if (emailChanged && !emailVerified && email.trim()) {
      Alert.alert('Email Not Verified', 'Please verify your new email before saving.');
      return;
    }
    if (phoneChanged && !phoneVerified && phone.trim()) {
      Alert.alert('Phone Not Verified', 'Please verify your new phone number before saving.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSaving(true);
    await updateProfile({
      displayName: displayName.trim(),
      bio: bio.trim(),
      email: email.trim(),
      phone: phone.trim(),
      emailVerified: email.trim() ? emailVerified : false,
      phoneVerified: phone.trim() ? phoneVerified : false,
    });
    setSaving(false);
    router.back();
  };

  if (!currentUser) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 + webTopInset }]}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={saving} hitSlop={12}>
          {saving ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="checkmark" size={26} color={Colors.primary} />
          )}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>{displayName.charAt(0).toUpperCase() || '?'}</Text>
          </View>
          <Text style={styles.usernameLabel}>@{currentUser.username}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Info</Text>

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            placeholderTextColor={Colors.textTertiary}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell the community about yourself..."
            placeholderTextColor={Colors.textTertiary}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Info</Text>

          <Text style={styles.label}>Email</Text>
          <View style={styles.verifyRow}>
            <TextInput
              style={[styles.input, styles.verifyInput]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {email.trim() && (
              <View style={styles.verifyBadge}>
                {emailVerified ? (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : (
                  <Pressable onPress={handleSendEmailCode} style={styles.verifyBtn} disabled={verifying}>
                    <Text style={styles.verifyBtnText}>{showEmailVerify ? 'Resend' : 'Verify'}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {showEmailVerify && !emailVerified && (
            <View style={styles.codeRow}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={emailCode}
                onChangeText={(t) => setEmailCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter code"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Pressable onPress={handleVerifyEmail} style={styles.confirmCodeBtn} disabled={verifying}>
                {verifying ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
              </Pressable>
            </View>
          )}

          <Text style={[styles.label, { marginTop: 20 }]}>Phone Number</Text>
          <View style={styles.verifyRow}>
            <TextInput
              style={[styles.input, styles.verifyInput]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+1 (555) 123-4567"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
            />
            {phone.trim() && (
              <View style={styles.verifyBadge}>
                {phoneVerified ? (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                ) : (
                  <Pressable onPress={handleSendPhoneCode} style={styles.verifyBtn} disabled={verifying}>
                    <Text style={styles.verifyBtnText}>{showPhoneVerify ? 'Resend' : 'Verify'}</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>

          {showPhoneVerify && !phoneVerified && (
            <View style={styles.codeRow}>
              <TextInput
                style={[styles.input, styles.codeInput]}
                value={phoneCode}
                onChangeText={(t) => setPhoneCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter code"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Pressable onPress={handleVerifyPhone} style={styles.confirmCodeBtn} disabled={verifying}>
                {verifying ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark" size={20} color="#fff" />}
              </Pressable>
            </View>
          )}
        </View>

        {verifying && (
          <View style={styles.verifyingOverlay}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.verifyingText}>Verifying...</Text>
          </View>
        )}
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', paddingVertical: 24 },
  avatarCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  avatarLetter: { fontSize: 30, fontFamily: 'Nunito_800ExtraBold', color: Colors.primary },
  usernameLabel: { fontSize: 14, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 17, fontFamily: 'Nunito_700Bold', color: Colors.text, marginBottom: 12 },
  label: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  bioInput: { minHeight: 80 },
  verifyRow: { position: 'relative' },
  verifyInput: { paddingRight: 90 },
  verifyBadge: { position: 'absolute', right: 10, top: 10 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success + '12', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  verifiedText: { fontSize: 12, fontFamily: 'Nunito_600SemiBold', color: Colors.success },
  verifyBtn: { backgroundColor: Colors.primary + '12', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  verifyBtnText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: Colors.primary },
  codeRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  codeInput: { flex: 1, fontSize: 18, fontFamily: 'Nunito_700Bold', textAlign: 'center', letterSpacing: 4 },
  confirmCodeBtn: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  verifyingOverlay: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12 },
  verifyingText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
});
