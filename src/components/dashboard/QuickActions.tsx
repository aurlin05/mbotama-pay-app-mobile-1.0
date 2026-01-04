import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  color: 'primary' | 'success' | 'warning' | 'purple' | 'teal';
  gradient?: string[];
}

const actions: QuickAction[] = [
  {
    label: 'Envoyer',
    icon: 'paper-plane',
    href: '/(tabs)/transfer',
    color: 'primary',
    gradient: ['#3366FF', '#1E40AF'],
  },
  {
    label: 'Recevoir',
    icon: 'download',
    href: '/(tabs)/history',
    color: 'success',
    gradient: ['#22C55E', '#16A34A'],
  },
  {
    label: 'Historique',
    icon: 'time',
    href: '/(tabs)/history',
    color: 'purple',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    label: 'Plus',
    icon: 'grid',
    href: '/(tabs)/profile',
    color: 'teal',
    gradient: ['#14B8A6', '#0D9488'],
  },
];

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

function QuickActionCard({ action, index }: QuickActionCardProps) {
  const { theme, tokens } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.92,
      friction: 8,
      tension: 300,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push(action.href as any);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.cardWrapper}
    >
      <Animated.View style={[styles.cardContainer, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.card, { backgroundColor: theme.surface, ...tokens.shadows.md }]}>
          <LinearGradient
            colors={(action.gradient || ['#3366FF', '#1E40AF']) as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name={action.icon} size={22} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.label, { color: theme.foreground }]} numberOfLines={1}>
            {action.label}
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function QuickActions() {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <QuickActionCard key={action.href + index} action={action} index={index} />
      ))}
    </View>
  );
}

// Alternative: Horizontal Scrollable Quick Actions
export function QuickActionsHorizontal() {
  const { theme, tokens } = useTheme();

  return (
    <View style={styles.horizontalContainer}>
      {actions.map((action, index) => (
        <Pressable
          key={action.href + index}
          style={[styles.horizontalCard, { backgroundColor: theme.surface, ...tokens.shadows.sm }]}
          onPress={() => router.push(action.href as any)}
        >
          <LinearGradient
            colors={(action.gradient || ['#3366FF', '#1E40AF']) as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.horizontalIcon}
          >
            <Ionicons name={action.icon} size={20} color="#FFFFFF" />
          </LinearGradient>
          <Text style={[styles.horizontalLabel, { color: theme.foreground }]}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 18,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Horizontal variant
  horizontalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  horizontalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 10,
  },
  horizontalIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});
