import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Switch } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../src/store/authStore';
import { userService } from '../../src/services/user';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { StatusBadge } from '../../src/components/ui/StatusBadge';

export default function ProfileScreen() {
  const { theme, tokens } = useTheme();
  const { user, kycStatus, logout, fetchUserData } = useAuthStore();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await userService.updateProfile({ firstName, lastName, email });
      await fetchUserData();
      setEditing(false);
      Alert.alert('Succès', 'Profil mis à jour');
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
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
    switch (kycStatus?.status) {
      case 'LEVEL_1':
        return { label: 'Niveau 1', status: 'success' as const, icon: 'shield-checkmark' as const };
      case 'LEVEL_2':
        return { label: 'Niveau 2', status: 'success' as const, icon: 'shield-checkmark' as const };
      case 'PENDING':
        return { label: 'En vérification', status: 'pending' as const, icon: 'time' as const };
      case 'REJECTED':
        return { label: 'Rejeté', status: 'failed' as const, icon: 'close-circle' as const };
      default:
        return { label: 'Non vérifié', status: 'warning' as const, icon: 'shield-outline' as const };
    }
  };

  const kycInfo = getKycInfo();

  const MenuItem = ({
    icon,
    label,
    onPress,
    danger = false,
    rightElement,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    danger?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
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
      <Text style={[styles.menuLabel, { color: danger ? theme.destructive : theme.foreground }]}>
        {label}
      </Text>
      {rightElement || <Ionicons name="chevron-forward" size={20} color={theme.mutedForeground} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <LinearGradient
            colors={['#3366FF', '#1E40AF']}
            style={styles.avatarGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {(user?.firstName?.[0] || user?.phoneNumber?.[0] || 'U').toUpperCase()}
            </Text>
          </LinearGradient>
          <Text style={[styles.userName, { color: theme.foreground }]}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.phoneNumber || 'Utilisateur'}
          </Text>
          <Text style={[styles.userPhone, { color: theme.mutedForeground }]}>
            {user?.phoneNumber}
          </Text>
          <StatusBadge status={kycInfo.status} label={kycInfo.label} />
        </Card>

        {/* Edit Profile Section */}
        {editing ? (
          <Card style={styles.editSection}>
            <Text style={[styles.inputLabel, { color: theme.foreground }]}>Prénom</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.input, { color: theme.foreground }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                placeholderTextColor={theme.mutedForeground}
              />
            </View>

            <Text style={[styles.inputLabel, { color: theme.foreground }]}>Nom</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.input, { color: theme.foreground }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom"
                placeholderTextColor={theme.mutedForeground}
              />
            </View>

            <Text style={[styles.inputLabel, { color: theme.foreground }]}>Email</Text>
            <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <TextInput
                style={[styles.input, { color: theme.foreground }]}
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                placeholderTextColor={theme.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.editButtons}>
              <Button variant="outline" onPress={() => setEditing(false)} style={styles.buttonHalf}>
                Annuler
              </Button>
              <Button onPress={handleSaveProfile} loading={loading} style={styles.buttonHalf}>
                Enregistrer
              </Button>
            </View>
          </Card>
        ) : (
          <MenuItem icon="create-outline" label="Modifier le profil" onPress={() => setEditing(true)} />
        )}

        {/* Verification Section */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Vérification</Text>
        <MenuItem
          icon="document-text-outline"
          label="Vérifier mon identité (KYC)"
          onPress={() => Alert.alert('KYC', 'Fonctionnalité à venir')}
        />

        {/* Settings Section */}
        <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Paramètres</Text>
        <MenuItem
          icon="notifications-outline"
          label="Notifications"
          rightElement={
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ true: theme.primary, false: theme.border }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem icon="lock-closed-outline" label="Sécurité" onPress={() => {}} />
        <MenuItem icon="help-circle-outline" label="Aide & Support" onPress={() => {}} />
        <MenuItem icon="document-outline" label="Conditions d'utilisation" onPress={() => {}} />

        {/* Logout Section */}
        <View style={styles.logoutSection}>
          <MenuItem icon="log-out-outline" label="Déconnexion" onPress={handleLogout} danger />
        </View>

        {/* Version */}
        <Text style={[styles.version, { color: theme.mutedForeground }]}>Version 1.0.0</Text>
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
  profileCard: {
    alignItems: 'center',
    padding: 24,
    marginBottom: 16,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    marginBottom: 8,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
  editSection: {
    padding: 20,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  buttonHalf: {
    flex: 1,
  },
  logoutSection: {
    marginTop: 24,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    marginBottom: 40,
  },
});
