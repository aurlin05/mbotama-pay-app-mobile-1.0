import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { TransactionSkeleton } from '../ui/Skeleton';
import { useTheme } from '../../hooks/useTheme';
import type { TransactionResponse } from '../../types/api';

interface RecentTransactionsProps {
  transactions: TransactionResponse[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const statusLabels: Record<string, string> = {
  COMPLETED: 'Réussi',
  SUCCESS: 'Réussi',
  PENDING: 'En cours',
  PROCESSING: 'En cours',
  FAILED: 'Échoué',
  CANCELLED: 'Annulé',
};

const statusMap: Record<string, 'success' | 'pending' | 'failed'> = {
  COMPLETED: 'success',
  SUCCESS: 'success',
  PENDING: 'pending',
  PROCESSING: 'pending',
  FAILED: 'failed',
  CANCELLED: 'failed',
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  
  if (diffDays === 0) return `Aujourd'hui, ${timeStr}`;
  if (diffDays === 1) return `Hier, ${timeStr}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

interface TransactionItemProps {
  tx: TransactionResponse;
  isLast: boolean;
}

function TransactionItem({ tx, isLast }: TransactionItemProps) {
  const { theme, tokens } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const txType = tx.type === 'OUTGOING' || tx.type === 'TRANSFER' ? 'outgoing' : 'incoming';
  const status = statusMap[tx.status] || 'pending';

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    // Navigate to transaction details
  };

  const iconGradient = txType === 'outgoing' 
    ? ['#3366FF', '#1E40AF'] 
    : ['#22C55E', '#16A34A'];

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.transactionItem,
          !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border + '40' },
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <LinearGradient
          colors={iconGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.txIcon}
        >
          <Ionicons
            name={txType === 'outgoing' ? 'arrow-up' : 'arrow-down'}
            size={18}
            color="#FFFFFF"
          />
        </LinearGradient>

        <View style={styles.txInfo}>
          <View style={styles.txHeader}>
            <Text style={[styles.txName, { color: theme.foreground }]} numberOfLines={1}>
              {tx.recipientName || tx.operatorName || 'Transfert'}
            </Text>
            <Text
              style={[
                styles.txAmount,
                { color: txType === 'outgoing' ? theme.foreground : theme.success },
              ]}
            >
              {txType === 'outgoing' ? '-' : '+'}
              {formatAmount(tx.amount)}
            </Text>
          </View>
          <View style={styles.txFooter}>
            <Text style={[styles.txDate, { color: theme.mutedForeground }]}>
              {formatDate(tx.createdAt)}
            </Text>
            <StatusBadge
              status={status}
              label={statusLabels[tx.status] || tx.status}
              size="sm"
            />
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

export function RecentTransactions({
  transactions,
  loading = false,
  error = null,
  onRetry,
}: RecentTransactionsProps) {
  const { theme, tokens } = useTheme();
  const recentTransactions = transactions.slice(0, 5);

  const renderContent = () => {
    if (loading && transactions.length === 0) {
      return (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3].map((i) => (
            <TransactionSkeleton key={i} />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          variant="error"
          title="Erreur de chargement"
          description={error}
          actionLabel="Réessayer"
          onAction={onRetry}
        />
      );
    }

    if (recentTransactions.length === 0) {
      return (
        <EmptyState
          variant="transactions"
          title="Aucune transaction"
          description="Vos transactions apparaîtront ici"
        />
      );
    }

    return (
      <View>
        {recentTransactions.map((tx, index) => (
          <TransactionItem
            key={tx.id}
            tx={tx}
            isLast={index === recentTransactions.length - 1}
          />
        ))}
      </View>
    );
  };

  return (
    <Card padding="none" animated>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: theme.primaryLighter }]}>
            <Ionicons name="receipt" size={16} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.foreground }]}>
            Transactions récentes
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/history')}
          style={({ pressed }) => [
            styles.seeAllButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={[styles.seeAllText, { color: theme.primary }]}>Tout voir</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.primary} />
        </Pressable>
      </View>
      {renderContent()}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  txName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  txFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txDate: {
    fontSize: 12,
  },
});
