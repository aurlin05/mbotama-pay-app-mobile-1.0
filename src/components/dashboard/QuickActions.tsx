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
  gradient: string[];
}

const actions: QuickAction[] = [
  {
    label: 'Historique',
    icon: 'time',
    href: '/(tabs)/history',
    gradient: ['#8B5CF6', '#7C3AED'],
  },
  {
    label: 'Profil',
    icon: 'person',
    href: '/(tabs)/profile',
    gradient: ['#14B8A6', '#0D9488'],
  },
  {
    label: 'Support',
    icon: 'chatbubble-ellipses',
    href: '/(tabs)/profile',
    gradient: ['#F59E0B', '#D97706'],
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
      toValue: 0.9,
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
    } catch { }
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
        <View style={styles.card}>
          <LinearGradient
            colors={action.gradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconContainer}
          >
            <Ionicons name={action.icon} size={24} color="#FFFFFF" />
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
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
        Raccourcis
      </Text>
      <View style={styles.actionsRow}>
        {actions.map((action, index) => (
          <QuickActionCard key={action.href + index} action={action} index={index} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 24,
  },
  cardWrapper: {},
  cardContainer: {},
  card: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

