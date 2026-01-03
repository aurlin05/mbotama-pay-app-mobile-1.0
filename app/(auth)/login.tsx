import React, { useState } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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

  const handleLogin = async () => {
    if (!phone || phone.length < 8) {
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
      router.push('/(auth)/verify-otp');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Background decoration */}
      <View style={styles.bgDecoration}>
        <View style={[styles.bgCircle1, { backgroundColor: theme.primary + '10' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.primary + '08' }]} />
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
          <View style={styles.header}>
            <LinearGradient
              colors={['#3366FF', '#1E40AF']}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.foreground }]}>Connexion</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Connectez-vous avec votre numéro de téléphone
            </Text>
          </View>

          {/* Form Card */}
          <Card style={styles.formCard}>
            <Text style={[styles.label, { color: theme.foreground }]}>Numéro de téléphone</Text>
            
            <TouchableOpacity
              style={[styles.countrySelector, { borderColor: theme.border, backgroundColor: theme.surface }]}
              onPress={() => setShowCountryPicker(!showCountryPicker)}
            >
              <Text style={styles.flag}>{selectedCountry.flag}</Text>
              <Text style={[styles.countryCode, { color: theme.foreground }]}>{selectedCountry.code}</Text>
              <Ionicons name="chevron-down" size={20} color={theme.mutedForeground} />
            </TouchableOpacity>

            {showCountryPicker && (
              <View style={[styles.countryList, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                {COUNTRY_CODES.map((country) => (
                  <TouchableOpacity
                    key={country.code}
                    style={[styles.countryItem, { borderBottomColor: theme.border }]}
                    onPress={() => {
                      setSelectedCountry(country);
                      setShowCountryPicker(false);
                    }}
                  >
                    <Text style={styles.flag}>{country.flag}</Text>
                    <Text style={[styles.countryName, { color: theme.foreground }]}>{country.name}</Text>
                    <Text style={[styles.countryCodeSmall, { color: theme.mutedForeground }]}>{country.code}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Ionicons name="call-outline" size={20} color={theme.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.foreground }]}
                placeholder="7X XXX XX XX"
                placeholderTextColor={theme.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <Text style={[styles.hint, { color: theme.mutedForeground }]}>
              Un code de vérification sera envoyé à ce numéro
            </Text>

            <Button
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
              icon={<Ionicons name="phone-portrait-outline" size={20} color="#FFFFFF" />}
            >
              Recevoir le code OTP
            </Button>

            <Text style={[styles.privacyText, { color: theme.mutedForeground }]}>
              Nous ne partagerons jamais votre numéro.
            </Text>
          </Card>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={[styles.registerText, { color: theme.mutedForeground }]}>
              Pas encore de compte ?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[styles.registerLink, { color: theme.primary }]}>Créer un compte</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
              Service rapide et sécurisé
            </Text>
            <Text style={[styles.footerText, { color: theme.mutedForeground }]}>
              © 2025 MBOTAMAPAY. Tous droits réservés.
            </Text>
          </View>
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  formCard: {
    padding: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 8,
  },
  flag: {
    fontSize: 24,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  countryList: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  countryName: {
    flex: 1,
    fontSize: 15,
  },
  countryCodeSmall: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  hint: {
    fontSize: 12,
    marginBottom: 20,
  },
  button: {
    marginBottom: 12,
  },
  privacyText: {
    fontSize: 12,
    textAlign: 'center',
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
    fontWeight: '600',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    marginTop: 4,
  },
});
