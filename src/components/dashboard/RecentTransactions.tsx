import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
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
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.destructive }]}>{error}</Text>
          {onRetry && (
            <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
              <Text style={[styles.retryText, { color: theme.primary }]}>Réessayer</Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    if (recentTransactions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIcon, { backgroundColor: theme.muted }]}>
            <Ionicons name="receipt-outline" size={24} color={theme.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: theme.mutedForeground }]}>
            Aucune transaction récente
          </Text>
          <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
            Vos transactions apparaîtront ici
          </Text>
        </View>
      );
    }

    return (
      <View>
        {recentTransactions.map((tx, index) => {
          const txType = tx.type === 'OUTGOING' || tx.type === 'TRANSFER' ? 'outgoing' : 'incoming';
          const status = statusMap[tx.status] || 'pending';
          const isLast = index === recentTransactions.length - 1;

          return (
            <TouchableOpacity
              key={tx.id}
              style={[
                styles.transactionItem,
                !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border + '50' },
              ]}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.txIcon,
                  {
                    backgroundColor: txType === 'outgoing'
                      ? theme.secondary
                      : theme.successLight,
                  },
                ]}
              >
                <Ionicons
                  name={txType === 'outgoing' ? 'arrow-up' : 'arrow-down'}
                  size={20}
                  color={txType === 'outgoing' ? theme.primary : theme.success}
                />
              </View>

              <View style={styles.txInfo}>
                <View style={styles.txHeader}>
                  <Text style={[styles.txName, { color: theme.foreground }]} numberOfLines={1}>
                    {tx.operatorName || tx.operatorCode || 'Transfert'}
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
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Card padding="none">
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.foreground }]}>
          Transactions récentes
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/history')}
          style={styles.seeAllButton}
        >
          <Text style={[styles.seeAllText, { color: theme.primary }]}>Tout voir</Text>
          <Ionicons name="arrow-forward" size={14} color={theme.primary} />
        </TouchableOpacity>
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '500',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: 'center',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  txIcon: {
    width: 44,
    height: 44,
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
    fontWeight: '500',
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
