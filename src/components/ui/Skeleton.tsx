import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../hooks/useTheme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const { theme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: theme.muted,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          { transform: [{ translateX }] },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

// Transaction Skeleton
export function TransactionSkeleton() {
  const { tokens } = useTheme();
  return (
    <View style={styles.transactionSkeleton}>
      <Skeleton width={44} height={44} borderRadius={14} />
      <View style={styles.transactionInfo}>
        <Skeleton width="60%" height={16} borderRadius={6} />
        <Skeleton width="40%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <View style={styles.transactionRight}>
        <Skeleton width={80} height={16} borderRadius={6} />
        <Skeleton width={50} height={20} borderRadius={10} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

// Card Skeleton
export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  const { theme, tokens } = useTheme();
  return (
    <View style={[styles.cardSkeleton, { backgroundColor: theme.surface, borderRadius: tokens.borderRadius.xl }]}>
      <Skeleton width="70%" height={20} borderRadius={8} />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '50%' : '100%'}
          height={14}
          borderRadius={6}
          style={{ marginTop: 12 }}
        />
      ))}
    </View>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  const { theme, tokens } = useTheme();
  return (
    <View style={[styles.profileSkeleton, { backgroundColor: theme.surface, borderRadius: tokens.borderRadius.xl }]}>
      <Skeleton width={80} height={80} borderRadius={24} />
      <Skeleton width={150} height={20} borderRadius={8} style={{ marginTop: 16 }} />
      <Skeleton width={120} height={14} borderRadius={6} style={{ marginTop: 8 }} />
      <Skeleton width={80} height={24} borderRadius={12} style={{ marginTop: 12 }} />
    </View>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <View style={styles.dashboardSkeleton}>
      {/* Welcome Banner */}
      <Skeleton width="100%" height={140} borderRadius={18} />
      
      {/* KYC Card */}
      <View style={{ marginTop: 20 }}>
        <CardSkeleton lines={2} />
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActionsSkeleton}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width={75} height={80} borderRadius={14} />
        ))}
      </View>
      
      {/* Transactions */}
      <View style={{ marginTop: 20 }}>
        <Skeleton width={150} height={18} borderRadius={6} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map((i) => (
          <TransactionSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    flex: 1,
    width: 200,
  },
  transactionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  cardSkeleton: {
    padding: 20,
  },
  profileSkeleton: {
    alignItems: 'center',
    padding: 24,
  },
  dashboardSkeleton: {
    padding: 16,
  },
  quickActionsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
