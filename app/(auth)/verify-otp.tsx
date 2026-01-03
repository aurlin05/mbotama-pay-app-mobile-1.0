import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { OTP_LENGTH, OTP_RESEND_DELAY } from '../../src/constants/config';

export default function VerifyOtpScreen() {
  const { theme, tokens } = useTheme();
  const { pendingPhone, pendingCountryCode, clearPendingAuth, fetchUserData } = useAuthStore();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(OTP_RESEND_DELAY);
  const inputRef = useRef<TextInput>(null);
  
  // Animation
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!pendingPhone) {
      router.replace('/(auth)/login');
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [pendingPhone]);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleVerify = async () => {
    if (otp.length !== OTP_LENGTH) {
      Alert.alert('Erreur', `Veuillez entrer le code à ${OTP_LENGTH} chiffres`);
      shake();
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp({
        phoneNumber: pendingPhone!,
        code: otp,
      });
      await fetchUserData();
      clearPendingAuth();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Code invalide');
      setOtp('');
      shake();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      const localPhone = pendingPhone!.replace(pendingCountryCode!, '');
      await authService.resendOtp({
        phoneNumber: localPhone,
        countryCode: pendingCountryCode!,
      });
      setResendTimer(OTP_RESEND_DELAY);
      Alert.alert('Succès', 'Un nouveau code a été envoyé');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de renvoyer le code');
    }
  };

  const maskedPhone = pendingPhone
    ? `${pendingPhone.slice(0, 6)}****${pendingPhone.slice(-2)}`
    : '';

  const handleOtpChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH);
    setOtp(cleaned);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle1, { backgroundColor: theme.primary + '10' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.primary + '08' }]} />
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.surface }]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.foreground} />
          </TouchableOpacity>
        </View>

        {/* Icon */}
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['#3366FF', '#1E40AF']}
            style={styles.iconGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="mail-open" size={36} color="#FFFFFF" />
          </LinearGradient>
        </View>

        <Text style={[styles.title, { color: theme.foreground }]}>Vérification</Text>
        <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
          Entrez le code envoyé au {maskedPhone}
        </Text>

        {/* OTP Input */}
        <Card style={styles.otpCard}>
          <Animated.View style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.otpBoxes}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    {
                      borderColor: otp[index] ? theme.primary : theme.border,
                      backgroundColor: otp[index] ? theme.secondary : theme.surface,
                    },
                  ]}
                >
                  <Text style={[styles.otpText, { color: theme.foreground }]}>
                    {otp[index] || ''}
                  </Text>
                </View>
              ))}
            </View>
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={otp}
              onChangeText={handleOtpChange}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH}
              autoFocus
            />
            <TouchableOpacity
              style={styles.otpTouchable}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            />
          </Animated.View>

          <Button
            onPress={handleVerify}
            loading={loading}
            disabled={loading || otp.length !== OTP_LENGTH}
            style={styles.button}
            icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
          >
            Vérifier
          </Button>
        </Card>

        {/* Resend */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
          <Text
            style={[
              styles.resendText,
              { color: resendTimer > 0 ? theme.mutedForeground : theme.primary },
            ]}
          >
            {resendTimer > 0
              ? `Renvoyer le code dans ${resendTimer}s`
              : 'Renvoyer le code'}
          </Text>
        </TouchableOpacity>
      </View>
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
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 100,
    left: -50,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  otpCard: {
    padding: 24,
  },
  otpContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  otpBox: {
    width: 52,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpText: {
    fontSize: 24,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
  otpTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  button: {
    marginTop: 8,
  },
  resendButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
