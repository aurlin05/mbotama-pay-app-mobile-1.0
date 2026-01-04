import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface TransferSuccessProps {
  amount: number;
  recipientName: string;
  transactionId: number;
  onNewTransfer: () => void;
}

export function TransferSuccess({
  amount,
  recipientName,
  transactionId,
  onNewTransfer,
}: TransferSuccessProps) {
  const { theme, tokens } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Trigger success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Animate success
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(checkAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const formatAmount = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `J'ai envoyé ${formatAmount(amount)} à ${recipientName} via MBOTAMAPAY. Référence: #${transactionId}`,
      });
    } catch {}
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Confetti decoration */}
      <Animated.View
        style={[
          styles.confettiContainer,
          {
            opacity: confettiAnim,
            transform: [
              {
                translateY: confettiAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        {[...Array(6)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.confetti,
              {
                backgroundColor: [theme.primary, theme.success, theme.accentOrange, theme.accentPurple][i % 4],
                left: `${15 + i * 15}%`,
                transform: [{ rotate: `${i * 30}deg` }],
              },
            ]}
          />
        ))}
      </Animated.View>

      {/* Success Icon */}
      <Animated.View
        style={[
          styles.iconWrapper,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={['#22C55E', '#16A34A']}
          style={styles.iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={{
              opacity: checkAnim,
              transform: [
                {
                  scale: checkAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ],
            }}
          >
            <Ionicons name="checkmark" size={56} color="#FFFFFF" />
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Success Text */}
      <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
        <Text style={[styles.title, { color: theme.foreground }]}>Transfert réussi !</Text>
        <Text style={[styles.amount, { color: theme.success }]}>{formatAmount(amount)}</Text>
        <Text style={[styles.recipient, { color: theme.mutedForeground }]}>
          envoyés à {recipientName}
        </Text>
      </Animated.View>

      {/* Transaction Details Card */}
      <Animated.View style={[styles.cardContainer, { opacity: fadeAnim }]}>
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="receipt-outline" size={20} color={theme.mutedForeground} />
              <View>
                <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Référence</Text>
                <Text style={[styles.detailValue, { color: theme.foreground }]}>#{transactionId}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={20} color={theme.mutedForeground} />
              <View>
                <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Date</Text>
                <Text style={[styles.detailValue, { color: theme.foreground }]}>
                  {new Date().toLocaleDateString('fr-FR')}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </Animated.View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <Button
          variant="outline"
          onPress={handleShare}
          icon={<Ionicons name="share-outline" size={20} color={theme.primary} />}
          style={styles.shareButton}
        >
          Partager
        </Button>
        <Button
          variant="gradient"
          onPress={onNewTransfer}
          icon={<Ionicons name="add" size={20} color="#FFFFFF" />}
        >
          Nouveau transfert
        </Button>
      </Animated.View>

      {/* Legal disclaimer */}
      <Animated.View style={[styles.disclaimer, { opacity: fadeAnim }]}>
        <Ionicons name="shield-checkmark" size={14} color={theme.mutedForeground} />
        <Text style={[styles.disclaimerText, { color: theme.mutedForeground }]}>
          Transaction sécurisée par nos partenaires agréés
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confettiContainer: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    height: 100,
  },
  confetti: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  iconWrapper: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  recipient: {
    fontSize: 16,
  },
  cardContainer: {
    width: '100%',
    marginBottom: 32,
  },
  detailsCard: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  shareButton: {
    marginBottom: 4,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 32,
  },
  disclaimerText: {
    fontSize: 12,
  },
});
