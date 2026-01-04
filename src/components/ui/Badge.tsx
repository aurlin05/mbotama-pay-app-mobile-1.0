import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'subtle';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children?: React.ReactNode;
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
  style?: ViewStyle;
}

export function Badge({
  children,
  label,
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  style,
}: BadgeProps) {
  const { theme, tokens } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: theme.successLight,
          text: theme.success,
          border: theme.success + '30',
        };
      case 'warning':
        return {
          bg: theme.warningLight,
          text: theme.warningDark,
          border: theme.warning + '30',
        };
      case 'error':
        return {
          bg: theme.destructiveLight,
          text: theme.destructive,
          border: theme.destructive + '30',
        };
      case 'info':
        return {
          bg: theme.infoLight,
          text: theme.info,
          border: theme.info + '30',
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: theme.foreground,
          border: theme.border,
        };
      case 'subtle':
        return {
          bg: theme.muted,
          text: theme.mutedForeground,
          border: 'transparent',
        };
      default:
        return {
          bg: theme.primaryLighter,
          text: theme.primary,
          border: theme.primary + '30',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: tokens.components.badge.height.sm,
          paddingHorizontal: 8,
          fontSize: 10,
          iconSize: 10,
          dotSize: 6,
        };
      case 'lg':
        return {
          height: tokens.components.badge.height.lg,
          paddingHorizontal: 14,
          fontSize: 14,
          iconSize: 16,
          dotSize: 10,
        };
      default:
        return {
          height: tokens.components.badge.height.md,
          paddingHorizontal: 10,
          fontSize: 12,
          iconSize: 12,
          dotSize: 8,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const content = children || label;

  return (
    <View
      style={[
        styles.badge,
        {
          height: sizeStyles.height,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          borderRadius: tokens.borderRadius.full,
        },
        variant === 'outline' && { borderWidth: 1.5 },
        style,
      ]}
    >
      {dot && (
        <View
          style={[
            styles.dot,
            {
              width: sizeStyles.dotSize,
              height: sizeStyles.dotSize,
              borderRadius: sizeStyles.dotSize / 2,
              backgroundColor: variantStyles.text,
            },
          ]}
        />
      )}
      {icon && !dot && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={variantStyles.text}
          style={styles.icon}
        />
      )}
      {content && (
        <Text
          style={[
            styles.text,
            {
              fontSize: sizeStyles.fontSize,
              color: variantStyles.text,
            },
          ]}
        >
          {content}
        </Text>
      )}
    </View>
  );
}

// Notification Badge (for icons)
interface NotificationBadgeProps {
  count?: number;
  show?: boolean;
  maxCount?: number;
  children: React.ReactNode;
}

export function NotificationBadge({
  count = 0,
  show = true,
  maxCount = 99,
  children,
}: NotificationBadgeProps) {
  const { theme } = useTheme();

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();
  const showBadge = show && count > 0;

  return (
    <View style={styles.notificationContainer}>
      {children}
      {showBadge && (
        <View
          style={[
            styles.notificationBadge,
            {
              backgroundColor: theme.destructive,
              minWidth: count > 9 ? 20 : 18,
            },
          ]}
        >
          <Text style={styles.notificationText}>{displayCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    marginRight: 6,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
