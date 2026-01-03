import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

interface KYCStatusCardProps {
  status: KYCStatus;
  progress?: number;
}

const kycConfig = {
  not_started: {
    title: 'Vérification requise',
    description: 'Complétez votre KYC pour envoyer de l\'argent',
    statusLabel: 'Non commencé',
    statusType: 'warning' as const,
    action: 'Commencer',
    href: '/(tabs)/profile',
  },
  pending: {
    title: 'En cours de vérification',
    description: 'Votre dossier est en cours d\'analyse',
    statusLabel: 'En attente',
    statusType: 'pending' as const,
    action: 'Voir le statut',
    href: '/(tabs)/profile',
  },
  verified: {
    title: 'Identité vérifiée',
    description: 'Vous pouvez envoyer de l\'argent',
    statusLabel: 'Vérifié',
    statusType: 'success' as const,
    action: 'Voir détails',
    href: '/(tabs)/profile',
  },
  rejected: {
    title: 'Vérification échouée',
    description: 'Veuillez soumettre de nouveaux documents',
    statusLabel: 'Rejeté',
    statusType: 'failed' as const,
    action: 'Réessayer',
    href: '/(tabs)/profile',
  },
};

export function KYCStatusCard({ status, progress = 0 }: KYCStatusCardProps) {
  const { theme, tokens } = useTheme();
  const config = kycConfig[status];

  const getIconConfig = () => {
    switch (status) {
      case 'verified':
        return { name: 'person-circle', color: theme.success, bgColor: theme.successLight };
      case 'rejected':
        return { name: 'document-text', color: theme.destructive, bgColor: theme.destructiveLight };
      default:
        return { name: 'shield-checkmark', color: theme.primary, bgColor: theme.secondary };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: iconConfig.bgColor },
          ]}
        >
          <Ionicons
            name={iconConfig.name as any}
            size={28}
            color={iconConfig.color}
          />
        </View>

        <View style={styles.info}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={1}>
              {config.title}
            </Text>
            <StatusBadge status={config.statusType} label={config.statusLabel} size="sm" />
          </View>
          <Text style={[styles.description, { color: theme.mutedForeground }]}>
            {config.description}
          </Text>

          {status === 'not_started' && progress > 0 && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: theme.mutedForeground }]}>
                  Progression
                </Text>
                <Text style={[styles.progressValue, { color: theme.primary }]}>
                  {progress}%
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.muted }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: theme.primary },
                  ]}
                />
              </View>
            </View>
          )}

          <Button
            variant={status === 'verified' ? 'outline' : 'default'}
            size="sm"
            onPress={() => router.push(config.href as any)}
            style={styles.button}
            icon={<Ionicons name="arrow-forward" size={16} color={status === 'verified' ? theme.primary : '#FFFFFF'} />}
            iconPosition="right"
          >
            {config.action}
          </Button>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    gap: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  button: {
    marginTop: 16,
    height: 44,
  },
});
