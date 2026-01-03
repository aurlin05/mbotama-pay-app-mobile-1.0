import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { transferService } from '../../src/services/transfer';
import { useTheme } from '../../src/hooks/useTheme';
import { WelcomeBanner } from '../../src/components/dashboard/WelcomeBanner';
import { KYCStatusCard } from '../../src/components/dashboard/KYCStatusCard';
import { QuickActions } from '../../src/components/dashboard/QuickActions';
import { RecentTransactions } from '../../src/components/dashboard/RecentTransactions';
import type { TransactionResponse } from '../../src/types/api';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, kycStatus, fetchUserData } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    try {
      setTxError(null);
      const response = await transferService.getTransactions(0, 5);
      if (response.success && response.data) {
        setTransactions(response.data.content);
      }
    } catch (error) {
      setTxError('Impossible de charger les transactions');
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), loadTransactions()]);
    setRefreshing(false);
  };

  // Determine user name
  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : user?.phoneNumber || 'Utilisateur';

  // Map KYC status
  const getKycStatus = () => {
    switch (kycStatus?.status) {
      case 'LEVEL_1':
        return 'pending';
      case 'LEVEL_2':
        return 'verified';
      case 'PENDING':
        return 'pending';
      case 'REJECTED':
        return 'rejected';
      default:
        return 'not_started';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      >
        {/* Welcome Banner */}
        <WelcomeBanner userName={userName} />

        {/* KYC Status Card */}
        <View style={styles.section}>
          <KYCStatusCard status={getKycStatus()} progress={25} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.mutedForeground }]}>
            Actions rapides
          </Text>
          <QuickActions />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <RecentTransactions
            transactions={transactions}
            loading={txLoading}
            error={txError}
            onRetry={loadTransactions}
          />
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={[styles.disclaimerText, { color: theme.mutedForeground }]}>
            MBOTAMAPAY est une plateforme d'orchestration technologique.
            Les paiements sont exécutés par nos partenaires agréés.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  disclaimer: {
    marginTop: 24,
    paddingHorizontal: 8,
  },
  disclaimerText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
});
