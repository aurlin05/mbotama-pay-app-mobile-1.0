import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
import { useTransferStore } from '../../src/store/transferStore';
import { useAuthStore } from '../../src/store/authStore';
import { transferService } from '../../src/services/transfer';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000, 25000, 50000];

const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  return {
    isSmall: width < 360,
    isMedium: width >= 360 && width < 400,
    isLarge: width >= 400,
    width,
    height,
  };
};

export default function AmountScreen() {
  const { theme } = useTheme();
  const responsive = useResponsive();
  const { user } = useAuthStore();
  const {
    amount, setAmount,
    description, setDescription,
    senderPhone,
    selectedSourceOperator,
    selectedCountry,
    recipientPhone,
    recipientName,
    selectedDestOperator,
    setPreview,
  } = useTransferStore();

  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const formatDisplayAmount = (value: string) => {
    if (!value) return '0';
    return new Intl.NumberFormat('fr-FR').format(parseInt(value) || 0);
  };

  const handleQuickAmount = (value: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAmount(value.toString());
  };

  const handleNext = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount < 100) {
      Alert.alert('Erreur', 'Le montant minimum est de 100 FCFA');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const response = await transferService.previewTransfer({
        senderPhone: senderPhone || user?.phoneNumber || '',
        sourceOperator: selectedSourceOperator?.code || '',
        recipientPhone: selectedCountry.code + recipientPhone,
        destOperator: selectedDestOperator?.code || '',
        amount: numAmount,
      });

      if (response.success && response.data) {
        if (!response.data.available) {
          Alert.alert('Non disponible', response.data.reason || 'Ce transfert est indisponible');
          return;
        }
        setPreview(response.data);
        router.push('/transfer/preview');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de calculer les frais');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={[styles.content, responsive.isSmall && styles.contentSmall]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {/* Progress */}
            <StepIndicator currentStep={2} />

            {/* Recipient Summary */}
            <View style={[styles.recipientSummary, { backgroundColor: theme.secondary, borderColor: theme.border }]}>
              <View style={[styles.recipientAvatar, { backgroundColor: theme.primary }]}>
                <Text style={styles.recipientInitial}>{recipientName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.recipientInfo}>
                <Text style={[styles.recipientName, { color: theme.foreground }]}>{recipientName}</Text>
                <Text style={[styles.recipientPhone, { color: theme.mutedForeground }]}>
                  {selectedCountry.code} {recipientPhone}
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.back()} style={[styles.editRecipient, { backgroundColor: theme.muted }]}>
                <Ionicons name="pencil" size={16} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <Card variant="elevated" style={StyleSheet.flatten([styles.formCard, responsive.isSmall && styles.formCardSmall])}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: theme.primaryLighter }]}>
                  <Ionicons name="cash-outline" size={24} color={theme.primary} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.title, { color: theme.foreground }, responsive.isSmall && styles.titleSmall]}>
                    Montant
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.mutedForeground }, responsive.isSmall && styles.subtitleSmall]}>
                    Combien souhaitez-vous envoyer ?
                  </Text>
                </View>
              </View>

              {/* Amount Input */}
              <View style={[styles.amountCard, { backgroundColor: theme.muted }]}>
                <View style={styles.amountInputContainer}>
                  <TextInput
                    style={[
                      styles.amountInput, 
                      { color: theme.foreground },
                      responsive.isSmall && styles.amountInputSmall
                    ]}
                    placeholder="0"
                    placeholderTextColor={theme.mutedForeground}
                    value={amount}
                    onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <Text style={[styles.currency, { color: theme.primary }, responsive.isSmall && styles.currencySmall]}>
                  FCFA
                </Text>
                {amount && (
                  <Text style={[styles.amountFormatted, { color: theme.mutedForeground }]}>
                    {formatDisplayAmount(amount)} FCFA
                  </Text>
                )}
              </View>

              {/* Quick Amounts */}
              <Text style={[styles.quickLabel, { color: theme.foreground }]}>Montants rapides</Text>
              <View style={[styles.quickAmounts, responsive.isSmall && styles.quickAmountsSmall]}>
                {QUICK_AMOUNTS.map((value) => {
                  const isSelected = amount === value.toString();
                  return (
                    <TouchableOpacity
                      key={value}
                      activeOpacity={0.7}
                      style={[
                        styles.quickAmount,
                        responsive.isSmall && styles.quickAmountSmall,
                        { 
                          borderColor: isSelected ? theme.primary : theme.border, 
                          backgroundColor: isSelected ? theme.secondary : theme.surface 
                        }
                      ]}
                      onPress={() => handleQuickAmount(value)}
                    >
                      <Text style={[
                        styles.quickAmountText, 
                        { color: isSelected ? theme.primary : theme.foreground },
                        responsive.isSmall && styles.quickAmountTextSmall
                      ]}>
                        {new Intl.NumberFormat('fr-FR').format(value)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description */}
              <View style={styles.descriptionSection}>
                <Text style={[styles.label, { color: theme.foreground }]}>
                  <Ionicons name="document-text-outline" size={14} color={theme.mutedForeground} /> Description (optionnel)
                </Text>
                <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <TextInput
                    style={[styles.input, { color: theme.foreground }, responsive.isSmall && styles.inputSmall]}
                    placeholder="Ex: Remboursement, cadeau..."
                    placeholderTextColor={theme.mutedForeground}
                    value={description}
                    onChangeText={setDescription}
                    maxLength={100}
                  />
                </View>
              </View>

              <Button 
                onPress={handleNext} 
                loading={loading} 
                style={styles.button}
                disabled={!amount || parseInt(amount) < 100}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Voir le récapitulatif</Text>
                  <Ionicons name="arrow-forward" size={20} color="#FFF" />
                </View>
              </Button>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  content: { padding: 16 },
  contentSmall: { padding: 12 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  progressStep: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  progressNumber: { color: '#FFF', fontSize: 14, fontWeight: '600' },
  progressLine: { width: 40, height: 3, borderRadius: 2, marginHorizontal: 8 },
  recipientSummary: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  recipientAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  recipientInitial: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: '600' },
  recipientPhone: { fontSize: 13, marginTop: 2 },
  editRecipient: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  formCard: { padding: 20, borderRadius: 20 },
  formCardSmall: { padding: 16, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  cardIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardHeaderText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  titleSmall: { fontSize: 18 },
  subtitle: { fontSize: 14 },
  subtitleSmall: { fontSize: 12 },
  amountCard: { borderRadius: 20, padding: 28, alignItems: 'center', marginBottom: 24 },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  amountInput: { fontSize: 52, fontWeight: '700', textAlign: 'center', minWidth: 100 },
  amountInputSmall: { fontSize: 42 },
  currency: { fontSize: 20, fontWeight: '600', marginTop: 8 },
  currencySmall: { fontSize: 18 },
  amountFormatted: { fontSize: 14, marginTop: 8 },
  quickLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  quickAmountsSmall: { gap: 8 },
  quickAmount: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 2 },
  quickAmountSmall: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16 },
  quickAmountText: { fontSize: 14, fontWeight: '600' },
  quickAmountTextSmall: { fontSize: 12 },
  descriptionSection: { marginBottom: 8 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, paddingHorizontal: 16 },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  inputSmall: { fontSize: 14, paddingVertical: 12 },
  button: { marginTop: 16 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
