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
  Dimensions,
  Modal,
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
import { Card } from '../../src/components/ui/Card';
import { COUNTRY_CODES } from '../../src/constants/config';

const { width, height } = Dimensions.get('window');

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
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(80)).current;
  const inputScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(logoRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(formSlide, {
          toValue: 0,
          friction: 8,
          tension: 35,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const shakeInput = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleFocus = () => {
    setInputFocused(true);
    Animated.spring(inputScale, {
      toValue: 1.02,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setInputFocused(false);
    Animated.spring(inputScale, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!phone || phone.length < 8) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      shakeInput();
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (min. 8 chiffres)');
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
      shakeInput();
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const spin = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderCountryModal = () => (
    <Modal
      visible={showCountryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCountryPicker(false)}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={() => setShowCountryPicker(false)}
      >
        <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHandle, { backgroundColor: theme.border }]} />
          <Text style={[styles.modalTitle, { color: theme.foreground }]}>
            Sélectionner un pays
          </Text>
          <ScrollView showsVerticalScrollIndicator={false}>
            {COUNTRY_CODES.map((country, index) => (
              <Pressable
                key={country.code}
                style={[
                  styles.countryModalItem,
                  {
                    backgroundColor: selectedCountry.code === country.code 
                      ? theme.primaryLighter 
                      : 'transparent',
                    borderBottomColor: theme.border + '30',
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setSelectedCountry(country);
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <View style={styles.countryInfo}>
                  <Text style={[styles.countryModalName, { color: theme.foreground }]}>
                    {country.name}
                  </Text>
                  <Text style={[styles.countryModalCode, { color: theme.mutedForeground }]}>
                    {country.code}
                  </Text>
                </View>
                {selectedCountry.code === country.code && (
                  <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Animated Background */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={['#3366FF20', '#8B5CF610', 'transparent']}
          style={styles.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Animated.View 
          style={[
            styles.bgCircle1, 
            { 
              backgroundColor: theme.primary + '12',
              transform: [{ scale: logoScale }],
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.bgCircle2, 
            { 
              backgroundColor: theme.accentPurple + '10',
              transform: [{ scale: logoScale }],
            }
          ]} 
        />
        <View style={[styles.bgCircle3, { backgroundColor: theme.primary + '08' }]} />
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
                transform: [
                  { translateY: slideAnim },
                  { scale: logoScale },
                ],
              },
            ]}
          >
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <LinearGradient
                colors={['#3366FF', '#5C85FF', '#1E40AF']}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="shield-checkmark" size={48} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>
            <Text style={[styles.brandName, { color: theme.foreground }]}>MBOTAMAPAY</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Transferts d'argent rapides et sécurisés
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: formSlide }],
            }}
          >
            <Card style={styles.formCard} variant="elevated">
              <View style={styles.formHeader}>
                <Text style={[styles.formTitle, { color: theme.foreground }]}>Connexion</Text>
                <View style={[styles.formBadge, { backgroundColor: theme.primaryLighter }]}>
                  <Ionicons name="flash" size={12} color={theme.primary} />
                  <Text style={[styles.formBadgeText, { color: theme.primary }]}>Rapide</Text>
                </View>
              </View>
              <Text style={[styles.formSubtitle, { color: theme.mutedForeground }]}>
                Entrez votre numéro pour recevoir un code OTP
              </Text>

              {/* Country Selector */}
              <Text style={[styles.label, { color: theme.foreground }]}>Pays</Text>
              <Pressable
                style={[
                  styles.countrySelector,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.surface,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setShowCountryPicker(true);
                }}
              >
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={[styles.countryName, { color: theme.foreground }]}>
                  {selectedCountry.name}
                </Text>
                <Text style={[styles.countryCode, { color: theme.mutedForeground }]}>
                  {selectedCountry.code}
                </Text>
                <View style={[styles.chevronCircle, { backgroundColor: theme.primaryLighter }]}>
                  <Ionicons name="chevron-down" size={16} color={theme.primary} />
                </View>
              </Pressable>

              {/* Phone Input */}
              <Text style={[styles.label, { color: theme.foreground, marginTop: 20 }]}>
                Numéro de téléphone
              </Text>
              <Animated.View
                style={[
                  styles.inputWrapper,
                  {
                    transform: [
                      { translateX: shakeAnim },
                      { scale: inputScale },
                    ],
                  },
                ]}
              >
                <View
                  style={[
                    styles.inputContainer,
                    {
                      borderColor: inputFocused ? theme.primary : theme.border,
                      backgroundColor: theme.surface,
                    },
                    inputFocused && styles.inputFocused,
                  ]}
                >
                  <LinearGradient
                    colors={inputFocused ? ['#3366FF15', '#3366FF05'] : ['transparent', 'transparent']}
                    style={styles.prefixGradient}
                  >
                    <View style={[styles.prefixContainer, { borderRightColor: theme.border }]}>
                      <Text style={styles.prefixFlag}>{selectedCountry.flag}</Text>
                      <Text style={[styles.prefix, { color: theme.foreground }]}>
                        {selectedCountry.code}
                      </Text>
                    </View>
                  </LinearGradient>
                  <TextInput
                    style={[styles.input, { color: theme.foreground }]}
                    placeholder="7X XXX XX XX"
                    placeholderTextColor={theme.mutedForeground}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    maxLength={12}
                  />
                  {phone.length > 0 && (
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                        setPhone('');
                      }}
                      style={styles.clearButton}
                    >
                      <View style={[styles.clearCircle, { backgroundColor: theme.mutedForeground + '20' }]}>
                        <Ionicons name="close" size={14} color={theme.mutedForeground} />
                      </View>
                    </Pressable>
                  )}
                </View>
              </Animated.View>

              <View style={styles.hintContainer}>
                <View style={[styles.hintIcon, { backgroundColor: theme.primaryLighter }]}>
                  <Ionicons name="information" size={12} color={theme.primary} />
                </View>
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
                icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
                iconPosition="right"
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
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.push('/(auth)/register');
              }}
              style={({ pressed }) => [
                styles.registerLinkContainer,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.registerLink, { color: theme.primary }]}>Créer un compte</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.primary} />
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={[styles.securityBadge, { backgroundColor: theme.successLight }]}>
              <Ionicons name="lock-closed" size={14} color={theme.success} />
              <Text style={[styles.securityText, { color: theme.success }]}>
                Connexion sécurisée SSL
              </Text>
            </View>
            <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
              © 2026 MBOTAMAPAY. Tous droits réservés.
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {renderCountryModal()}
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
    height: height * 0.5,
  },
  bgCircle1: {
    position: 'absolute',
    width: 350,
    height: 350,
    borderRadius: 175,
    top: -120,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    bottom: 100,
    left: -80,
  },
  bgCircle3: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: height * 0.35,
    right: -60,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 16,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  formBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  formBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  flag: {
    fontSize: 24,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '500',
  },
  chevronCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
  },
  inputFocused: {
    borderWidth: 2,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  prefixGradient: {
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 1,
    gap: 8,
  },
  prefixFlag: {
    fontSize: 20,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontWeight: '500',
  },
  clearButton: {
    paddingHorizontal: 14,
  },
  clearCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  hintIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontSize: 13,
    flex: 1,
  },
  button: {
    marginTop: 4,
    height: 56,
    borderRadius: 16,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  registerText: {
    fontSize: 15,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  registerLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 36,
    alignItems: 'center',
    gap: 12,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 11,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: height * 0.6,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  countryModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    gap: 14,
  },
  countryFlag: {
    fontSize: 28,
  },
  countryInfo: {
    flex: 1,
  },
  countryModalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  countryModalCode: {
    fontSize: 13,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
