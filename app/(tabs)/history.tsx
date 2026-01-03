import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { transferService } from '../../src/services/transfer';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { StatusBadge } from '../../src/components/ui/StatusBadge';
import type { TransactionResponse } from '../../src/types/api';

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

export default function HistoryScreen() {
  const { theme, tokens } = useTheme();
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const loadTransactions = useCallback(async (pageNum = 0, refresh = false) => {
    try {
      const response = await transferService.getTransactions(pageNum, 20);
      if (response.success && response.data) {
        const newTransactions = response.data.content;
        if (refresh) {
          setTransactions(newTransactions);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }
        setHasMore(newTransactions.length === 20);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions(0, true);
  }, [loadTransactions]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(0);
    loadTransactions(0, true);
  };

  const onEndReached = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTransactions(nextPage);
    }
  };

  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (diffDays === 0) return `Aujourd'hui, ${timeStr}`;
    if (diffDays === 1) return `Hier, ${timeStr}`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
  };

  const renderTransaction = ({ item, index }: { item: TransactionResponse; index: number }) => {
    const txType = item.type === 'OUTGOING' || item.type === 'TRANSFER' ? 'outgoing' : 'incoming';
    const status = statusMap[item.status] || 'pending';

    return (
      <TouchableOpacity activeOpacity={0.7}>
        <Card style={styles.transactionCard}>
          <View style={styles.transactionContent}>
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: txType === 'outgoing' ? theme.secondary : theme.successLight,
                },
              ]}
            >
              <Ionicons
                name={txType === 'outgoing' ? 'arrow-up' : 'arrow-down'}
                size={20}
                color={txType === 'outgoing' ? theme.primary : theme.success}
              />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={[styles.recipientName, { color: theme.foreground }]} numberOfLines={1}>
                {item.recipientName || `Transaction #${item.id}`}
              </Text>
              <Text style={[styles.transactionDate, { color: theme.mutedForeground }]}>
                {formatDate(item.createdAt)}
              </Text>
            </View>
            <View style={styles.transactionRight}>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: txType === 'outgoing' ? theme.foreground : theme.success },
                ]}
              >
                {txType === 'outgoing' ? '-' : '+'}
                {formatAmount(item.amount)}
              </Text>
              <StatusBadge
                status={status}
                label={statusLabels[item.status] || item.status}
                size="sm"
              />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.muted }]}>
        <Ionicons name="receipt-outline" size={48} color={theme.mutedForeground} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Aucune transaction</Text>
      <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
        Vos transactions apparaîtront ici
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.foreground }]}>Historique</Text>
      <Text style={[styles.headerSubtitle, { color: theme.mutedForeground }]}>
        Toutes vos transactions
      </Text>
    </View>
  );

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={
          hasMore && transactions.length > 0 ? (
            <ActivityIndicator style={styles.footer} color={theme.primary} />
          ) : null
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  transactionCard: {
    padding: 16,
  },
  transactionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 20,
  },
});
