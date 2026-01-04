import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { ProgressCircle } from '../ui/AnimatedFeedback';
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
    gradient: ['#F59E0B', '#D97706'],
    icon: 'shield-outline' as const,
  },
  pending: {
    title: 'En cours de vérification',
    description: 'Votre dossier est en cours d\'analyse',
    statusLabel: 'En attente',
    statusType: 'pending' as const,
    action: 'Voir le statut',
    gradient: ['#3B82F6', '#2563EB'],
    icon: 'time-outline' as const,
  },
  verified: {
    title: 'Identité vérifiée',
    description: 'Vous pouvez envoyer de l\'argent sans limite',
    statusLabel: 'Vérifié',
    statusType: 'success' as const,
    action: 'Voir détails',
    gradient: ['#22C55E', '#16A34A'],
    icon: 'shield-checkmark' as const,
  },
  rejected: {
    title: 'Vérification échouée',
    description: 'Veuillez soumettre de nouveaux documents',
    statusLabel: 'Rejeté',
    statusType: 'failed' as const,
    action: 'Réessayer',
    gradient: ['#EF4444', '#DC2626'],
    icon: 'close-circle-outline' as const,
  },
};

export function KYCStatusCard({ status, progress = 0 }: KYCStatusCardProps) {
  const { theme, tokens } = useTheme();
  const config = kycConfig[status];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'pending') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [status]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push('/(tabs)/profile');
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Card style={styles.card} animated>
          <View style={styles.content}>
            {/* Icon with gradient */}
            <Animated.View style={{ transform: [{ scale: status === 'pending' ? pulseAnim : 1 }] }}>
              <LinearGradient
                colors={config.gradient as any}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconContainer}
              >
                <Ionicons name={config.icon} size={26} color="#FFFFFF" />
              </LinearGradient>
            </Animated.View>

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

              {/* Progress bar for not_started */}
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
                    <LinearGradient
                      colors={['#3366FF', '#1E40AF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                </View>
              )}

              {/* Action button */}
              <View style={styles.actionContainer}>
                <LinearGradient
                  colors={status === 'verified' ? ['transparent', 'transparent'] : config.gradient as any}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.actionButton,
                    status === 'verified' && {
                      borderWidth: 1.5,
                      borderColor: theme.success,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.actionText,
                      { color: status === 'verified' ? theme.success : '#FFFFFF' },
                    ]}
                  >
                    {config.action}
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={16}
                    color={status === 'verified' ? theme.success : '#FFFFFF'}
                  />
                </LinearGradient>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>
    </Pressable>
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
    borderRadius: 18,
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
    fontWeight: '700',
    flex: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  progressSection: {
    marginTop: 14,
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
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionContainer: {
    marginTop: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
