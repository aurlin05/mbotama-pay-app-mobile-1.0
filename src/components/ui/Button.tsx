import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'gradient' | 'success';
type ButtonSize = 'sm' | 'default' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  haptic?: boolean;
  gradientColors?: string[];
}

export function Button({
  children,
  onPress,
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
  haptic = true,
  gradientColors,
}: ButtonProps) {
  const { theme, tokens } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
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
    if (haptic && !disabled && !loading) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
    onPress?.();
  };

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle; shadow?: ViewStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: theme.secondary },
          text: { color: theme.secondaryForeground },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: theme.primary,
          },
          text: { color: theme.primary },
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: theme.primary },
        };
      case 'destructive':
        return {
          container: { backgroundColor: theme.destructive },
          text: { color: '#FFFFFF' },
        };
      case 'success':
        return {
          container: { backgroundColor: theme.success },
          text: { color: '#FFFFFF' },
          shadow: tokens.shadows.success,
        };
      case 'gradient':
        return {
          container: { backgroundColor: 'transparent' },
          text: { color: '#FFFFFF' },
          shadow: tokens.shadows.primary,
        };
      default:
        return {
          container: { backgroundColor: theme.primary },
          text: { color: theme.primaryForeground },
          shadow: tokens.shadows.primary,
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: { 
            height: tokens.components.button.height.sm,
            paddingHorizontal: 16, 
            borderRadius: tokens.borderRadius.md 
          },
          text: { fontSize: tokens.typography.fontSize.sm },
        };
      case 'lg':
        return {
          container: { 
            height: tokens.components.button.height.lg,
            paddingHorizontal: 28, 
            borderRadius: tokens.borderRadius.xl 
          },
          text: { fontSize: tokens.typography.fontSize.lg },
        };
      default:
        return {
          container: { 
            height: tokens.components.button.height.md,
            paddingHorizontal: 24, 
            borderRadius: tokens.borderRadius.lg 
          },
          text: { fontSize: tokens.typography.fontSize.base },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonContent = (
    <View style={styles.content}>
      {loading ? (
        <ActivityIndicator color={variantStyles.text.color} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={styles.iconLeft}>{icon}</View>}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && <View style={styles.iconRight}>{icon}</View>}
        </>
      )}
    </View>
  );

  const containerStyles = [
    styles.container,
    variantStyles.container,
    sizeStyles.container,
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    !disabled && variantStyles.shadow,
    style,
  ];

  if (variant === 'gradient') {
    const colors = gradientColors || ['#3366FF', '#1E40AF'];
    return (
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={colors as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              containerStyles,
              { overflow: 'hidden' },
            ]}
          >
            {buttonContent}
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          containerStyles,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {buttonContent}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
