import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../ui/Card';
import { useTheme } from '../../hooks/useTheme';

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  color: 'primary' | 'accent' | 'secondary';
}

const actions: QuickAction[] = [
  {
    label: 'Envoyer',
    icon: 'send',
    href: '/(tabs)/transfer',
    color: 'primary',
  },
  {
    label: 'Historique',
    icon: 'time',
    href: '/(tabs)/history',
    color: 'accent',
  },
  {
    label: 'Aide',
    icon: 'help-circle',
    href: '/(tabs)/profile',
    color: 'secondary',
  },
];

export function QuickActions() {
  const { theme, tokens } = useTheme();

  const getColorConfig = (color: QuickAction['color']) => {
    switch (color) {
      case 'primary':
        return { bg: theme.primary, fg: '#FFFFFF' };
      case 'accent':
        return { bg: theme.accent, fg: theme.primary };
      case 'secondary':
        return { bg: theme.secondary, fg: theme.secondaryForeground };
      default:
        return { bg: theme.primary, fg: '#FFFFFF' };
    }
  };

  return (
    <View style={styles.container}>
      {actions.map((action, index) => {
        const colorConfig = getColorConfig(action.color);
        return (
          <TouchableOpacity
            key={action.href}
            style={styles.cardWrapper}
            onPress={() => router.push(action.href as any)}
            activeOpacity={0.7}
          >
            <Card style={styles.card}>
              <View style={styles.content}>
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: colorConfig.bg },
                  ]}
                >
                  <Ionicons name={action.icon} size={20} color={colorConfig.fg} />
                </View>
                <Text style={[styles.label, { color: theme.foreground }]}>
                  {action.label}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  cardWrapper: {
    flex: 1,
  },
  card: {
    padding: 16,
  },
  content: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
});
