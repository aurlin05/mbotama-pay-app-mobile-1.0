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
  ScrollView,
  Dimensions,
  useWindowDimensions,
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
import { OTP_LENGTH } from '../../src/constants/config';

const RESEND_COOLDOWN = 60;

export default function VerifyOtpScreen() {
  const { theme } = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const { pendingPhone, pendingCountryCode, isNewRegistration, fetchUserData, clearPendingAuth } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);

  // Responsive sizing
  const isSmallScreen = windowHeight < 700;
  const iconSize = isSmallScreen ? 72 : 88;
  const titleSize = isSmallScreen ? 24 : 28;

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.5)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!pendingPhone) {
      router.replace('/(auth)/login');
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
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
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for waiting state
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
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
        
        // Si c'est une nouvelle inscription, rediriger vers la complétion du profil
        if (isNewRegistration) {
          router.replace('/(auth)/complete-profile');
        } else {
          clearPendingAuth();
          router.replace('/(tabs)');
        }
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de renvoyer le code');
    }
  };

  const formatPhone = (phone: string) => {
    if (phone.length > 6) {
      return phone.slice(0, 4) + ' ••• ' + phone.slice(-3);
    }
    return phone;
  };

  const spin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={['#3366FF15', '#8B5CF610', 'transparent']}
          style={styles.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.bgCircle1, { backgroundColor: theme.primary + '10' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.accentPurple + '08' }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                clearPendingAuth();
                router.back();
              }}
              style={[styles.backButton, { backgroundColor: theme.surface }]}
            >
              <Ionicons name="arrow-back" size={22} color={theme.foreground} />
            </Pressable>
          </Animated.View>

          <View style={styles.content}>
            {/* Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: fadeAnim,
                  transform: [
                    { scale: iconScale },
                    { rotate: spin },
                  ],
                },
              ]}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient
                  colors={['#3366FF', '#5C85FF', '#1E40AF']}
                  style={[styles.iconGradient, { width: iconSize, height: iconSize }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="chatbubble-ellipses" size={isSmallScreen ? 32 : 40} color="#FFFFFF" />
                </LinearGradient>
              </Animated.View>
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
              <Text style={[styles.title, { color: theme.foreground, fontSize: titleSize }]}>
                Vérification
              </Text>
              <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
                Entrez le code à 6 chiffres envoyé au
              </Text>
              <View style={[styles.phoneContainer, { backgroundColor: theme.primaryLighter }]}>
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
                <View style={[styles.errorContainer, { backgroundColor: theme.destructiveLight }]}>
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
                <Pressable 
                  onPress={handleResend} 
                  style={[styles.resendButton, { backgroundColor: theme.primaryLighter }]}
                >
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
                    <Ionicons name="time-outline" size={14} color={theme.primary} />
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
                style={styles.button}
                icon={
                  loading ? undefined : (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  )
                }
                iconPosition="right"
              >
                {loading ? 'Vérification...' : 'Vérifier le code'}
              </Button>
            </Animated.View>

            {/* Help text */}
            <Animated.View style={[styles.helpContainer, { opacity: fadeAnim }]}>
              <View style={[styles.helpBadge, { backgroundColor: theme.surface }]}>
                <Ionicons name="help-circle-outline" size={18} color={theme.mutedForeground} />
                <Text style={[styles.helpText, { color: theme.mutedForeground }]}>
                  Vous n'avez pas reçu le code ? Vérifiez vos SMS ou attendez quelques instants.
                </Text>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const { height } = Dimensions.get('window');

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
    height: height * 0.5,
  },
  bgCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 80,
    left: -60,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 12,
    textAlign: 'center',
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  phone: {
    fontSize: 16,
    fontWeight: '700',
  },
  otpContainer: {
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  resendContainer: {
    marginBottom: 28,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  cooldownTime: {
    fontSize: 14,
    fontWeight: '700',
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 24,
  },
  button: {
    height: 56,
    borderRadius: 16,
  },
  helpContainer: {
    width: '100%',
  },
  helpBadge: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 16,
    borderRadius: 16,
  },
  helpText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },
});
