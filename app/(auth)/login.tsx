import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { authService } from '../../src/services/auth';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { COUNTRY_CODES } from '../../src/constants/config';

export default function LoginScreen() {
  const { theme, tokens } = useTheme();
  const { setPendingAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!phone || phone.length < 8) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        phoneNumber: phone,
        countryCode: selectedCountry.code,
      };
      
      await authService.login(requestData);
      
      const fullPhone = `${selectedCountry.code}${phone}`;
      setPendingAuth(fullPhone, selectedCountry.code);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.push('/(auth)/verify-otp');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={['#3366FF15', 'transparent']}
          style={styles.bgGradient1}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.bgCircle1, { backgroundColor: theme.primary + '08' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.primary + '05' }]} />
        <View style={[styles.bgCircle3, { backgroundColor: theme.accentPurple + '08' }]} />
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
          {/* Logo Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <LinearGradient
              colors={['#3366FF', '#1E40AF', '#2563EB']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={44} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.brandName, { color: theme.foreground }]}>MBOTAMAPAY</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Transferts d'argent rapides et sécurisés
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Card style={styles.formCard} variant="elevated">
              <Text style={[styles.formTitle, { color: theme.foreground }]}>Connexion</Text>
              <Text style={[styles.formSubtitle, { color: theme.mutedForeground }]}>
                Entrez votre numéro pour recevoir un code OTP
              </Text>

              {/* Country Selector */}
              <Text style={[styles.label, { color: theme.foreground }]}>Pays</Text>
              <Pressable
                style={[
                  styles.countrySelector,
                  {
                    borderColor: showCountryPicker ? theme.primary : theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowCountryPicker(!showCountryPicker);
                }}
              >
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={[styles.countryName, { color: theme.foreground }]}>
                  {selectedCountry.name}
                </Text>
                <Text style={[styles.countryCode, { color: theme.mutedForeground }]}>
                  {selectedCountry.code}
                </Text>
                <Ionicons
                  name={showCountryPicker ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.mutedForeground}
                />
              </Pressable>

              {showCountryPicker && (
                <Animated.View
                  style={[
                    styles.countryList,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                      ...tokens.shadows.lg,
                    },
                  ]}
                >
                  {COUNTRY_CODES.map((country, index) => (
                    <Pressable
                      key={country.code}
                      style={[
                        styles.countryItem,
                        index < COUNTRY_CODES.length - 1 && {
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border + '50',
                        },
                        selectedCountry.code === country.code && {
                          backgroundColor: theme.primaryLighter,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setSelectedCountry(country);
                        setShowCountryPicker(false);
                      }}
                    >
                      <Text style={styles.flag}>{country.flag}</Text>
                      <Text style={[styles.countryItemName, { color: theme.foreground }]}>
                        {country.name}
                      </Text>
                      <Text style={[styles.countryItemCode, { color: theme.mutedForeground }]}>
                        {country.code}
                      </Text>
                      {selectedCountry.code === country.code && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                      )}
                    </Pressable>
                  ))}
                </Animated.View>
              )}

              {/* Phone Input */}
              <Text style={[styles.label, { color: theme.foreground, marginTop: 16 }]}>
                Numéro de téléphone
              </Text>
              <View
                style={[
                  styles.inputContainer,
                  {
                    borderColor: inputFocused ? theme.primary : theme.border,
                    backgroundColor: theme.surface,
                  },
                  inputFocused && { borderWidth: 2 },
                ]}
              >
                <View style={[styles.prefixContainer, { borderRightColor: theme.border }]}>
                  <Text style={styles.flag}>{selectedCountry.flag}</Text>
                  <Text style={[styles.prefix, { color: theme.foreground }]}>
                    {selectedCountry.code}
                  </Text>
                </View>
                <TextInput
                  style={[styles.input, { color: theme.foreground }]}
                  placeholder="7X XXX XX XX"
                  placeholderTextColor={theme.mutedForeground}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                />
                {phone.length > 0 && (
                  <Pressable
                    onPress={() => setPhone('')}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.mutedForeground} />
                  </Pressable>
                )}
              </View>

              <View style={styles.hintContainer}>
                <Ionicons name="information-circle-outline" size={14} color={theme.mutedForeground} />
                <Text style={[styles.hint, { color: theme.mutedForeground }]}>
                  Un code de vérification sera envoyé par SMS
                </Text>
              </View>

              <Button
                variant="gradient"
                onPress={handleLogin}
                loading={loading}
                disabled={loading || phone.length < 8}
                style={styles.button}
                icon={<Ionicons name="phone-portrait-outline" size={20} color="#FFFFFF" />}
              >
                Recevoir le code OTP
              </Button>
            </Card>
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            style={[
              styles.registerContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={[styles.registerText, { color: theme.mutedForeground }]}>
              Pas encore de compte ?{' '}
            </Text>
            <Pressable onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: theme.primary }]}>Créer un compte</Text>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={styles.securityBadge}>
              <Ionicons name="lock-closed" size={14} color={theme.success} />
              <Text style={[styles.securityText, { color: theme.mutedForeground }]}>
                Connexion sécurisée
              </Text>
            </View>
            <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
              © 2025 MBOTAMAPAY. Tous droits réservés.
            </Text>
          </Animated.View>
        </ScrollView>
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
  bgGradient1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 400,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 150,
    left: -60,
  },
  bgCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    top: 200,
    right: -40,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 10,
  },
  flag: {
    fontSize: 22,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
  },
  countryList: {
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  countryItemName: {
    flex: 1,
    fontSize: 15,
  },
  countryItemCode: {
    fontSize: 14,
    marginRight: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    overflow: 'hidden',
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRightWidth: 1,
    gap: 8,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  clearButton: {
    paddingHorizontal: 12,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    marginBottom: 24,
  },
  hint: {
    fontSize: 12,
  },
  button: {
    marginTop: 4,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    gap: 8,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 11,
  },
});
