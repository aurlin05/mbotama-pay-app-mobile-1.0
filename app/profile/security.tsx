import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Switch,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';

// Try to import LocalAuthentication, fallback if not available
let LocalAuthentication: any = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (e) {
  // Module not available
}

// Clé de stockage pour la biométrie
const BIOMETRIC_ENABLED_KEY = '@mbotama_biometric_enabled';

// Types de biométrie
type BiometricType = 'fingerprint' | 'faceid' | 'iris' | 'none';

// Info session
interface SessionInfo {
  deviceName: string;
  deviceModel: string;
  osName: string;
  osVersion: string;
  location: string;
  lastActive: string;
}

export default function SecurityScreen() {
  const { theme } = useTheme();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [changingPin, setChangingPin] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionInfo, setSessionInfo] = useState<SessionInfo>({
    deviceName: 'Chargement...',
    deviceModel: '',
    osName: Platform.OS,
    osVersion: Platform.Version.toString(),
    location: 'Localisation...',
    lastActive: 'Maintenant',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    checkBiometricAvailability();
    loadBiometricPreference();
    loadSessionInfo();
  }, []);

  // Charger la préférence biométrique sauvegardée
  const loadBiometricPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      if (saved === 'true') {
        setBiometricEnabled(true);
      }
    } catch (error) {
      // Ignorer l'erreur, garder la valeur par défaut
    }
  };

  // Sauvegarder la préférence biométrique
  const saveBiometricPreference = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch (error) {
      // Ignorer l'erreur de sauvegarde
    }
  };

  // Charger les infos de l'appareil et la localisation
  const loadSessionInfo = async () => {
    try {
      // Infos appareil
      const deviceName = Device.deviceName || Device.modelName || 'Appareil inconnu';
      const deviceModel = Device.modelName || '';
      const osName = Device.osName || Platform.OS;
      const osVersion = Device.osVersion || Platform.Version.toString();

      // Localisation (avec permission)
      let locationStr = 'Position non disponible';
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Low,
          });
          
          // Reverse geocoding pour obtenir la ville
          const [address] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          
          if (address) {
            const city = address.city || address.subregion || address.region || '';
            const country = address.country || address.isoCountryCode || '';
            locationStr = [city, country].filter(Boolean).join(', ');
          }
        }
      } catch (locError) {
        // Localisation non disponible, on garde le message par défaut
      }

      setSessionInfo({
        deviceName,
        deviceModel,
        osName,
        osVersion,
        location: locationStr,
        lastActive: 'Actif maintenant',
      });
    } catch (error) {
      // En cas d'erreur, garder les valeurs par défaut
      setSessionInfo(prev => ({
        ...prev,
        deviceName: Device.modelName || 'Cet appareil',
        location: 'Position non disponible',
      }));
    }
  };

  const checkBiometricAvailability = async () => {
    if (!LocalAuthentication) {
      setBiometricAvailable(false);
      setBiometricType('none');
      return;
    }
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (compatible && enrolled) {
        setBiometricAvailable(true);
        
        // Détecter le type de biométrie disponible
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        
        // AuthenticationType enum: 1 = FINGERPRINT, 2 = FACIAL_RECOGNITION, 3 = IRIS
        if (supportedTypes.includes(2)) {
          // Face ID / Reconnaissance faciale disponible
          setBiometricType('faceid');
        } else if (supportedTypes.includes(1)) {
          // Empreinte digitale disponible
          setBiometricType('fingerprint');
        } else if (supportedTypes.includes(3)) {
          // Iris (rare, principalement Samsung)
          setBiometricType('iris');
        } else {
          setBiometricType('fingerprint'); // Fallback
        }
      } else {
        setBiometricAvailable(false);
        setBiometricType('none');
      }
    } catch {
      setBiometricAvailable(false);
      setBiometricType('none');
    }
  };

  // Obtenir le label et l'icône selon le type de biométrie
  const getBiometricInfo = () => {
    switch (biometricType) {
      case 'faceid':
        return {
          icon: Platform.OS === 'ios' ? 'scan-outline' : 'happy-outline',
          label: Platform.OS === 'ios' ? 'Face ID' : 'Reconnaissance faciale',
          subtitle: 'Déverrouillez avec votre visage',
          promptMessage: 'Authentification par reconnaissance faciale',
        };
      case 'fingerprint':
        return {
          icon: 'finger-print',
          label: 'Empreinte digitale',
          subtitle: 'Déverrouillez avec votre empreinte',
          promptMessage: 'Authentification par empreinte digitale',
        };
      case 'iris':
        return {
          icon: 'eye-outline',
          label: 'Scanner d\'iris',
          subtitle: 'Déverrouillez avec votre iris',
          promptMessage: 'Authentification par scanner d\'iris',
        };
      default:
        return {
          icon: 'finger-print',
          label: 'Biométrie',
          subtitle: 'Non disponible sur cet appareil',
          promptMessage: 'Authentification biométrique',
        };
    }
  };

  const biometricInfo = getBiometricInfo();

  const toggleBiometric = async (value: boolean) => {
    if (!LocalAuthentication) {
      Alert.alert('Non disponible', 'La biométrie n\'est pas disponible sur cet appareil');
      return;
    }
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: biometricInfo.promptMessage,
          fallbackLabel: 'Utiliser le code PIN',
          disableDeviceFallback: false,
        });
        if (result.success) {
          setBiometricEnabled(true);
          await saveBiometricPreference(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Succès', `${biometricInfo.label} activé(e)`);
        }
      } catch {
        Alert.alert('Erreur', 'Échec de l\'authentification');
      }
    } else {
      setBiometricEnabled(false);
      await saveBiometricPreference(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleChangePin = async () => {
    if (newPin.length < 4) {
      Alert.alert('Erreur', 'Le PIN doit contenir au moins 4 chiffres');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Erreur', 'Les codes PIN ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Code PIN modifié avec succès');
      setChangingPin(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', 'Échec de la modification du PIN');
    } finally {
      setLoading(false);
    }
  };

  const SecurityItem = ({
    icon,
    title,
    subtitle,
    rightElement,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    rightElement?: React.ReactNode;
    onPress?: () => void;
  }) => (
    <AnimatedPressable onPress={onPress} disabled={!onPress} haptic>
      <View style={[styles.securityItem, { backgroundColor: theme.surface }]}>
        <View style={[styles.itemIcon, { backgroundColor: theme.primaryLighter }]}>
          <Ionicons name={icon as any} size={22} color={theme.primary} />
        </View>
        <View style={styles.itemContent}>
          <Text style={[styles.itemTitle, { color: theme.foreground }]}>{title}</Text>
          <Text style={[styles.itemSubtitle, { color: theme.mutedForeground }]}>{subtitle}</Text>
        </View>
        {rightElement || (onPress && (
          <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
        ))}
      </View>
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Security Score */}
          <Card variant="gradient" gradientColors={['#3366FF', '#1E40AF']} style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <Ionicons name="shield-checkmark" size={32} color="#FFF" />
              <View style={styles.scoreInfo}>
                <Text style={styles.scoreLabel}>Score de sécurité</Text>
                <Text style={styles.scoreValue}>Bon</Text>
              </View>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreNumber}>75%</Text>
              </View>
            </View>
            <Text style={styles.scoreTip}>
              {biometricEnabled 
                ? `${biometricInfo.label} activé(e) ✓`
                : biometricAvailable 
                  ? `Activez ${biometricInfo.label} pour améliorer votre score`
                  : 'Utilisez un code PIN fort pour améliorer votre score'}
            </Text>
          </Card>

          {/* Authentication */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Authentification</Text>
          <Card variant="outline" padding="none" style={styles.sectionCard}>
            <SecurityItem
              icon={biometricInfo.icon}
              title={biometricInfo.label}
              subtitle={biometricAvailable ? biometricInfo.subtitle : 'Non disponible sur cet appareil'}
              rightElement={
                <Switch
                  value={biometricEnabled}
                  onValueChange={toggleBiometric}
                  disabled={!biometricAvailable}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor="#FFF"
                />
              }
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <SecurityItem
              icon="keypad"
              title="Code PIN"
              subtitle="Modifier votre code PIN"
              onPress={() => setChangingPin(true)}
            />
          </Card>

          {/* Change PIN Modal */}
          {changingPin && (
            <Card variant="elevated" style={styles.pinCard}>
              <View style={styles.pinHeader}>
                <Text style={[styles.pinTitle, { color: theme.foreground }]}>
                  Modifier le code PIN
                </Text>
                <AnimatedPressable onPress={() => setChangingPin(false)}>
                  <Ionicons name="close" size={24} color={theme.mutedForeground} />
                </AnimatedPressable>
              </View>

              <Input
                label="Code PIN actuel"
                value={currentPin}
                onChangeText={setCurrentPin}
                placeholder="••••"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.mutedForeground} />}
              />

              <Input
                label="Nouveau code PIN"
                value={newPin}
                onChangeText={setNewPin}
                placeholder="••••"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                leftIcon={<Ionicons name="key-outline" size={20} color={theme.mutedForeground} />}
              />

              <Input
                label="Confirmer le nouveau PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                placeholder="••••"
                keyboardType="numeric"
                secureTextEntry
                maxLength={6}
                leftIcon={<Ionicons name="key-outline" size={20} color={theme.mutedForeground} />}
              />

              <View style={styles.pinButtons}>
                <Button variant="outline" onPress={() => setChangingPin(false)} style={styles.btnHalf}>
                  Annuler
                </Button>
                <Button onPress={handleChangePin} loading={loading} style={styles.btnHalf}>
                  Confirmer
                </Button>
              </View>
            </Card>
          )}

          {/* Sessions */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Sessions actives</Text>
          <Card variant="outline" padding="none" style={styles.sectionCard}>
            <View style={styles.sessionItem}>
              <View style={[styles.sessionIcon, { backgroundColor: theme.successLight }]}>
                <Ionicons 
                  name={Platform.OS === 'ios' ? 'phone-portrait' : 'phone-portrait-outline'} 
                  size={20} 
                  color={theme.success} 
                />
              </View>
              <View style={styles.sessionInfo}>
                <Text style={[styles.sessionDevice, { color: theme.foreground }]}>
                  {sessionInfo.deviceName}
                </Text>
                <Text style={[styles.sessionDetails, { color: theme.mutedForeground }]}>
                  {sessionInfo.osName} {sessionInfo.osVersion} • {sessionInfo.location}
                </Text>
              </View>
              <View style={[styles.activeBadge, { backgroundColor: theme.success }]}>
                <Text style={styles.activeText}>Actif</Text>
              </View>
            </View>
          </Card>

          {/* Security Tips */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Conseils de sécurité</Text>
          <Card variant="outline" style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                Ne partagez jamais votre code PIN
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                {biometricAvailable 
                  ? `Activez ${biometricInfo.label} pour plus de sécurité`
                  : 'Utilisez un code PIN complexe'}
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                Vérifiez régulièrement vos transactions
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.success} />
              <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                Signalez toute activité suspecte
              </Text>
            </View>
          </Card>

          {/* Danger Zone */}
          <Text style={[styles.sectionTitle, { color: theme.destructive }]}>Zone de danger</Text>
          <Card variant="outline" padding="none" style={StyleSheet.flatten([styles.sectionCard, { borderColor: theme.destructiveLight }])}>
            <SecurityItem
              icon="trash"
              title="Supprimer mon compte"
              subtitle="Cette action est irréversible"
              onPress={() => Alert.alert(
                'Supprimer le compte',
                'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Supprimer', style: 'destructive', onPress: () => {} },
                ]
              )}
            />
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  scoreCard: { padding: 20, marginBottom: 24 },
  scoreHeader: { flexDirection: 'row', alignItems: 'center' },
  scoreInfo: { marginLeft: 12, flex: 1 },
  scoreLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  scoreValue: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  scoreBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  scoreNumber: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  scoreTip: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  sectionCard: { marginBottom: 16, overflow: 'hidden' },
  securityItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  itemIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemContent: { marginLeft: 12, flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '500' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 72 },
  pinCard: { padding: 20, marginBottom: 16 },
  pinHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pinTitle: { fontSize: 18, fontWeight: '600' },
  pinButtons: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btnHalf: { flex: 1 },
  sessionItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  sessionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sessionInfo: { marginLeft: 12, flex: 1 },
  sessionDevice: { fontSize: 15, fontWeight: '500' },
  sessionDetails: { fontSize: 12, marginTop: 2 },
  activeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  activeText: { fontSize: 11, fontWeight: '600', color: '#FFF' },
  tipsCard: { padding: 16 },
  tipItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  tipText: { marginLeft: 10, fontSize: 13, flex: 1 },
});
