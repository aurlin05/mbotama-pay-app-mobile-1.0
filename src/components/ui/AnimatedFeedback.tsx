import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

type FeedbackType = 'success' | 'error' | 'warning' | 'loading' | 'info';

interface AnimatedFeedbackProps {
  type: FeedbackType;
  title?: string;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

// Success Checkmark Animation
export function SuccessAnimation({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  const sizeMap = { sm: 60, md: 100, lg: 140 };
  const iconSizeMap = { sm: 28, md: 48, lg: 64 };
  const containerSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(checkAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.feedbackContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 3,
          backgroundColor: theme.successLight,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View style={{ opacity: checkAnim, transform: [{ scale: checkAnim }] }}>
        <Ionicons name="checkmark" size={iconSize} color={theme.success} />
      </Animated.View>
    </Animated.View>
  );
}

// Error Animation
export function ErrorAnimation({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { theme } = useTheme();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  const sizeMap = { sm: 60, md: 100, lg: 140 };
  const iconSizeMap = { sm: 28, md: 48, lg: 64 };
  const containerSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(200),
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.feedbackContainer,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 3,
          backgroundColor: theme.destructiveLight,
          transform: [{ scale: scaleAnim }, { translateX: shakeAnim }],
        },
      ]}
    >
      <Ionicons name="close" size={iconSize} color={theme.destructive} />
    </Animated.View>
  );
}

// Loading Spinner
export function LoadingSpinner({ size = 'md', color }: { size?: 'sm' | 'md' | 'lg'; color?: string }) {
  const { theme } = useTheme();
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const sizeMap = { sm: 24, md: 40, lg: 56 };
  const spinnerSize = sizeMap[size];

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderRadius: spinnerSize / 2,
            borderWidth: spinnerSize / 10,
            borderColor: (color || theme.primary) + '30',
            borderTopColor: color || theme.primary,
          },
        ]}
      />
    </Animated.View>
  );
}

// Pulse Loading Dots
export function LoadingDots({ color }: { color?: string }) {
  const { theme } = useTheme();
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      );
    };

    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 150),
      animateDot(dot3, 300),
    ];

    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  const dotColor = color || theme.primary;

  return (
    <View style={styles.dotsContainer}>
      {[dot1, dot2, dot3].map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: dotColor,
              opacity: dot,
              transform: [{ scale: dot }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// Progress Circle
interface ProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  showPercentage?: boolean;
}

export function ProgressCircle({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  showPercentage = true,
}: ProgressCircleProps) {
  const { theme, tokens } = useTheme();
  const animatedProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedProgress, {
      toValue: progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const progressColor = color || theme.primary;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={[styles.progressCircleContainer, { width: size, height: size }]}>
      {/* Background circle */}
      <View
        style={[
          styles.progressCircleBg,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: theme.muted,
          },
        ]}
      />
      {/* Progress indicator - simplified for RN */}
      <View
        style={[
          styles.progressCircleProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progressColor,
            borderRightColor: 'transparent',
            borderBottomColor: progress > 50 ? progressColor : 'transparent',
            transform: [{ rotate: `${(progress / 100) * 360 - 90}deg` }],
          },
        ]}
      />
      {showPercentage && (
        <View style={styles.progressCircleText}>
          <Text style={[styles.progressPercentage, { color: theme.foreground }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      )}
    </View>
  );
}

// Combined Animated Feedback Component
export function AnimatedFeedback({ type, title, message, size = 'md' }: AnimatedFeedbackProps) {
  const { theme } = useTheme();

  const renderAnimation = () => {
    switch (type) {
      case 'success':
        return <SuccessAnimation size={size} />;
      case 'error':
        return <ErrorAnimation size={size} />;
      case 'loading':
        return <LoadingSpinner size={size} />;
      default:
        return <LoadingSpinner size={size} />;
    }
  };

  return (
    <View style={styles.animatedFeedbackContainer}>
      {renderAnimation()}
      {title && (
        <Text style={[styles.feedbackTitle, { color: theme.foreground }]}>{title}</Text>
      )}
      {message && (
        <Text style={[styles.feedbackMessage, { color: theme.mutedForeground }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  feedbackContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  progressCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircleBg: {
    position: 'absolute',
  },
  progressCircleProgress: {
    position: 'absolute',
  },
  progressCircleText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  animatedFeedbackContainer: {
    alignItems: 'center',
    padding: 24,
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  feedbackMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
});
