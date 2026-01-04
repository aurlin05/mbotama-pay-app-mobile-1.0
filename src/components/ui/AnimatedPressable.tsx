import React, { useRef } from 'react';
import { Animated, Pressable, PressableProps, ViewStyle, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scaleValue?: number;
  haptic?: boolean;
  hapticType?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';
}

export function AnimatedPressable({
  children,
  style,
  scaleValue = 0.97,
  haptic = true,
  hapticType = 'light',
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: scaleValue,
      friction: 8,
      tension: 300,
      useNativeDriver: true,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 200,
      useNativeDriver: true,
    }).start();
    onPressOut?.(e);
  };

  const handlePress = async (e: any) => {
    if (haptic) {
      try {
        switch (hapticType) {
          case 'light':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            break;
          case 'medium':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'heavy':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            break;
          case 'success':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'warning':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          case 'error':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
        }
      } catch {
        // Haptics not available
      }
    }
    onPress?.(e);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Bounce Button - More playful animation
export function BounceButton({
  children,
  style,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const bounceAnim = useRef(new Animated.Value(1)).current;

  const handlePress = async (e: any) => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 3,
        tension: 200,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}

    onPress?.(e);
  };

  return (
    <Pressable onPress={handlePress} {...props}>
      <Animated.View style={[style, { transform: [{ scale: bounceAnim }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

// Ripple Effect Button (simplified)
interface RippleButtonProps extends AnimatedPressableProps {
  rippleColor?: string;
}

export function RippleButton({
  children,
  style,
  rippleColor = 'rgba(255,255,255,0.3)',
  onPress,
  ...props
}: RippleButtonProps) {
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  const handlePress = (e: any) => {
    rippleAnim.setValue(0);
    opacityAnim.setValue(0.5);

    Animated.parallel([
      Animated.timing(rippleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    onPress?.(e);
  };

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  return (
    <Pressable onPress={handlePress} {...props}>
      <Animated.View style={[style, styles.rippleContainer]}>
        <Animated.View
          style={[
            styles.ripple,
            {
              backgroundColor: rippleColor,
              opacity: opacityAnim,
              transform: [{ scale: rippleScale }],
            },
          ]}
        />
        {children}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  rippleContainer: {
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },
});
