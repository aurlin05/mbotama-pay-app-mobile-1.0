import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

type BadgeStatus = 'success' | 'pending' | 'failed' | 'warning' | 'info';
type BadgeSize = 'sm' | 'md';

interface StatusBadgeProps {
  status: BadgeStatus;
  label: string;
  size?: BadgeSize;
}

export function StatusBadge({ status, label, size = 'md' }: StatusBadgeProps) {
  const { theme, tokens } = useTheme();

  const getStatusColors = () => {
    switch (status) {
      case 'success':
        return {
          background: theme.successLight,
          text: theme.success,
        };
      case 'pending':
        return {
          background: theme.warningLight,
          text: theme.warning,
        };
      case 'failed':
        return {
          background: theme.destructiveLight,
          text: theme.destructive,
        };
      case 'warning':
        return {
          background: theme.warningLight,
          text: theme.warning,
        };
      case 'info':
      default:
        return {
          background: theme.secondary,
          text: theme.primary,
        };
    }
  };

  const colors = getStatusColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.background,
          paddingHorizontal: isSmall ? 8 : 12,
          paddingVertical: isSmall ? 4 : 6,
          borderRadius: tokens.borderRadius.full,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colors.text,
            fontSize: isSmall ? 10 : 12,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
  },
});
