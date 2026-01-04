import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outline' | 'gradient' | 'glass' | 'highlight';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  animated?: boolean;
  gradientColors?: string[];
}

export function Card({
  children,
  style,
  variant = 'default',
  padding = 'md',
  onPress,
  animated = false,
  gradientColors,
}: CardProps) {
  const { theme, tokens } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [animated]);

  const handlePressIn = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  };

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.surface,
          ...tokens.shadows.lg,
        };
      case 'outline':
        return {
          backgroundColor: theme.surface,
          borderWidth: 1.5,
          borderColor: theme.border,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
        };
      case 'glass':
        return {
          backgroundColor: theme.surface + 'E6', // 90% opacity
          borderWidth: 1,
          borderColor: theme.border + '50',
          ...tokens.shadows.md,
        };
      case 'highlight':
        return {
          backgroundColor: theme.surface,
          borderWidth: 2,
          borderColor: theme.primary + '30',
          ...tokens.shadows.primary,
        };
      default:
        return {
          backgroundColor: theme.surface,
          ...tokens.shadows.md,
        };
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    const paddingMap = {
      none: 0,
      sm: tokens.components.card.padding.sm,
      md: tokens.components.card.padding.md,
      lg: tokens.components.card.padding.lg,
      xl: tokens.components.card.padding.xl,
    };
    return { padding: paddingMap[padding] };
  };

  const cardStyles = [
    styles.card,
    { borderRadius: tokens.borderRadius.xl },
    getVariantStyles(),
    getPaddingStyles(),
    style,
  ];

  const content = variant === 'gradient' ? (
    <LinearGradient
      colors={(gradientColors || ['#3366FF', '#1E40AF']) as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[cardStyles, { overflow: 'hidden' }]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={cardStyles}>{children}</View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: fadeAnim }}>
          {content}
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {content}
    </Animated.View>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ children, style }: CardHeaderProps) {
  return <View style={[styles.header, style]}>{children}</View>;
}

interface CardContentProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

interface CardFooterProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
  header: {
    marginBottom: 12,
  },
  content: {},
  footer: {
    marginTop: 12,
  },
});
