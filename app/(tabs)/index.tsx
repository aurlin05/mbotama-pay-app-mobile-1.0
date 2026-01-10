import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/store/authStore';
import { transferService } from '../../src/services/transfer';
import { userService } from '../../src/services/user';
import { useTheme } from '../../src/hooks/useTheme';
import type { TransactionResponse, UserLimitsResponse } from '../../src/types/api';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function HomeScreen() {
  const { theme, tokens } = useTheme();
  const { user, kycStatus, fetchUserData } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [limits, setLimits] = useState<UserLimitsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    // Exemples de notifications - à remplacer par des vraies données
    { id: '1', type: 'success', title: 'Transfert réussi', message: 'Votre transfert de 25 000 FCFA a été effectué', time: 'Il y a 2h', read: false },
    { id: '2', type: 'info', title: 'Bienvenue !', message: 'Complétez votre profil pour profiter de toutes les fonctionnalités', time: 'Hier', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadData = useCallback(async () => {
    try {
      const [txRes, limitsRes] = await Promise.all([
        transferService.getTransactions(0, 5),
        userService.getLimits(),
      ]);
      if (txRes.success && txRes.data) setTransactions(txRes.data.content);
      if (limitsRes.success && limitsRes.data) setLimits(limitsRes.data);
    } catch {
      // Silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), loadData()]);
    setRefreshing(false);
  };

  const handleSendMoney = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    router.push('/(tabs)/transfer');
  };

  const userName = user?.firstName || 'Utilisateur';
  const needsKyc = !kycStatus || kycStatus.status === 'NONE';
  const kycPending = kycStatus?.status === 'PENDING';
  const formatAmount = (n: number) => new Intl.NumberFormat('fr-FR').format(n);

  const handleOpenNotifs = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setShowNotifs(true);
    // Marquer comme lues
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.surface }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />
      {/* Header bar avec fond distinct */}
      <View style={[styles.headerBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.greetingSmall, { color: theme.mutedForeground }]}>Bonjour,</Text>
            <Text style={[styles.userName, { color: theme.foreground }]}>{userName} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable 
              style={[styles.notifBtn, { backgroundColor: theme.muted }]}
              onPress={handleOpenNotifs}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.foreground} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </Pressable>
            <Pressable 
              style={[styles.avatarBtn, { backgroundColor: theme.primaryLighter }]}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Modal Notifications */}
      <Modal
        visible={showNotifs}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifs(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.foreground }]}>Notifications</Text>
            <Pressable onPress={() => setShowNotifs(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.foreground} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.notifList}>
            {notifications.length === 0 ? (
              <View style={styles.notifEmpty}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.mutedForeground} />
                <Text style={[styles.notifEmptyText, { color: theme.mutedForeground }]}>
                  Aucune notification
                </Text>
              </View>
            ) : (
              notifications.map((notif) => (
                <NotificationItem 
                  key={notif.id} 
                  notif={notif} 
                  theme={theme} 
                  onDismiss={() => clearNotification(notif.id)}
                />
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: theme.background }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Carte limite avec gradient subtil */}
        {limits && !needsKyc && (
          <View style={[styles.limitCard, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, ...tokens.shadows.sm }]}>
            <View style={styles.limitHeader}>
              <View style={[styles.limitIconWrap, { backgroundColor: theme.primaryLighter }]}>
                <Ionicons name="wallet-outline" size={18} color={theme.primary} />
              </View>
              <Text style={[styles.limitLabel, { color: theme.mutedForeground }]}>
                Disponible aujourd'hui
              </Text>
            </View>
            <Text style={[styles.limitAmount, { color: theme.foreground }]}>
              {formatAmount(limits.dailyLimits.remaining)}
              <Text style={[styles.currency, { color: theme.mutedForeground }]}> FCFA</Text>
            </Text>
            <View style={[styles.progressBar, { backgroundColor: theme.muted }]}>
              <LinearGradient
                colors={['#3366FF', '#1E40AF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${Math.min(limits.dailyLimits.percentageUsed, 100)}%` }]}
              />
            </View>
            <Text style={[styles.limitUsed, { color: theme.mutedForeground }]}>
              {formatAmount(limits.dailyLimits.used)} utilisés sur {formatAmount(limits.dailyLimits.limit)}
            </Text>
          </View>
        )}

        {/* Alerte KYC */}
        {needsKyc && (
          <Pressable 
            style={[styles.kycAlert, { backgroundColor: '#FEF3C7' }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.kycAlertIcon}>
              <Ionicons name="shield-checkmark" size={20} color="#D97706" />
            </View>
            <View style={styles.kycAlertContent}>
              <Text style={styles.kycAlertTitle}>Vérification requise</Text>
              <Text style={styles.kycAlertDesc}>Validez votre identité pour envoyer de l'argent</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D97706" />
          </Pressable>
        )}

        {kycPending && (
          <View style={[styles.kycAlert, { backgroundColor: theme.infoLight }]}>
            <View style={[styles.kycAlertIcon, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="time" size={20} color={theme.info} />
            </View>
            <View style={styles.kycAlertContent}>
              <Text style={[styles.kycAlertTitle, { color: theme.info }]}>Vérification en cours</Text>
              <Text style={[styles.kycAlertDesc, { color: theme.info }]}>Nous examinons vos documents</Text>
            </View>
          </View>
        )}

        {/* CTA Envoyer avec gradient */}
        <Pressable
          onPress={handleSendMoney}
          disabled={needsKyc}
          style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.9 : 1 }]}
        >
          <LinearGradient
            colors={needsKyc ? ['#9CA3AF', '#6B7280'] : ['#3366FF', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendBtnGradient}
          >
            <View style={styles.sendBtnIcon}>
              <Ionicons name="paper-plane" size={20} color="#FFF" />
            </View>
            <Text style={styles.sendBtnText}>Envoyer de l'argent</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </Pressable>

        {/* Transactions récentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Activité récente</Text>
            {transactions.length > 0 && (
              <Pressable 
                style={styles.seeAllBtn}
                onPress={() => router.push('/(tabs)/history')}
              >
                <Text style={[styles.seeAllText, { color: theme.primary }]}>Tout voir</Text>
              </Pressable>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.skeleton, { backgroundColor: theme.muted }]} />
              ))}
            </View>
          ) : transactions.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, ...tokens.shadows.xs }]}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.muted }]}>
                <Ionicons name="receipt-outline" size={28} color={theme.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Aucune transaction</Text>
              <Text style={[styles.emptyDesc, { color: theme.mutedForeground }]}>
                Vos transferts apparaîtront ici
              </Text>
            </View>
          ) : (
            <View style={[styles.txList, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, ...tokens.shadows.xs }]}>
              {transactions.slice(0, 4).map((tx, i) => (
                <TxItem key={tx.id} tx={tx} theme={theme} isLast={i === Math.min(transactions.length - 1, 3)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TxItem({ tx, theme, isLast }: { tx: TransactionResponse; theme: any; isLast: boolean }) {
  const isOut = tx.type === 'OUTGOING' || tx.type === 'TRANSFER';
  const statusConfig = {
    success: { color: theme.success, bg: theme.successLight, label: 'Réussi' },
    pending: { color: theme.warning, bg: theme.warningLight, label: 'En cours' },
    failed: { color: theme.destructive, bg: theme.destructiveLight, label: 'Échoué' },
  };
  const status = 
    tx.status === 'COMPLETED' || tx.status === 'SUCCESS' ? 'success' :
    tx.status === 'PENDING' || tx.status === 'PROCESSING' ? 'pending' : 'failed';
  const config = statusConfig[status];

  const formatDate = (d?: string) => {
    if (!d) return '';
    const date = new Date(d);
    const diff = Math.floor((Date.now() - date.getTime()) / 86400000);
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <Pressable style={[styles.txItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border + '50' }]}>
      <View style={[styles.txIcon, { backgroundColor: isOut ? theme.primaryLighter : theme.successLight }]}>
        <Ionicons name={isOut ? 'arrow-up' : 'arrow-down'} size={16} color={isOut ? theme.primary : theme.success} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txName, { color: theme.foreground }]} numberOfLines={1}>
          {tx.recipientName || 'Transfert'}
        </Text>
        <Text style={[styles.txDate, { color: theme.mutedForeground }]}>{formatDate(tx.createdAt)}</Text>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: theme.foreground }]}>
          {isOut ? '-' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.amount)} F
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: config.color }]} />
          <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function NotificationItem({ notif, theme, onDismiss }: { notif: Notification; theme: any; onDismiss: () => void }) {
  const iconConfig = {
    success: { icon: 'checkmark-circle' as const, color: theme.success, bg: theme.successLight },
    info: { icon: 'information-circle' as const, color: theme.info, bg: theme.infoLight },
    warning: { icon: 'warning' as const, color: theme.warning, bg: theme.warningLight },
  };
  const config = iconConfig[notif.type];

  return (
    <View style={[styles.notifItem, { backgroundColor: theme.surface }]}>
      <View style={[styles.notifIconWrap, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <View style={styles.notifContent}>
        <Text style={[styles.notifTitle, { color: theme.foreground }]}>{notif.title}</Text>
        <Text style={[styles.notifMessage, { color: theme.mutedForeground }]} numberOfLines={2}>
          {notif.message}
        </Text>
        <Text style={[styles.notifTime, { color: theme.mutedForeground }]}>{notif.time}</Text>
      </View>
      <Pressable onPress={onDismiss} style={styles.notifDismiss}>
        <Ionicons name="close" size={18} color={theme.mutedForeground} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  // Header Bar (fixe en haut)
  headerBar: { 
    paddingHorizontal: 20, 
    paddingTop: 8, 
    paddingBottom: 16, 
    borderBottomWidth: 1,
  },
  headerContent: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
  },
  
  // Header (ancien, gardé pour compatibilité)
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greetingSmall: { fontSize: 14 },
  userName: { fontSize: 24, fontWeight: '700', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  notifBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  notifBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  avatarBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(51,102,255,0.2)' },
  avatarText: { fontSize: 18, fontWeight: '700' },

  // Modal Notifications
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: { padding: 4 },
  notifList: { flex: 1, padding: 16 },
  notifEmpty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
  notifEmptyText: { fontSize: 15 },
  notifItem: { flexDirection: 'row', padding: 14, borderRadius: 14, marginBottom: 10, gap: 12 },
  notifIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  notifMessage: { fontSize: 13, lineHeight: 18 },
  notifTime: { fontSize: 11, marginTop: 4 },
  notifDismiss: { padding: 4 },

  // Limit Card
  limitCard: { padding: 18, borderRadius: 16, marginBottom: 16 },
  limitHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  limitIconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  limitLabel: { fontSize: 14 },
  limitAmount: { fontSize: 32, fontWeight: '700', marginBottom: 14 },
  currency: { fontSize: 16, fontWeight: '500' },
  progressBar: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  progressFill: { height: '100%', borderRadius: 3 },
  limitUsed: { fontSize: 13 },

  // KYC Alert
  kycAlert: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, marginBottom: 16, gap: 12 },
  kycAlertIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(217, 119, 6, 0.15)', alignItems: 'center', justifyContent: 'center' },
  kycAlertContent: { flex: 1 },
  kycAlertTitle: { fontSize: 14, fontWeight: '600', color: '#92400E' },
  kycAlertDesc: { fontSize: 12, color: '#B45309', marginTop: 2 },

  // Send Button
  sendBtn: { marginBottom: 28, borderRadius: 14, overflow: 'hidden' },
  sendBtnGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  sendBtnIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#FFF' },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '600' },
  seeAllBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  seeAllText: { fontSize: 14, fontWeight: '500' },

  // Loading & Empty
  loadingWrap: { gap: 10 },
  skeleton: { height: 68, borderRadius: 12 },
  empty: { padding: 32, borderRadius: 16, alignItems: 'center' },
  emptyIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  emptyDesc: { fontSize: 13 },

  // Transactions
  txList: { borderRadius: 16, overflow: 'hidden' },
  txItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txName: { fontSize: 15, fontWeight: '500' },
  txDate: { fontSize: 12, marginTop: 3 },
  txRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 15, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '500' },
});
