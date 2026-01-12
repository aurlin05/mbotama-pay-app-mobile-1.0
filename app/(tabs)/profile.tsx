import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Animated,
  Linking,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../../src/store/authStore';
import { userService } from '../../src/services/user';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import { Avatar } from '../../src/components/ui/Avatar';
import { Input } from '../../src/components/ui/Input';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';

// Try to import LocalAuthentication
let LocalAuthentication: any = null;
try {
  LocalAuthentication = require('expo-local-authentication');
} catch (e) {
  // Module not available
}

// Clé de stockage partagée avec security.tsx
const BIOMETRIC_ENABLED_KEY = '@mbotama_biometric_enabled';

// Responsive breakpoints
const useResponsive = () => {
  const { width } = useWindowDimensions();
  return {
    isSmall: width < 360,
    isMedium: width >= 360 && width < 400,
    isLarge: width >= 400,
    width,
  };
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const responsive = useResponsive();
  const { user, kycStatus, transactionLimit, logout, fetchUserData } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [biometrics, setBiometrics] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<'fingerprint' | 'faceid' | 'none'>('none');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
    
    checkBiometricAvailability();
  }, []);

  // Recharger l'état biométrique quand l'écran redevient actif
  useFocusEffect(
    useCallback(() => {
      loadBiometricPreference();
    }, [])
  );

  const checkBiometricAvailability = async () => {
    if (!LocalAuthentication) {
      setBiometricAvailable(false);
      return;
    }
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
      
      if (compatible && enrolled) {
        const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (supportedTypes.includes(2)) {
          setBiometricType('faceid');
        } else if (supportedTypes.includes(1)) {
          setBiometricType('fingerprint');
        }
      }
    } catch {
      setBiometricAvailable(false);
    }
  };

  const loadBiometricPreference = async () => {
    try {
      const saved = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
      setBiometrics(saved === 'true');
    } catch {
      // Ignorer
    }
  };

  const handleChangePhoto = async () => {
    Alert.alert(
      'Changer la photo',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: () => pickProfilePhoto(true),
        },
        {
          text: 'Choisir dans la galerie',
          onPress: () => pickProfilePhoto(false),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const pickProfilePhoto = async (useCamera: boolean) => {
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la caméra');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        try {
          // En production, uploader l'image vers un serveur et récupérer l'URL
          // Pour l'instant, on simule avec l'URI locale
          await userService.updateProfile({
            profilePictureUrl: result.assets[0].uri,
          });
          await fetchUserData();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('Succès', 'Photo de profil mise à jour');
        } catch (error: any) {
          Alert.alert('Erreur', error.response?.data?.message || 'Échec de la mise à jour');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (!LocalAuthentication || !biometricAvailable) {
      Alert.alert('Non disponible', 'La biométrie n\'est pas disponible sur cet appareil');
      return;
    }
    
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: biometricType === 'faceid' 
            ? (Platform.OS === 'ios' ? 'Activer Face ID' : 'Activer la reconnaissance faciale')
            : 'Activer l\'empreinte digitale',
          fallbackLabel: 'Utiliser le code PIN',
        });
        if (result.success) {
          setBiometrics(true);
          await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        Alert.alert('Erreur', 'Échec de l\'authentification');
      }
    } else {
      setBiometrics(false);
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const getBiometricLabel = () => {
    if (biometricType === 'faceid') {
      return Platform.OS === 'ios' ? 'Face ID' : 'Reconnaissance faciale';
    }
    return 'Empreinte digitale';
  };

  const getBiometricIcon = () => {
    if (biometricType === 'faceid') {
      return Platform.OS === 'ios' ? 'scan-outline' : 'happy-outline';
    }
    return 'finger-print-outline';
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await userService.updateProfile({ firstName, lastName, email });
      await fetchUserData();
      setEditing(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Profil mis à jour avec succès');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Déconnexion', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const getKycInfo = () => {
    const displayName = kycStatus?.currentLevelDisplayName;
    switch (kycStatus?.currentLevel) {
      case 'LEVEL_1':
        return { label: displayName || 'Niveau 1', status: 'success' as const, icon: 'shield-checkmark', progress: 50 };
      case 'LEVEL_2':
        return { label: displayName || 'Niveau 2', status: 'success' as const, icon: 'shield-checkmark', progress: 100 };
      default:
        // Vérifier si des documents sont en attente
        if (kycStatus?.pendingDocuments && kycStatus.pendingDocuments.length > 0) {
          return { label: 'En vérification', status: 'pending' as const, icon: 'time', progress: 25 };
        }
        return { label: displayName || 'Non vérifié', status: 'warning' as const, icon: 'shield-outline', progress: 0 };
    }
  };

  const kycInfo = getKycInfo();
  const userName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.phoneNumber || 'Utilisateur';

  // Calcul des limites
  const limitUsed = transactionLimit?.usedAmount || 0;
  const limitMax = transactionLimit?.monthlyLimit || 100000;
  const limitPercent = Math.min((limitUsed / limitMax) * 100, 100);

  const MenuItem = ({
    icon,
    label,
    subtitle,
    onPress,
    danger = false,
    rightElement,
    showChevron = true,
  }: {
    icon: string;
    label: string;
    subtitle?: string;
    onPress?: () => void;
    danger?: boolean;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
  }) => (
    <AnimatedPressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      haptic
      hapticType="light"
    >
      <View style={[styles.menuItem, { backgroundColor: theme.surface }]}>
        <View
          style={[
            styles.menuIcon,
            { backgroundColor: danger ? theme.destructiveLight : theme.secondary },
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={danger ? theme.destructive : theme.primary}
          />
        </View>
        <View style={styles.menuContent}>
          <Text style={[styles.menuLabel, { color: danger ? theme.destructive : theme.foreground }]}>
            {label}
          </Text>
          {subtitle && (
            <Text style={[styles.menuSubtitle, { color: theme.mutedForeground }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightElement || (showChevron && onPress && (
          <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />
        ))}
      </View>
    </AnimatedPressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: theme.foreground }]}>Mon Profil</Text>
          </View>

          {/* Profile Card */}
          <Card variant="elevated" style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <Avatar
                source={user?.profilePictureUrl}
                name={userName}
                size="xl"
                gradient
                gradientColors={['#3366FF', '#1E40AF']}
                showBadge={kycInfo.status === 'success'}
                badgeColor={theme.success}
              />
              <TouchableOpacity
                style={[styles.editAvatarBtn, { backgroundColor: theme.primary }]}
                onPress={handleChangePhoto}
                disabled={uploadingPhoto}
              >
                {uploadingPhoto ? (
                  <Ionicons name="hourglass" size={14} color="#FFF" />
                ) : (
                  <Ionicons name="camera" size={14} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.userName, { color: theme.foreground }]}>{userName}</Text>
            <Text style={[styles.userPhone, { color: theme.mutedForeground }]}>
              {user?.phoneNumber}
            </Text>
            {user?.email && (
              <Text style={[styles.userEmail, { color: theme.mutedForeground }]}>
                {user.email}
              </Text>
            )}
            
            {/* Infos supplémentaires */}
            {(user?.city || user?.address) && (
              <View style={styles.userLocationRow}>
                <Ionicons name="location-outline" size={14} color={theme.mutedForeground} />
                <Text style={[styles.userLocation, { color: theme.mutedForeground }]}>
                  {[user?.city, user?.address].filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
            
            {user?.dateOfBirth && (
              <View style={styles.userLocationRow}>
                <Ionicons name="calendar-outline" size={14} color={theme.mutedForeground} />
                <Text style={[styles.userLocation, { color: theme.mutedForeground }]}>
                  {new Date(user.dateOfBirth).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            )}
            
            <View style={styles.badgeRow}>
              <StatusBadge status={kycInfo.status} label={kycInfo.label} />
              {user?.phoneVerified && (
                <View style={[styles.verifiedBadge, { backgroundColor: theme.successLight }]}>
                  <Ionicons name="checkmark-circle" size={12} color={theme.success} />
                  <Text style={[styles.verifiedText, { color: theme.success }]}>Téléphone vérifié</Text>
                </View>
              )}
            </View>

            {/* Limite mensuelle */}
            <View style={[styles.limitSection, { borderTopColor: theme.border }]}>
              <View style={styles.limitHeader}>
                <Text style={[styles.limitTitle, { color: theme.foreground }]}>
                  Limite mensuelle
                </Text>
                <Text style={[styles.limitValue, { color: theme.primary }]}>
                  {limitUsed.toLocaleString()} / {limitMax.toLocaleString()} FCFA
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.muted }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${limitPercent}%`,
                      backgroundColor: limitPercent > 80 ? theme.warning : theme.primary,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.limitRemaining, { color: theme.mutedForeground }]}>
                {(limitMax - limitUsed).toLocaleString()} FCFA restants
              </Text>
            </View>
          </Card>

          {/* Quick Actions */}
          <View style={[
            styles.quickActions,
            responsive.isSmall && styles.quickActionsSmall
          ]}>
            <AnimatedPressable
              onPress={() => setEditing(true)}
              haptic
              style={StyleSheet.flatten([
                styles.quickAction,
                { backgroundColor: theme.surface },
                responsive.isSmall && styles.quickActionSmall
              ])}
            >
              <View style={[
                styles.quickActionIcon,
                { backgroundColor: theme.primaryLighter },
                responsive.isSmall && styles.quickActionIconSmall
              ]}>
                <Ionicons name="create-outline" size={responsive.isSmall ? 18 : 20} color={theme.primary} />
              </View>
              <Text style={[
                styles.quickActionLabel,
                { color: theme.foreground },
                responsive.isSmall && styles.quickActionLabelSmall
              ]}>Modifier</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => router.push('/profile/kyc')}
              haptic
              style={StyleSheet.flatten([
                styles.quickAction,
                { backgroundColor: theme.surface },
                responsive.isSmall && styles.quickActionSmall
              ])}
            >
              <View style={[
                styles.quickActionIcon,
                { backgroundColor: theme.successLight },
                responsive.isSmall && styles.quickActionIconSmall
              ]}>
                <Ionicons name="shield-checkmark-outline" size={responsive.isSmall ? 18 : 20} color={theme.success} />
              </View>
              <Text style={[
                styles.quickActionLabel,
                { color: theme.foreground },
                responsive.isSmall && styles.quickActionLabelSmall
              ]}>KYC</Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => router.push('/profile/security')}
              haptic
              style={StyleSheet.flatten([
                styles.quickAction,
                { backgroundColor: theme.surface },
                responsive.isSmall && styles.quickActionSmall
              ])}
            >
              <View style={[
                styles.quickActionIcon,
                { backgroundColor: theme.warningLight },
                responsive.isSmall && styles.quickActionIconSmall
              ]}>
                <Ionicons name="lock-closed-outline" size={responsive.isSmall ? 18 : 20} color={theme.warning} />
              </View>
              <Text style={[
                styles.quickActionLabel,
                { color: theme.foreground },
                responsive.isSmall && styles.quickActionLabelSmall
              ]}>Sécurité</Text>
            </AnimatedPressable>
          </View>

          {/* Edit Profile Modal */}
          {editing && (
            <Card variant="elevated" style={styles.editSection}>
              <View style={styles.editHeader}>
                <Text style={[styles.editTitle, { color: theme.foreground }]}>
                  Modifier le profil
                </Text>
                <TouchableOpacity onPress={() => setEditing(false)}>
                  <Ionicons name="close" size={24} color={theme.mutedForeground} />
                </TouchableOpacity>
              </View>

              <Input
                label="Prénom"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.mutedForeground} />}
              />

              <Input
                label="Nom"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom"
                leftIcon={<Ionicons name="person-outline" size={20} color={theme.mutedForeground} />}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Ionicons name="mail-outline" size={20} color={theme.mutedForeground} />}
              />

              <View style={styles.editButtons}>
                <Button variant="outline" onPress={() => setEditing(false)} style={styles.buttonHalf}>
                  Annuler
                </Button>
                <Button onPress={handleSaveProfile} loading={loading} style={styles.buttonHalf}>
                  Enregistrer
                </Button>
              </View>
            </Card>
          )}

          {/* Settings Section */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Paramètres</Text>
          
          <Card variant="outline" padding="none" style={styles.menuCard}>
            <MenuItem
              icon="notifications-outline"
              label="Notifications"
              subtitle="Recevoir les alertes de transactions"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={(val) => {
                    setNotifications(val);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor="#FFFFFF"
                />
              }
              showChevron={false}
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <MenuItem
              icon={getBiometricIcon()}
              label={getBiometricLabel()}
              subtitle={biometricAvailable 
                ? `Connexion par ${getBiometricLabel().toLowerCase()}`
                : 'Non disponible sur cet appareil'}
              rightElement={
                <Switch
                  value={biometrics}
                  onValueChange={toggleBiometric}
                  disabled={!biometricAvailable}
                  trackColor={{ true: theme.primary, false: theme.border }}
                  thumbColor="#FFFFFF"
                />
              }
              showChevron={false}
            />
          </Card>

          {/* Support Section */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Support</Text>
          
          <Card variant="outline" padding="none" style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Centre d'aide"
              subtitle="FAQ et guides d'utilisation"
              onPress={() => router.push('/profile/help')}
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <MenuItem
              icon="chatbubble-outline"
              label="Nous contacter"
              subtitle="Support par chat ou email"
              onPress={() => Linking.openURL('mailto:support@mbotamapay.com')}
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <MenuItem
              icon="document-text-outline"
              label="Conditions d'utilisation"
              onPress={() => router.push('/profile/terms')}
            />
            <View style={[styles.menuDivider, { backgroundColor: theme.border }]} />
            <MenuItem
              icon="shield-outline"
              label="Politique de confidentialité"
              onPress={() => router.push('/profile/privacy')}
            />
          </Card>

          {/* Logout */}
          <Card variant="outline" padding="none" style={StyleSheet.flatten([styles.menuCard, styles.logoutCard])}>
            <MenuItem
              icon="log-out-outline"
              label="Déconnexion"
              onPress={handleLogout}
              danger
              showChevron={false}
            />
          </Card>

          {/* Version */}
          <Text style={[styles.version, { color: theme.mutedForeground }]}>
            MBOTAMAPAY v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  profileHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 15,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 12,
  },
  userLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userLocation: {
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 16,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '500',
  },
  limitSection: {
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  limitValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  limitRemaining: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  quickActionsSmall: {
    gap: 8,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    minWidth: 80,
  },
  quickActionSmall: {
    padding: 12,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  quickActionLabelSmall: {
    fontSize: 11,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  menuCard: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginLeft: 68,
  },
  editSection: {
    padding: 20,
    marginBottom: 24,
  },
  editHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  logoutCard: {
    marginTop: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});
