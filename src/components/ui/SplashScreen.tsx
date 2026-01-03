import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';
import { LinearGradient } from 'expo-linear-gradient';

interface SplashScreenProps {
  onComplete: () => void;
  minDuration?: number;
}

const { width, height } = Dimensions.get('window');

export function SplashScreen({ onComplete, minDuration = 2500 }: SplashScreenProps) {
  const { tokens } = useTheme();
  const [progress, setProgress] = useState(0);
  
  // Animations
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Text animation with delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Floating circles animation
    const floatAnimation = (animValue: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 2000,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    floatAnimation(circle1, 0);
    floatAnimation(circle2, 400);
    floatAnimation(circle3, 800);

    // Progress bar
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, minDuration / 50);

    const timer = setTimeout(onComplete, minDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete, minDuration]);

  const circle1TranslateY = circle1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const circle2TranslateY = circle2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const circle3TranslateY = circle3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3366FF', '#1E40AF', '#1E3A8A']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Animated background circles */}
        <Animated.View
          style={[
            styles.circle,
            styles.circle1,
            { transform: [{ translateY: circle1TranslateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle2,
            { transform: [{ translateY: circle2TranslateY }] },
          ]}
        />
        <Animated.View
          style={[
            styles.circle,
            styles.circle3,
            { transform: [{ translateY: circle3TranslateY }] },
          ]}
        />

        <View style={styles.content}>
          {/* Logo with pulse animation */}
          <View style={styles.logoContainer}>
            <View style={styles.logoPulse} />
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [{ scale: logoScale }],
                  opacity: logoOpacity,
                },
              ]}
            >
              <Ionicons name="shield-checkmark" size={56} color="#3366FF" />
            </Animated.View>
          </View>

          {/* Brand name */}
          <Animated.View
            style={{
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            }}
          >
            <Text style={styles.title}>MBOTAMAPAY</Text>
            <Text style={styles.subtitle}>Envois simplifiés</Text>
          </Animated.View>

          {/* Progress bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle1: {
    width: 256,
    height: 256,
    top: -80,
    left: -80,
  },
  circle2: {
    width: 192,
    height: 192,
    top: height * 0.25,
    right: -40,
  },
  circle3: {
    width: 128,
    height: 128,
    bottom: 80,
    left: 40,
  },
  content: {
    alignItems: 'center',
    zIndex: 10,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  logoPulse: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    top: -12,
    left: -12,
  },
  logoWrapper: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 8,
  },
  progressContainer: {
    marginTop: 48,
    alignItems: 'center',
  },
  progressBar: {
    width: 192,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 16,
  },
});
