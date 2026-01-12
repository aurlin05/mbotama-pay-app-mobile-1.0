import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  Dimensions,
  Modal,
  StatusBar,
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

const { height } = Dimensions.get('window');

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { setPendingAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [loading, setLoading] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const inputScale = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(formSlide, {
        toValue: 0,
        friction: 8,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.spring(checkScale, {
      toValue: acceptedTerms ? 1 : 0,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [acceptedTerms]);

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

  const handleRegister = async () => {
    if (!phone || phone.length < 8) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      shakeInput();
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide (min. 8 chiffres)');
      return;
    }

    if (!acceptedTerms) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      Alert.alert('Conditions requises', 'Veuillez accepter les conditions d\'utilisation pour continuer');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        phoneNumber: phone,
        countryCode: selectedCountry.code,
      };
      
      await authService.register(requestData);
      
      const fullPhone = `${selectedCountry.code}${phone}`;
      setPendingAuth(fullPhone, selectedCountry.code, true); // true = nouvelle inscription
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
            {COUNTRY_CODES.map((country) => (
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
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      {/* Animated Background */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={['#8B5CF620', '#3366FF10', 'transparent']}
          style={styles.bgGradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <View style={[styles.bgCircle1, { backgroundColor: theme.accentPurple + '12' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.primary + '10' }]} />
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
          {/* Back Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Pressable
              style={[styles.backButton, { backgroundColor: theme.surface }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={22} color={theme.foreground} />
            </Pressable>
          </Animated.View>

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#8B5CF6', '#3366FF', '#1E40AF']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person-add" size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.foreground }]}>Créer un compte</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Rejoignez MBOTAMAPAY et commencez à envoyer de l'argent en toute sécurité
            </Text>
          </Animated.View>

          {/* Features */}
          <Animated.View
            style={[
              styles.featuresContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* <View style={styles.featureRow}>
              <View style={[styles.featureItem, { backgroundColor: theme.surface }]}>
                <View style={[styles.featureIcon, { backgroundColor: theme.primaryLighter }]}>
                  <Ionicons name="flash" size={16} color={theme.primary} />
                </View>
                <Text style={[styles.featureText, { color: theme.foreground }]}>Rapide</Text>
              </View>
              <View style={[styles.featureItem, { backgroundColor: theme.surface }]}>
                <View style={[styles.featureIcon, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="shield-checkmark" size={16} color={theme.success} />
                </View>
                <Text style={[styles.featureText, { color: theme.foreground }]}>Sécurisé</Text>
              </View>
              <View style={[styles.featureItem, { backgroundColor: theme.surface }]}>
                <View style={[styles.featureIcon, { backgroundColor: theme.warningLight }]}>
                  <Ionicons name="wallet" size={16} color={theme.warning} />
                </View>
                <Text style={[styles.featureText, { color: theme.foreground }]}>Gratuit</Text>
              </View>
            </View> */}
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: formSlide }],
            }}
          >
            <Card style={styles.formCard} variant="elevated">
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

              {/* Terms Checkbox */}
              <Pressable
                style={styles.termsContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                  setAcceptedTerms(!acceptedTerms);
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: acceptedTerms ? theme.primary : theme.border,
                      backgroundColor: acceptedTerms ? theme.primary : 'transparent',
                    },
                  ]}
                >
                  <Animated.View style={{ transform: [{ scale: checkScale }] }}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </Animated.View>
                </View>
                <Text style={[styles.termsText, { color: theme.mutedForeground }]}>
                  J'accepte les{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]}>
                    Conditions d'utilisation
                  </Text>
                  {' '}et la{' '}
                  <Text style={[styles.termsLink, { color: theme.primary }]}>
                    Politique de confidentialité
                  </Text>
                </Text>
              </Pressable>

              <Button
                variant="gradient"
                onPress={handleRegister}
                loading={loading}
                disabled={loading || phone.length < 8 || !acceptedTerms}
                style={styles.button}
                icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
                iconPosition="right"
              >
                Créer mon compte
              </Button>
            </Card>
          </Animated.View>

          {/* Login Link */}
          <Animated.View
            style={[
              styles.loginContainer,
              { opacity: fadeAnim },
            ]}
          >
            <Text style={[styles.loginText, { color: theme.mutedForeground }]}>
              Déjà un compte ?{' '}
            </Text>
            <Pressable 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                router.push('/(auth)/login');
              }}
              style={({ pressed }) => [
                styles.loginLinkContainer,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={[styles.loginLink, { color: theme.primary }]}>Se connecter</Text>
              <Ionicons name="arrow-forward" size={14} color={theme.primary} />
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={[styles.securityBadge, { backgroundColor: theme.successLight }]}>
              <Ionicons name="lock-closed" size={14} color={theme.success} />
              <Text style={[styles.securityText, { color: theme.success }]}>
                Données protégées
              </Text>
            </View>
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
    width: 300,
    height: 300,
    borderRadius: 150,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    bottom: 150,
    left: -70,
  },
  bgCircle3: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: height * 0.4,
    right: -50,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 8,
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoGradient: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
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
    marginBottom: 20,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  termsLink: {
    fontWeight: '600',
  },
  button: {
    height: 56,
    borderRadius: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 15,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    marginBottom: 16,
    alignItems: 'center',
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
