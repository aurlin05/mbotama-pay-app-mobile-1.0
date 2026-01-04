import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { authService } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { OtpInput } from '../../src/components/ui/OtpInput';
import { Card } from '../../src/components/ui/Card';
import { LoadingSpinner } from '../../src/components/ui/AnimatedFeedback';
import { OTP_LENGTH } from '../../src/constants/config';

const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen() {
  const { theme, tokens } = useTheme();
  const { pendingPhone, pendingCountryCode, fetchUserData, clearPendingAuth } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (!pendingPhone) {
      router.replace('/(auth)/login');
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [pendingPhone]);

  // Countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Auto-submit when OTP is complete
  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleVerify();
    }
  }, [otp]);

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      setError(true);
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const response = await authService.verifyOtp({
        phoneNumber: pendingPhone!,
        code: otp,
      });

      if (response.success && response.data) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        await fetchUserData();
        clearPendingAuth();
        router.replace('/(tabs)');
      } else {
        throw new Error(response.message || 'Code invalide');
      }
    } catch (error: any) {
      setError(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', error.response?.data?.message || 'Code invalide');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await authService.login({
        phoneNumber: pendingPhone!.replace(pendingCountryCode || '', ''),
        countryCode: pendingCountryCode || '+221',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      Alert.alert('Succès', 'Un nouveau code a été envoyé');
      setResendCooldown(RESEND_COOLDOWN);
      setCanResend(false);
      setOtp('');
      setError(false);
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de renvoyer le code');
    }
  };

  const formatPhone = (phone: string) => {
    // Mask middle digits for privacy
    if (phone.length > 6) {
      return phone.slice(0, 4) + ' ••• ' + phone.slice(-3);
    }
    return phone;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={['#3366FF10', 'transparent']}
          style={styles.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.bgCircle1, { backgroundColor: theme.primary + '08' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.accentPurple + '06' }]} />
      </View>

      {/* Back Button */}
      <Animated.View style={[styles.backButton, { opacity: fadeAnim }]}>
        <Pressable
          onPress={() => {
            clearPendingAuth();
            router.back();
          }}
          style={[styles.backButtonInner, { backgroundColor: theme.surface }]}
        >
          <Ionicons name="arrow-back" size={22} color={theme.foreground} />
        </Pressable>
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Icon */}
          <Animated.View
            style={[
              styles.iconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: iconScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['#3366FF', '#1E40AF']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chatbubble-ellipses" size={40} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.title, { color: theme.foreground }]}>Vérification</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Entrez le code envoyé au
            </Text>
            <View style={styles.phoneContainer}>
              <Ionicons name="phone-portrait" size={16} color={theme.primary} />
              <Text style={[styles.phone, { color: theme.primary }]}>
                {formatPhone(pendingPhone || '')}
              </Text>
            </View>
          </Animated.View>

          {/* OTP Input */}
          <Animated.View
            style={[
              styles.otpContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <OtpInput
              value={otp}
              onChange={setOtp}
              length={OTP_LENGTH}
              error={error}
              autoFocus
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={16} color={theme.destructive} />
                <Text style={[styles.errorText, { color: theme.destructive }]}>
                  Code incorrect. Veuillez réessayer.
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Resend */}
          <Animated.View
            style={[
              styles.resendContainer,
              { opacity: fadeAnim },
            ]}
          >
            {canResend ? (
              <Pressable onPress={handleResend} style={styles.resendButton}>
                <Ionicons name="refresh" size={18} color={theme.primary} />
                <Text style={[styles.resendText, { color: theme.primary }]}>
                  Renvoyer le code
                </Text>
              </Pressable>
            ) : (
              <View style={styles.cooldownContainer}>
                <Text style={[styles.cooldownText, { color: theme.mutedForeground }]}>
                  Renvoyer dans{' '}
                </Text>
                <View style={[styles.cooldownBadge, { backgroundColor: theme.primaryLighter }]}>
                  <Text style={[styles.cooldownTime, { color: theme.primary }]}>
                    {resendCooldown}s
                  </Text>
                </View>
              </View>
            )}
          </Animated.View>

          {/* Verify Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Button
              variant="gradient"
              onPress={handleVerify}
              loading={loading}
              disabled={loading || otp.length !== OTP_LENGTH}
              icon={
                loading ? undefined : (
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                )
              }
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </Button>
          </Animated.View>

          {/* Help text */}
          <Animated.View style={[styles.helpContainer, { opacity: fadeAnim }]}>
            <Ionicons name="help-circle-outline" size={16} color={theme.mutedForeground} />
            <Text style={[styles.helpText, { color: theme.mutedForeground }]}>
              Vous n'avez pas reçu le code ? Vérifiez vos SMS ou réessayez.
            </Text>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  bgCircle1: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    top: -80,
    right: -60,
  },
  bgCircle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 100,
    left: -50,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phone: {
    fontSize: 16,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resendContainer: {
    marginBottom: 32,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cooldownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cooldownText: {
    fontSize: 14,
  },
  cooldownBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cooldownTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    flex: 1,
  },
});
