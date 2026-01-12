import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { StepIndicator } from '../../src/components/transfer/StepIndicator';
import { useAuthStore } from '../../src/store/authStore';
import { useTransferStore } from '../../src/store/transferStore';
import { transferService } from '../../src/services/transfer';
import { PHONE_PREFIX_TO_ISO } from '../../src/constants/config';
import { getOperatorLogo } from '../../src/constants/operatorLogos';

// Hook responsive
const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  return {
    isSmall: width < 360,
    isMedium: width >= 360 && width < 400,
    isLarge: width >= 400,
    isShort: height < 700,
    width,
    height,
  };
};

export default function TransferScreen() {
  const { theme } = useTheme();
  const responsive = useResponsive();
  const { user } = useAuthStore();
  const {
    senderPhone, setSenderPhone,
    sourceOperators, setSourceOperators,
    selectedSourceOperator, setSelectedSourceOperator,
    resetTransfer,
  } = useTransferStore();

  const [loading, setLoading] = useState(true);
  const [isEditingSender, setIsEditingSender] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    resetTransfer();
    if (user?.phoneNumber) {
      setSenderPhone(user.phoneNumber);
    }
    loadSourceOperators();
  }, []);

  const loadSourceOperators = async () => {
    setLoading(true);
    try {
      let countryIso = user?.countryCode || 'SN';
      if (countryIso.startsWith('+')) {
        countryIso = PHONE_PREFIX_TO_ISO[countryIso] || 'SN';
      }
      const response = await transferService.getOperatorsByCountry(countryIso);
      if (response.success && response.data?.operators) {
        setSourceOperators(response.data.operators);
        setSelectedSourceOperator(response.data.operators[0] || null);
      }
    } catch (error) {
      console.error('Failed to load source operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOperatorsForSender = async (phone: string) => {
    if (!phone || phone.length < 8) return;
    setLoading(true);
    try {
      const response = await transferService.getOperatorsByPhone(phone);
      if (response.success && response.data?.operators) {
        setSourceOperators(response.data.operators);
        setSelectedSourceOperator(response.data.operators[0] || null);
      } else {
        let countryIso = 'SN';
        for (const [prefix, iso] of Object.entries(PHONE_PREFIX_TO_ISO)) {
          if (phone.startsWith(prefix) || phone.startsWith(prefix.replace('+', ''))) {
            countryIso = iso;
            break;
          }
        }
        const fallbackResponse = await transferService.getOperatorsByCountry(countryIso);
        if (fallbackResponse.success && fallbackResponse.data?.operators) {
          setSourceOperators(fallbackResponse.data.operators);
          setSelectedSourceOperator(fallbackResponse.data.operators[0] || null);
        }
      }
    } catch (error) {
      console.error('Failed to load operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOperator = (op: typeof sourceOperators[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSourceOperator(op);
  };

  const handleEditSender = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTempPhone(senderPhone);
    setIsEditingSender(true);
  };

  const handleCancelEdit = () => {
    setTempPhone('');
    setIsEditingSender(false);
  };

  const handleConfirmEdit = () => {
    setSenderPhone(tempPhone);
    setIsEditingSender(false);
    loadOperatorsForSender(tempPhone);
  };

  const handleNext = () => {
    if (!selectedSourceOperator) {
      Alert.alert('Erreur', 'Veuillez sélectionner votre compte');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/transfer/recipient');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView 
        contentContainerStyle={[
          styles.content,
          responsive.isSmall && styles.contentSmall
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[
              styles.headerTitle, 
              { color: theme.foreground },
              responsive.isSmall && styles.headerTitleSmall
            ]}>
              Transfert
            </Text>
            <Text style={[
              styles.headerSubtitle, 
              { color: theme.mutedForeground },
              responsive.isSmall && styles.headerSubtitleSmall
            ]}>
              Envoyez de l'argent facilement
            </Text>
          </View>

          {/* Progress Indicator */}
          <StepIndicator currentStep={0} />

          <Card variant="elevated" style={StyleSheet.flatten([styles.formCard, responsive.isSmall && styles.formCardSmall])}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: theme.primaryLighter }]}>
                <Ionicons name="wallet-outline" size={24} color={theme.primary} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={[
                  styles.stepTitle, 
                  { color: theme.foreground },
                  responsive.isSmall && styles.stepTitleSmall
                ]}>
                  Compte à débiter
                </Text>
                <Text style={[
                  styles.stepSubtitle, 
                  { color: theme.mutedForeground },
                  responsive.isSmall && styles.stepSubtitleSmall
                ]}>
                  {isEditingSender ? 'Entrez le numéro à débiter' : 'Sélectionnez votre compte source'}
                </Text>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>
                  Chargement des opérateurs...
                </Text>
              </View>
            ) : (
              <View>
                {/* User Account Card */}
                {!isEditingSender ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleEditSender}
                    style={[
                      styles.userAccountCard, 
                      { 
                        backgroundColor: theme.secondary, 
                        borderColor: theme.primary,
                        shadowColor: theme.primary,
                      }
                    ]}
                  >
                    <View style={styles.userAccountHeader}>
                      <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
                        <Text style={styles.userAvatarText}>
                          {user?.firstName?.charAt(0) || 'U'}
                        </Text>
                      </View>
                      <View style={styles.userAccountInfo}>
                        <Text style={[
                          styles.userName, 
                          { color: theme.foreground },
                          responsive.isSmall && styles.userNameSmall
                        ]}>
                          {senderPhone === user?.phoneNumber
                            ? (user?.firstName ? `${user.firstName} ${user?.lastName || ''}`.trim() : 'Mon compte')
                            : 'Autre compte'}
                        </Text>
                        <Text style={[
                          styles.userPhone, 
                          { color: theme.mutedForeground },
                          responsive.isSmall && styles.userPhoneSmall
                        ]}>
                          {senderPhone || 'Non disponible'}
                        </Text>
                      </View>
                      <View style={[styles.editButton, { backgroundColor: theme.muted }]}>
                        <Ionicons name="pencil" size={16} color={theme.primary} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.editSenderContainer}>
                    <Text style={[styles.label, { color: theme.foreground }]}>Numéro à débiter</Text>
                    <View style={[
                      styles.inputContainer, 
                      { borderColor: theme.primary, backgroundColor: theme.surface }
                    ]}>
                      <Ionicons name="call-outline" size={20} color={theme.primary} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, { color: theme.foreground }]}
                        placeholder="Ex: +221 77 123 45 67"
                        placeholderTextColor={theme.mutedForeground}
                        value={tempPhone}
                        onChangeText={setTempPhone}
                        keyboardType="phone-pad"
                        autoFocus
                      />
                    </View>
                    <View style={styles.editButtonsRow}>
                      <TouchableOpacity
                        onPress={handleCancelEdit}
                        style={[styles.cancelEditButton, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.cancelEditText, { color: theme.mutedForeground }]}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleConfirmEdit}
                        style={[styles.confirmEditButton, { backgroundColor: theme.primary }]}
                      >
                        <Text style={styles.confirmEditText}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Source Operators */}
                {sourceOperators.length > 0 && (
                  <View style={styles.operatorsSection}>
                    <Text style={[
                      styles.sectionLabel, 
                      { color: theme.foreground },
                      responsive.isSmall && styles.sectionLabelSmall
                    ]}>
                      Envoyer depuis
                    </Text>
                    <View style={[
                      styles.sourceGrid,
                      responsive.isSmall && styles.sourceGridSmall
                    ]}>
                      {sourceOperators.map((op) => {
                        const logo = getOperatorLogo(op.code);
                        const isSelected = selectedSourceOperator?.code === op.code;
                        return (
                          <TouchableOpacity
                            key={op.code}
                            activeOpacity={0.7}
                            style={[
                              styles.sourceCard,
                              responsive.isSmall && styles.sourceCardSmall,
                              {
                                borderColor: isSelected ? theme.primary : theme.border,
                                backgroundColor: isSelected ? theme.secondary : theme.surface,
                                shadowColor: isSelected ? theme.primary : 'transparent',
                                shadowOpacity: isSelected ? 0.2 : 0,
                                shadowRadius: isSelected ? 8 : 0,
                                elevation: isSelected ? 4 : 0,
                              },
                            ]}
                            onPress={() => handleSelectOperator(op)}
                          >
                            <View style={[
                              styles.sourceIconContainer, 
                              { backgroundColor: isSelected ? theme.primaryLighter : theme.muted },
                              responsive.isSmall && styles.sourceIconContainerSmall
                            ]}>
                              {logo ? (
                                <Image source={logo} style={[
                                  styles.operatorLogo,
                                  responsive.isSmall && styles.operatorLogoSmall
                                ]} />
                              ) : (
                                <Ionicons name="wallet" size={responsive.isSmall ? 20 : 24} color={theme.primary} />
                              )}
                            </View>
                            <View style={styles.sourceInfo}>
                              <Text style={[
                                styles.sourceName, 
                                { color: theme.foreground },
                                responsive.isSmall && styles.sourceNameSmall
                              ]}>
                                {op.name}
                              </Text>
                              {isSelected && (
                                <Text style={[
                                  styles.selectedLabel, 
                                  { color: theme.primary },
                                  responsive.isSmall && styles.selectedLabelSmall
                                ]}>
                                  Sélectionné
                                </Text>
                              )}
                            </View>
                            {isSelected && (
                              <View style={[
                                styles.selectedBadge, 
                                { backgroundColor: theme.primary },
                                responsive.isSmall && styles.selectedBadgeSmall
                              ]}>
                                <Ionicons name="checkmark" size={responsive.isSmall ? 12 : 14} color="#FFF" />
                              </View>
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {sourceOperators.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIcon, { backgroundColor: theme.muted }]}>
                      <Ionicons name="wallet-outline" size={32} color={theme.mutedForeground} />
                    </View>
                    <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                      Aucun opérateur disponible
                    </Text>
                    <TouchableOpacity onPress={loadSourceOperators}>
                      <Text style={[styles.retryText, { color: theme.primary }]}>Réessayer</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            <Button 
              onPress={handleNext} 
              style={styles.button} 
              disabled={!selectedSourceOperator || loading}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            </Button>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  contentSmall: { padding: 12 },
  header: { marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '700' },
  headerTitleSmall: { fontSize: 24 },
  headerSubtitle: { fontSize: 15, marginTop: 4 },
  headerSubtitleSmall: { fontSize: 13 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  progressStep: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  progressNumber: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  progressLine: { width: 40, height: 3, borderRadius: 2, marginHorizontal: 8 },
  formCard: { padding: 20, borderRadius: 20 },
  formCardSmall: { padding: 16, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  cardIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardHeaderText: { flex: 1 },
  stepTitle: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  stepTitleSmall: { fontSize: 18 },
  stepSubtitle: { fontSize: 14 },
  stepSubtitleSmall: { fontSize: 12 },
  loadingContainer: { alignItems: 'center', paddingVertical: 48 },
  loadingText: { marginTop: 16, fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 14, marginBottom: 8 },
  retryText: { fontSize: 14, fontWeight: '600' },
  userAccountCard: { padding: 16, borderRadius: 16, borderWidth: 2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  userAccountHeader: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  userAvatarText: { color: '#FFF', fontSize: 20, fontWeight: '700' },
  userAccountInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  userNameSmall: { fontSize: 14 },
  userPhone: { fontSize: 14, marginTop: 2 },
  userPhoneSmall: { fontSize: 12 },
  editButton: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  editSenderContainer: { marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, paddingHorizontal: 16, marginBottom: 12 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  editButtonsRow: { flexDirection: 'row', gap: 12 },
  cancelEditButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelEditText: { fontSize: 14, fontWeight: '500' },
  confirmEditButton: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  confirmEditText: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  operatorsSection: { marginTop: 24 },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: 12 },
  sectionLabelSmall: { fontSize: 13 },
  sourceGrid: { gap: 12 },
  sourceGridSmall: { gap: 10 },
  sourceCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 14, borderWidth: 2 },
  sourceCardSmall: { padding: 12, borderRadius: 12 },
  sourceIconContainer: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14, overflow: 'hidden' },
  sourceIconContainerSmall: { width: 44, height: 44, borderRadius: 12, marginRight: 12 },
  operatorLogo: { width: 44, height: 44, borderRadius: 10 },
  operatorLogoSmall: { width: 36, height: 36, borderRadius: 8 },
  sourceInfo: { flex: 1 },
  sourceName: { fontSize: 16, fontWeight: '600' },
  sourceNameSmall: { fontSize: 14 },
  selectedLabel: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  selectedLabelSmall: { fontSize: 11 },
  selectedBadge: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  selectedBadgeSmall: { width: 22, height: 22, borderRadius: 11 },
  button: { marginTop: 24 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
