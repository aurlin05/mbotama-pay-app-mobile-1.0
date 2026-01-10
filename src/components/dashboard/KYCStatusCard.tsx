import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

type KYCStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

interface KYCStatusCardProps {
  status: KYCStatus;
}

const kycConfig = {
  not_started: {
    title: 'Complétez votre vérification',
    icon: 'shield-outline' as const,
    gradient: ['#F59E0B', '#D97706'],
    actionLabel: 'Commencer',
  },
  pending: {
    title: 'Vérification en cours...',
    icon: 'time-outline' as const,
    gradient: ['#3B82F6', '#2563EB'],
    actionLabel: 'Voir statut',
  },
  verified: {
    title: '',
    icon: 'shield-checkmark' as const,
    gradient: ['#22C55E', '#16A34A'],
    actionLabel: '',
  },
  rejected: {
    title: 'Vérification échouée',
    icon: 'close-circle-outline' as const,
    gradient: ['#EF4444', '#DC2626'],
    actionLabel: 'Réessayer',
  },
};

export function KYCStatusCard({ status }: KYCStatusCardProps) {
  const { tokens } = useTheme();
  const config = kycConfig[status];
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  // Don't show anything if verified
  if (status === 'verified') {
    return null;
  }

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
    } catch { }
    router.push('/(tabs)/profile');
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.container,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={config.gradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, { borderRadius: tokens.borderRadius.lg }]}
        >
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Ionicons name={config.icon} size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {config.title}
            </Text>
            <View style={styles.actionContainer}>
              <Text style={styles.actionLabel}>{config.actionLabel}</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  gradient: {
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

