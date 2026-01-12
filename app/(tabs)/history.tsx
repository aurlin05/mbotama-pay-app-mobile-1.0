import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator, StatusBar, Modal, Pressable } from 'react-native';
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
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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

  const formatFullDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openTransactionDetail = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedTransaction(null);
  };

  const renderTransaction = ({ item, index }: { item: TransactionResponse; index: number }) => {
    const txType = item.type === 'OUTGOING' || item.type === 'TRANSFER' ? 'outgoing' : 'incoming';
    const status = statusMap[item.status] || 'pending';

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => openTransactionDetail(item)}>
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

  const renderTransactionDetailModal = () => {
    if (!selectedTransaction) return null;
    
    const txType = selectedTransaction.type === 'OUTGOING' || selectedTransaction.type === 'TRANSFER' ? 'outgoing' : 'incoming';
    const status = statusMap[selectedTransaction.status] || 'pending';

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.background }]} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>Détails de la transaction</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Icon et montant */}
            <View style={styles.modalAmountSection}>
              <View
                style={[
                  styles.modalIconContainer,
                  { backgroundColor: txType === 'outgoing' ? theme.secondary : theme.successLight },
                ]}
              >
                <Ionicons
                  name={txType === 'outgoing' ? 'arrow-up' : 'arrow-down'}
                  size={32}
                  color={txType === 'outgoing' ? theme.primary : theme.success}
                />
              </View>
              <Text
                style={[
                  styles.modalAmount,
                  { color: txType === 'outgoing' ? theme.foreground : theme.success },
                ]}
              >
                {txType === 'outgoing' ? '-' : '+'}{formatAmount(selectedTransaction.amount)}
              </Text>
              <StatusBadge
                status={status}
                label={statusLabels[selectedTransaction.status] || selectedTransaction.status}
                size="md"
              />
            </View>

            {/* Détails */}
            <View style={[styles.modalDetailsSection, { borderTopColor: theme.border }]}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Bénéficiaire</Text>
                <Text style={[styles.detailValue, { color: theme.foreground }]}>
                  {selectedTransaction.recipientName || '-'}
                </Text>
              </View>

              {selectedTransaction.recipientPhone && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Numéro</Text>
                  <Text style={[styles.detailValue, { color: theme.foreground }]}>
                    {selectedTransaction.recipientPhone}
                  </Text>
                </View>
              )}

              {selectedTransaction.operatorName && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Opérateur</Text>
                  <Text style={[styles.detailValue, { color: theme.foreground }]}>
                    {selectedTransaction.operatorName}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Date</Text>
                <Text style={[styles.detailValue, { color: theme.foreground }]}>
                  {formatFullDate(selectedTransaction.createdAt)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>ID Transaction</Text>
                <Text style={[styles.detailValue, { color: theme.foreground }]}>
                  #{selectedTransaction.id}
                </Text>
              </View>

              {selectedTransaction.currency && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, { color: theme.mutedForeground }]}>Devise</Text>
                  <Text style={[styles.detailValue, { color: theme.foreground }]}>
                    {selectedTransaction.currency}
                  </Text>
                </View>
              )}
            </View>

            {/* Bouton fermer */}
            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.primary }]}
              onPress={closeModal}
            >
              <Text style={styles.modalCloseButtonText}>Fermer</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
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
      {renderTransactionDetailModal()}
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  modalAmountSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalAmount: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalDetailsSection: {
    borderTopWidth: 1,
    paddingTop: 20,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  modalCloseButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
