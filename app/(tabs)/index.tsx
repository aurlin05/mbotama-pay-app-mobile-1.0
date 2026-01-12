import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Pressable, Modal, StatusBar, Dimensions, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '../../src/store/authStore';
import { transferService } from '../../src/services/transfer';
import { useTheme } from '../../src/hooks/useTheme';
import type { TransactionResponse } from '../../src/types/api';

const { width } = Dimensions.get('window');

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
  const [loading, setLoading] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'success', title: 'Transfert réussi', message: 'Votre transfert de 25 000 FCFA a été effectué', time: 'Il y a 2h', read: false },
    { id: '2', type: 'info', title: 'Bienvenue !', message: 'Complétez votre profil pour profiter de toutes les fonctionnalités', time: 'Hier', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const loadData = useCallback(async () => {
    try {
      const txRes = await transferService.getTransactions(0, 5);
      if (txRes.success && txRes.data) setTransactions(txRes.data.content);
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

  const handleAction = async (action: string) => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch {}
    if (action === 'send') router.push('/(tabs)/transfer');
    else if (action === 'history') router.push('/(tabs)/history');
    else if (action === 'profile') router.push('/(tabs)/profile');
  };

  const userName = user?.firstName || 'Utilisateur';
  const needsKyc = !kycStatus || kycStatus.currentLevel === 'NONE';
  const kycPending = kycStatus?.pendingDocuments && kycStatus.pendingDocuments.length > 0;
  const kycApproved = kycStatus?.currentLevel === 'LEVEL_1' || kycStatus?.currentLevel === 'LEVEL_2';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const handleOpenNotifs = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    setShowNotifs(true);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />
      
      {/* Hero Header avec Gradient */}
      <LinearGradient
        colors={['#1E40AF', '#3366FF', '#60A5FA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroHeader}
      >
        <SafeAreaView edges={['top']} style={styles.heroSafeArea}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.greeting}>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.userName}>{userName} 👋</Text>
            </View>
            <View style={styles.topBarRight}>
              <Pressable style={styles.iconBtn} onPress={handleOpenNotifs}>
                <Ionicons name="notifications" size={22} color="#FFF" />
                {unreadCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadCount}</Text>
                  </View>
                )}
              </Pressable>
              <Pressable style={styles.avatarBtn} onPress={() => router.push('/(tabs)/profile')}>
                {user?.profilePictureUrl ? (
                  <Image 
                    source={{ uri: user.profilePictureUrl }} 
                    style={styles.avatarImage}
                  />
                ) : (
                  <LinearGradient
                    colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                  </LinearGradient>
                )}
              </Pressable>
            </View>
          </View>

          {/* Status Badge */}
          <View style={styles.statusContainer}>
            {kycApproved ? (
              <View style={styles.verifiedBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#10B981" />
                <Text style={styles.verifiedText}>Compte vérifié</Text>
              </View>
            ) : needsKyc ? (
              <Pressable style={styles.pendingBadge} onPress={() => router.push('/(tabs)/profile')}>
                <Ionicons name="warning" size={14} color="#F59E0B" />
                <Text style={styles.pendingText}>Vérification requise</Text>
                <Ionicons name="chevron-forward" size={14} color="#F59E0B" />
              </Pressable>
            ) : kycPending ? (
              <View style={styles.pendingBadge}>
                <Ionicons name="time" size={14} color="#60A5FA" />
                <Text style={[styles.pendingText, { color: '#60A5FA' }]}>En cours de vérification</Text>
              </View>
            ) : null}
          </View>
        </SafeAreaView>

        {/* Decorative circles */}
        <View style={[styles.decorCircle, styles.circle1]} />
        <View style={[styles.decorCircle, styles.circle2]} />
        <View style={[styles.decorCircle, styles.circle3]} />
      </LinearGradient>

      {/* Quick Actions Card - Floating */}
      <View style={styles.actionsCardContainer}>
        <View style={[styles.actionsCard, { backgroundColor: theme.surface, ...tokens.shadows.lg }]}>
          <Text style={[styles.actionsTitle, { color: theme.foreground }]}>Actions rapides</Text>
          <View style={styles.actionsGrid}>
            <Pressable 
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
              onPress={() => handleAction('send')}
              disabled={needsKyc}
            >
              <LinearGradient
                colors={needsKyc ? ['#9CA3AF', '#6B7280'] : ['#3366FF', '#1E40AF']}
                style={styles.actionIcon}
              >
                <Ionicons name="paper-plane" size={22} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: theme.foreground }]}>Envoyer</Text>
              <Text style={[styles.actionDesc, { color: theme.mutedForeground }]}>Transfert rapide</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
              onPress={() => handleAction('history')}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.actionIcon}
              >
                <Ionicons name="time" size={22} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: theme.foreground }]}>Historique</Text>
              <Text style={[styles.actionDesc, { color: theme.mutedForeground }]}>Transactions</Text>
            </Pressable>

            <Pressable 
              style={({ pressed }) => [styles.actionItem, pressed && styles.actionPressed]}
              onPress={() => handleAction('profile')}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionIcon}
              >
                <Ionicons name="person" size={22} color="#FFF" />
              </LinearGradient>
              <Text style={[styles.actionLabel, { color: theme.foreground }]}>Profil</Text>
              <Text style={[styles.actionDesc, { color: theme.mutedForeground }]}>Mon compte</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={[styles.scrollView, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >

        {/* Promo Banner */}
        <Pressable style={[styles.promoBanner, { backgroundColor: theme.surface, ...tokens.shadows.sm }]}>
          <LinearGradient
            colors={['#FEF3C7', '#FDE68A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <View style={styles.promoIcon}>
              <Text style={styles.promoEmoji}>🎉</Text>
            </View>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Parrainez vos amis</Text>
              <Text style={styles.promoDesc}>Gagnez des bonus sur chaque parrainage</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#92400E" />
          </LinearGradient>
        </Pressable>

        {/* Transactions récentes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <View style={[styles.sectionIcon, { backgroundColor: theme.primaryLighter }]}>
                <Ionicons name="swap-vertical" size={16} color={theme.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Activité récente</Text>
            </View>
            {transactions.length > 0 && (
              <Pressable style={styles.seeAllBtn} onPress={() => router.push('/(tabs)/history')}>
                <Text style={[styles.seeAllText, { color: theme.primary }]}>Tout voir</Text>
                <Ionicons name="arrow-forward" size={14} color={theme.primary} />
              </Pressable>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.skeleton, { backgroundColor: theme.muted }]}>
                  <View style={[styles.skeletonCircle, { backgroundColor: theme.border }]} />
                  <View style={styles.skeletonLines}>
                    <View style={[styles.skeletonLine, { backgroundColor: theme.border, width: '60%' }]} />
                    <View style={[styles.skeletonLine, { backgroundColor: theme.border, width: '40%' }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : transactions.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: theme.surface, ...tokens.shadows.sm }]}>
              <LinearGradient
                colors={[theme.primaryLighter, theme.muted]}
                style={styles.emptyIconWrap}
              >
                <Ionicons name="receipt-outline" size={32} color={theme.primary} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: theme.foreground }]}>Aucune transaction</Text>
              <Text style={[styles.emptyDesc, { color: theme.mutedForeground }]}>
                Vos transferts apparaîtront ici
              </Text>
              <Pressable 
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => handleAction('send')}
                disabled={needsKyc}
              >
                <Text style={styles.emptyBtnText}>Faire un transfert</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.txList, { backgroundColor: theme.surface, ...tokens.shadows.sm }]}>
              {transactions.slice(0, 4).map((tx, i) => (
                <TxItem key={tx.id} tx={tx} theme={theme} isLast={i === Math.min(transactions.length - 1, 3)} />
              ))}
            </View>
          )}
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleWrap}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="bulb" size={16} color="#F59E0B" />
              </View>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Conseils</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tipsScroll}>
            <View style={[styles.tipCard, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#3366FF" />
              <Text style={styles.tipTitle}>Sécurisez votre compte</Text>
              <Text style={styles.tipDesc}>Activez la vérification en deux étapes</Text>
            </View>
            <View style={[styles.tipCard, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="people" size={24} color="#10B981" />
              <Text style={styles.tipTitle}>Invitez vos proches</Text>
              <Text style={styles.tipDesc}>Partagez Mbotama Pay avec vos amis</Text>
            </View>
            <View style={[styles.tipCard, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text style={styles.tipTitle}>Niveau supérieur</Text>
              <Text style={styles.tipDesc}>Augmentez vos limites de transfert</Text>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Modal Notifications */}
      <Modal
        visible={showNotifs}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotifs(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.foreground }]}>Notifications</Text>
            <Pressable onPress={() => setShowNotifs(false)} style={styles.closeBtn}>
              <Ionicons name="close-circle" size={28} color={theme.mutedForeground} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.notifList}>
            {notifications.length === 0 ? (
              <View style={styles.notifEmpty}>
                <View style={[styles.notifEmptyIcon, { backgroundColor: theme.muted }]}>
                  <Ionicons name="notifications-off-outline" size={40} color={theme.mutedForeground} />
                </View>
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
    </View>
  );
}

function TxItem({ tx, theme, isLast }: { tx: TransactionResponse; theme: any; isLast: boolean }) {
  const isOut = tx.type === 'OUTGOING' || tx.type === 'TRANSFER';
  const statusConfig = {
    success: { color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle' as const },
    pending: { color: '#F59E0B', bg: '#FEF3C7', icon: 'time' as const },
    failed: { color: '#EF4444', bg: '#FEE2E2', icon: 'close-circle' as const },
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
    <Pressable style={[styles.txItem, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border + '30' }]}>
      <View style={[styles.txIcon, { backgroundColor: isOut ? '#EFF6FF' : '#D1FAE5' }]}>
        <Ionicons 
          name={isOut ? 'arrow-up-circle' : 'arrow-down-circle'} 
          size={24} 
          color={isOut ? '#3366FF' : '#10B981'} 
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txName, { color: theme.foreground }]} numberOfLines={1}>
          {tx.recipientName || 'Transfert'}
        </Text>
        <View style={styles.txMeta}>
          <Text style={[styles.txDate, { color: theme.mutedForeground }]}>{formatDate(tx.createdAt)}</Text>
          <View style={[styles.statusDot, { backgroundColor: config.color }]} />
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isOut ? theme.foreground : '#10B981' }]}>
          {isOut ? '-' : '+'}{new Intl.NumberFormat('fr-FR').format(tx.amount)}
        </Text>
        <Text style={[styles.txCurrency, { color: theme.mutedForeground }]}>FCFA</Text>
      </View>
    </Pressable>
  );
}

function NotificationItem({ notif, theme, onDismiss }: { notif: Notification; theme: any; onDismiss: () => void }) {
  const iconConfig = {
    success: { icon: 'checkmark-circle' as const, color: '#10B981', bg: '#D1FAE5' },
    info: { icon: 'information-circle' as const, color: '#3366FF', bg: '#EFF6FF' },
    warning: { icon: 'warning' as const, color: '#F59E0B', bg: '#FEF3C7' },
  };
  const config = iconConfig[notif.type];

  return (
    <View style={[styles.notifItem, { backgroundColor: theme.surface }]}>
      <View style={[styles.notifIconWrap, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
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
  container: { flex: 1, backgroundColor: '#1E40AF' },
  
  // Hero Header
  heroHeader: {
    paddingBottom: 60,
    overflow: 'hidden',
  },
  heroSafeArea: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {},
  greetingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 2,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E40AF',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 22,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verifiedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingText: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Decorative circles
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -50,
    right: -50,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: 20,
    left: -40,
  },
  circle3: {
    width: 80,
    height: 80,
    top: 60,
    right: 80,
  },

  // Actions Card
  actionsCardContainer: {
    paddingHorizontal: 20,
    marginTop: -40,
    zIndex: 10,
  },
  actionsCard: {
    borderRadius: 20,
    padding: 20,
  },
  actionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
    opacity: 0.6,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
  },

  // Scroll View
  scrollView: {
    flex: 1,
    marginTop: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Promo Banner
  promoBanner: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  promoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoEmoji: {
    fontSize: 22,
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#78350F',
  },
  promoDesc: {
    fontSize: 12,
    color: '#92400E',
    marginTop: 2,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Loading
  loadingWrap: {
    gap: 12,
  },
  skeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  skeletonCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
  },
  skeletonLines: {
    flex: 1,
    gap: 8,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 6,
  },

  // Empty State
  empty: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Transactions
  txList: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  txDate: {
    fontSize: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  txCurrency: {
    fontSize: 11,
    marginTop: 2,
  },

  // Tips
  tipsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  tipCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    marginRight: 12,
    gap: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  tipDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },

  // Modal
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  notifList: {
    flex: 1,
    padding: 16,
  },
  notifEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 16,
  },
  notifEmptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifEmptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  notifItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 14,
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 6,
  },
  notifDismiss: {
    padding: 4,
  },
});
