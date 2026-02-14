import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Platform, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

type AuthMode = 'welcome' | 'email' | 'phone' | 'signup';

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const { signUp } = useApp();
  const webTopInset = Platform.OS === 'web' ? 67 : 0;

  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google' | 'apple'>('email');

  const handleSocialAuth = async (method: 'google' | 'apple') => {
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAuthMethod(method);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
    const socialName = method === 'google' ? 'Google User' : 'Apple User';
    setDisplayName(socialName);
    setUsername(socialName.toLowerCase().replace(/\s/g, '_') + '_' + Math.floor(Math.random() * 999));
    setMode('signup');
  };

  const handleEmailLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'Please enter both email and password.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAuthMethod('email');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    setMode('signup');
  };

  const handleSendOtp = async () => {
    if (phone.length < 10) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setIsLoading(false);
    setShowOtp(true);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      Alert.alert('Invalid Code', 'Please enter the verification code.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAuthMethod('phone');
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    setMode('signup');
  };

  const handleCreateAccount = async () => {
    if (username.trim().length < 3 || displayName.trim().length < 2) {
      Alert.alert('Missing Info', 'Username must be 3+ characters, name must be 2+ characters.');
      return;
    }
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsLoading(true);
    await signUp({
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      displayName: displayName.trim(),
      bio: bio.trim(),
      avatar: null,
      email: authMethod === 'email' ? email : '',
      phone: authMethod === 'phone' ? phone : '',
      emailVerified: authMethod === 'email',
      phoneVerified: authMethod === 'phone',
      authMethod,
    });
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Please wait...</Text>
      </View>
    );
  }

  if (mode === 'signup') {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 20 + webTopInset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => setMode('welcome')} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.formTitle}>Complete Profile</Text>
          <Text style={styles.formSubtitle}>Just a few details to get started</Text>

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., happy_sharer"
            placeholderTextColor={Colors.textTertiary}
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
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
            onPress={handleCreateAccount}
            style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.primaryBtnText}>Join TakeItFree</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (mode === 'email') {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 20 + webTopInset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => setMode('welcome')} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.formTitle}>Email Sign In</Text>
          <Text style={styles.formSubtitle}>Enter your email and password</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrap}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Your password"
              placeholderTextColor={Colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn} hitSlop={12}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
            </Pressable>
          </View>

          <Pressable
            onPress={handleEmailLogin}
            style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Ionicons name="mail" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>Continue with Email</Text>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  if (mode === 'phone') {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[styles.formContent, { paddingTop: insets.top + 20 + webTopInset }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={() => { setMode('welcome'); setShowOtp(false); setOtp(''); }} hitSlop={12}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </Pressable>
          <Text style={styles.formTitle}>Phone Sign In</Text>
          <Text style={styles.formSubtitle}>
            {showOtp ? 'Enter the verification code sent to your phone' : 'We\'ll send you a verification code'}
          </Text>

          {!showOtp ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 123-4567"
                placeholderTextColor={Colors.textTertiary}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Pressable
                onPress={handleSendOtp}
                style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}
              >
                <Ionicons name="paper-plane" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Send Code</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="0000"
                placeholderTextColor={Colors.textTertiary}
                value={otp}
                onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
              <Pressable
                onPress={handleVerifyOtp}
                style={({ pressed }) => [styles.primaryBtn, { opacity: pressed ? 0.9 : 1 }]}
              >
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Verify Code</Text>
              </Pressable>
              <Pressable onPress={() => { setShowOtp(false); setOtp(''); }} style={styles.secondaryLink}>
                <Text style={styles.secondaryLinkText}>Resend Code</Text>
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.welcomeContent, { paddingTop: insets.top + 60 + webTopInset, paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="gift" size={40} color={Colors.primary} />
          </View>
        </View>
        <Text style={styles.appTitle}>TakeItFree</Text>
        <Text style={styles.appTagline}>Share generously, connect locally</Text>

        <View style={styles.authOptions}>
          <Pressable
            onPress={() => handleSocialAuth('google')}
            style={({ pressed }) => [styles.socialBtn, styles.googleBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <MaterialCommunityIcons name="google" size={20} color="#DB4437" />
            <Text style={styles.socialBtnText}>Continue with Google</Text>
          </Pressable>

          <Pressable
            onPress={() => handleSocialAuth('apple')}
            style={({ pressed }) => [styles.socialBtn, styles.appleBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Ionicons name="logo-apple" size={20} color="#000" />
            <Text style={[styles.socialBtnText, { color: '#000' }]}>Continue with Apple</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            onPress={() => setMode('email')}
            style={({ pressed }) => [styles.methodBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.methodBtnText}>Sign in with Email</Text>
          </Pressable>

          <Pressable
            onPress={() => setMode('phone')}
            style={({ pressed }) => [styles.methodBtn, { opacity: pressed ? 0.9 : 1 }]}
          >
            <Ionicons name="call-outline" size={20} color={Colors.secondary} />
            <Text style={[styles.methodBtnText, { color: Colors.secondary }]}>Sign in with Phone</Text>
          </Pressable>
        </View>

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  loadingContainer: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 15, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginTop: 16 },
  welcomeContent: { alignItems: 'center', paddingHorizontal: 28 },
  logoWrap: { marginBottom: 20 },
  logoCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: Colors.primary + '12', alignItems: 'center', justifyContent: 'center',
  },
  appTitle: { fontSize: 32, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, marginBottom: 6 },
  appTagline: { fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 48 },
  authOptions: { width: '100%', gap: 12 },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 15, borderRadius: 14, borderWidth: 1.5,
  },
  googleBtn: { backgroundColor: '#fff', borderColor: '#E0E0E0' },
  appleBtn: { backgroundColor: '#fff', borderColor: '#E0E0E0' },
  socialBtnText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#333' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 13, fontFamily: 'Nunito_400Regular', color: Colors.textTertiary },
  methodBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 15, borderRadius: 14, backgroundColor: Colors.surface,
    borderWidth: 1.5, borderColor: Colors.border,
  },
  methodBtnText: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: Colors.primary },
  termsText: {
    fontSize: 12, fontFamily: 'Nunito_400Regular', color: Colors.textTertiary,
    textAlign: 'center', marginTop: 32, lineHeight: 18, paddingHorizontal: 20,
  },
  formContent: { paddingHorizontal: 24, paddingBottom: 40 },
  formTitle: { fontSize: 28, fontFamily: 'Nunito_800ExtraBold', color: Colors.text, marginTop: 20, marginBottom: 4 },
  formSubtitle: { fontSize: 15, fontFamily: 'Nunito_400Regular', color: Colors.textSecondary, marginBottom: 24 },
  label: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: Colors.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: Colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14,
    fontSize: 16, fontFamily: 'Nunito_400Regular', color: Colors.text, borderWidth: 1, borderColor: Colors.border,
  },
  bioInput: { minHeight: 80 },
  otpInput: { fontSize: 24, fontFamily: 'Nunito_700Bold', textAlign: 'center', letterSpacing: 8 },
  passwordWrap: { flexDirection: 'row', alignItems: 'center', gap: 0, position: 'relative' },
  eyeBtn: { position: 'absolute', right: 14 },
  primaryBtn: {
    backgroundColor: Colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 16, borderRadius: 14, marginTop: 28,
  },
  primaryBtnText: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#fff' },
  secondaryLink: { alignItems: 'center', marginTop: 16 },
  secondaryLinkText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: Colors.primary },
});
