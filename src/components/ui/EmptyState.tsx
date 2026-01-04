import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { Button } from './Button';

type EmptyStateVariant = 'transactions' | 'notifications' | 'search' | 'error' | 'general';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

const variantConfig: Record<EmptyStateVariant, {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}> = {
  transactions: {
    icon: 'receipt-outline',
    title: 'Aucune transaction',
    description: 'Vos transactions apparaîtront ici une fois effectuées',
  },
  notifications: {
    icon: 'notifications-outline',
    title: 'Aucune notification',
    description: 'Vous n\'avez pas de nouvelles notifications',
  },
  search: {
    icon: 'search-outline',
    title: 'Aucun résultat',
    description: 'Essayez avec d\'autres termes de recherche',
  },
  error: {
    icon: 'cloud-offline-outline',
    title: 'Erreur de chargement',
    description: 'Impossible de charger les données. Veuillez réessayer.',
  },
  general: {
    icon: 'folder-open-outline',
    title: 'Rien à afficher',
    description: 'Il n\'y a rien ici pour le moment',
  },
};

export function EmptyState({
  variant = 'general',
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  const { theme, tokens } = useTheme();
  const config = variantConfig[variant];
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const iconName = icon || config.icon;
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;

  const getIconColor = () => {
    if (variant === 'error') return theme.destructive;
    return theme.mutedForeground;
  };

  const getIconBgColor = () => {
    if (variant === 'error') return theme.destructiveLight;
    return theme.muted;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Decorative circles */}
      <View style={styles.decorContainer}>
        <View style={[styles.decorCircle1, { backgroundColor: theme.primary + '08' }]} />
        <View style={[styles.decorCircle2, { backgroundColor: theme.primary + '05' }]} />
      </View>

      {/* Icon */}
      <View style={[styles.iconContainer, { backgroundColor: getIconBgColor() }]}>
        <Ionicons name={iconName} size={40} color={getIconColor()} />
      </View>

      {/* Text */}
      <Text style={[styles.title, { color: theme.foreground }]}>{displayTitle}</Text>
      <Text style={[styles.description, { color: theme.mutedForeground }]}>
        {displayDescription}
      </Text>

      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant={variant === 'error' ? 'default' : 'outline'}
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
        >
          {actionLabel}
        </Button>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  decorContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  decorCircle2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 24,
    minWidth: 140,
  },
});
