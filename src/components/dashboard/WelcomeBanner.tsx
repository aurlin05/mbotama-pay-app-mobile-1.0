import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

interface WelcomeBannerProps {
  userName: string;
  balance?: number;
  showBalance?: boolean;
}

export function WelcomeBanner({ userName, balance, showBalance = false }: WelcomeBannerProps) {
  const { tokens } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
        },
      ]}
    >
      <LinearGradient
        colors={['#3366FF', '#1E40AF', '#2563EB']}
        style={[styles.gradient, { borderRadius: tokens.borderRadius['2xl'] }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        {/* Sparkle decorations */}
        <View style={[styles.sparkle, styles.sparkle1]}>
          <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={[styles.sparkle, styles.sparkle2]}>
          <Ionicons name="sparkles" size={12} color="rgba(255,255,255,0.2)" />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.textContainer}>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.name} numberOfLines={1}>{userName}</Text>
            </View>
            
            {/* Notification Bell */}
            <Pressable style={styles.notificationBtn}>
              <BlurView intensity={30} tint="light" style={styles.notificationBlur}>
                <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
              </BlurView>
            </Pressable>
          </View>

          {showBalance && balance !== undefined && (
            <View style={styles.balanceContainer}>
              <Text style={styles.balanceLabel}>Solde disponible</Text>
              <Text style={styles.balanceAmount}>{formatBalance(balance)} FCFA</Text>
            </View>
          )}

          <View style={styles.tagline}>
            <View style={styles.taglineBadge}>
              <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.9)" />
              <Text style={styles.taglineText}>Envois rapides et sécurisés</Text>
            </View>
          </View>

          {/* Quick Action Button */}
          <Pressable 
            style={styles.quickActionBtn}
            onPress={() => router.push('/(tabs)/transfer')}
          >
            <BlurView intensity={40} tint="light" style={styles.quickActionBlur}>
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.quickActionText}>Envoyer de l'argent</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </BlurView>
          </Pressable>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  gradient: {
    overflow: 'hidden',
    minHeight: 200,
  },
  decorCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -80,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -40,
    left: -30,
  },
  decorCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: 60,
    right: 40,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 30,
    right: 100,
  },
  sparkle2: {
    bottom: 50,
    right: 30,
  },
  content: {
    padding: 24,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
    marginBottom: 2,
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  notificationBtn: {
    marginLeft: 12,
  },
  notificationBlur: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  balanceContainer: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 16,
  },
  taglineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  taglineText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  quickActionBtn: {
    marginTop: 16,
  },
  quickActionBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    gap: 10,
  },
  quickActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
});
