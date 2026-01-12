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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { userService } from '../../src/services/user';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';

const { height } = Dimensions.get('window');

export default function CompleteProfileScreen() {
  const { theme } = useTheme();
  const { user, fetchUserData, clearPendingAuth } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    ]).start();

    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: 0.5,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const isFormValid = firstName.trim().length >= 2 && lastName.trim().length >= 2;

  const handleSubmit = async () => {
    if (!isFormValid) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', 'Veuillez remplir votre prénom et nom (min. 2 caractères)');
      return;
    }

    setLoading(true);
    try {
      await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim() || undefined,
      });

      await fetchUserData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      
      // Navigate to KYC screen
      router.replace('/(auth)/kyc-level1');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    placeholder: string,
    icon: string,
    fieldKey: string,
    options?: {
      keyboardType?: 'default' | 'email-address';
      autoCapitalize?: 'none' | 'words';
      required?: boolean;
    }
  ) => {
    const isFocused = focusedField === fieldKey;
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.foreground }]}>
          {label}
          {options?.required && <Text style={{ color: theme.destructive }}> *</Text>}
        </Text>
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: isFocused ? theme.primary : theme.border,
              backgroundColor: theme.surface,
            },
            isFocused && styles.inputFocused,
          ]}
        >
          <View style={[styles.inputIcon, { backgroundColor: theme.primaryLighter }]}>
            <Ionicons name={icon as any} size={18} color={theme.primary} />
          </View>
          <TextInput
            style={[styles.input, { color: theme.foreground }]}
            placeholder={placeholder}
            placeholderTextColor={theme.mutedForeground}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocusedField(fieldKey)}
            onBlur={() => setFocusedField(null)}
            keyboardType={options?.keyboardType || 'default'}
            autoCapitalize={options?.autoCapitalize || 'words'}
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={theme.mutedForeground} />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background */}
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
          {/* Progress Indicator */}
          <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
            <View style={styles.progressSteps}>
              <View style={[styles.stepDot, styles.stepCompleted, { backgroundColor: theme.success }]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, { backgroundColor: theme.success }]} />
              <View style={[styles.stepDot, styles.stepActive, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={[styles.stepLine, { backgroundColor: theme.border }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.border }]}>
                <Text style={[styles.stepNumber, { color: theme.mutedForeground }]}>3</Text>
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.success }]}>Téléphone</Text>
              <Text style={[styles.progressLabel, { color: theme.primary }]}>Profil</Text>
              <Text style={[styles.progressLabel, { color: theme.mutedForeground }]}>KYC</Text>
            </View>
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
              colors={['#3366FF', '#5C85FF', '#1E40AF']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="person" size={36} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.foreground }]}>Complétez votre profil</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Ces informations sont nécessaires pour sécuriser votre compte
            </Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Card style={styles.formCard} variant="elevated">
              {renderInput(
                'Prénom',
                firstName,
                setFirstName,
                'Entrez votre prénom',
                'person-outline',
                'firstName',
                { required: true }
              )}

              {renderInput(
                'Nom',
                lastName,
                setLastName,
                'Entrez votre nom',
                'person-outline',
                'lastName',
                { required: true }
              )}

              {renderInput(
                'Email',
                email,
                setEmail,
                'exemple@email.com (optionnel)',
                'mail-outline',
                'email',
                { keyboardType: 'email-address', autoCapitalize: 'none' }
              )}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={theme.primary} />
                <Text style={[styles.infoText, { color: theme.mutedForeground }]}>
                  L'email permet de recevoir les confirmations de transaction et de récupérer votre compte.
                </Text>
              </View>

              <Button
                variant="gradient"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !isFormValid}
                style={styles.button}
                icon={<Ionicons name="arrow-forward" size={20} color="#FFFFFF" />}
                iconPosition="right"
              >
                Continuer
              </Button>
            </Card>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <View style={[styles.securityBadge, { backgroundColor: theme.successLight }]}>
              <Ionicons name="shield-checkmark" size={14} color={theme.success} />
              <Text style={[styles.securityText, { color: theme.success }]}>
                Données sécurisées et chiffrées
              </Text>
            </View>
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
  progressContainer: {
    marginBottom: 24,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCompleted: {},
  stepActive: {},
  stepLine: {
    width: 50,
    height: 3,
    borderRadius: 2,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formCard: {
    padding: 24,
    borderRadius: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
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
  inputIcon: {
    width: 44,
    height: 44,
    margin: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
    paddingRight: 16,
  },
  clearButton: {
    paddingHorizontal: 14,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    backgroundColor: 'rgba(51, 102, 255, 0.08)',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    height: 56,
    borderRadius: 16,
  },
  footer: {
    marginTop: 24,
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
});
