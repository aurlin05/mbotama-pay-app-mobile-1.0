import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { transferService } from '../../src/services/transfer';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { COUNTRY_CODES } from '../../src/constants/config';
import type { MobileOperator, TransferPreviewResponse } from '../../src/types/api';

type Step = 'recipient' | 'amount' | 'preview' | 'success';

export default function TransferScreen() {
  const { theme, tokens } = useTheme();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('recipient');
  const [loading, setLoading] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [operators, setOperators] = useState<MobileOperator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<MobileOperator | null>(null);
  const [preview, setPreview] = useState<TransferPreviewResponse | null>(null);
  const [transactionId, setTransactionId] = useState<number | null>(null);

  useEffect(() => {
    loadOperators();
  }, [selectedCountry]);

  const loadOperators = async () => {
    try {
      const response = await transferService.getOperatorsByCountry(selectedCountry.country);
      if (response.success && response.data) {
        setOperators(response.data.operators);
        if (response.data.operators.length > 0) {
          setSelectedOperator(response.data.operators[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load operators:', error);
    }
  };

  const handleNextStep = async () => {
    if (step === 'recipient') {
      if (!recipientPhone || recipientPhone.length < 8) {
        Alert.alert('Erreur', 'Veuillez entrer un numéro valide');
        return;
      }
      if (!recipientName.trim()) {
        Alert.alert('Erreur', 'Veuillez entrer le nom du destinataire');
        return;
      }
      setStep('amount');
    } else if (step === 'amount') {
      const numAmount = parseFloat(amount);
      if (!numAmount || numAmount < 100) {
        Alert.alert('Erreur', 'Le montant minimum est de 100 FCFA');
        return;
      }
      await loadPreview();
    }
  };

  const loadPreview = async () => {
    setLoading(true);
    try {
      const fullRecipientPhone = `${selectedCountry.code}${recipientPhone}`;
      const response = await transferService.previewTransfer({
        senderPhone: user?.phoneNumber || '',
        sourceOperator: selectedOperator?.code || '',
        recipientPhone: fullRecipientPhone,
        destOperator: selectedOperator?.code || '',
        amount: parseFloat(amount),
      });
      if (response.success && response.data) {
        setPreview(response.data);
        setStep('preview');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Impossible de calculer les frais');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    setLoading(true);
    try {
      const fullRecipientPhone = `${selectedCountry.code}${recipientPhone}`;
      const response = await transferService.createTransfer({
        senderPhone: user?.phoneNumber || '',
        sourceOperator: selectedOperator?.code || '',
        recipientPhone: fullRecipientPhone,
        destOperator: selectedOperator?.code || '',
        amount: parseFloat(amount),
        recipientName,
        description,
      });
      if (response.success && response.data) {
        setTransactionId(response.data.id);
        setStep('success');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Le transfert a échoué');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('recipient');
    setRecipientPhone('');
    setRecipientName('');
    setAmount('');
    setDescription('');
    setPreview(null);
    setTransactionId(null);
  };

  const formatAmount = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

  // Success Screen
  if (step === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.successLight }]}>
            <Ionicons name="checkmark-circle" size={64} color={theme.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.foreground }]}>Transfert réussi !</Text>
          <Text style={[styles.successText, { color: theme.mutedForeground }]}>
            {formatAmount(parseFloat(amount))} envoyés à {recipientName}
          </Text>
          <Text style={[styles.transactionId, { color: theme.mutedForeground }]}>
            ID: #{transactionId}
          </Text>
          <Button onPress={resetForm} style={styles.successButton}>
            Nouveau transfert
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            {['recipient', 'amount', 'preview'].map((s, i) => (
              <View key={s} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        step === s || ['recipient', 'amount', 'preview'].indexOf(step) > i
                          ? theme.primary
                          : theme.border,
                    },
                  ]}
                >
                  {['recipient', 'amount', 'preview'].indexOf(step) > i && (
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  )}
                </View>
                {i < 2 && (
                  <View
                    style={[
                      styles.stepLine,
                      {
                        backgroundColor:
                          ['recipient', 'amount', 'preview'].indexOf(step) > i
                            ? theme.primary
                            : theme.border,
                      },
                    ]}
                  />
                )}
              </View>
            ))}
          </View>

          {step === 'recipient' && (
            <Card style={styles.formCard}>
              <Text style={[styles.stepTitle, { color: theme.foreground }]}>Destinataire</Text>
              <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
                Entrez les informations du bénéficiaire
              </Text>

              <Text style={[styles.label, { color: theme.foreground }]}>Nom du destinataire</Text>
              <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Ionicons name="person-outline" size={20} color={theme.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.foreground }]}
                  placeholder="Ex: Mamadou Diallo"
                  placeholderTextColor={theme.mutedForeground}
                  value={recipientName}
                  onChangeText={setRecipientName}
                />
              </View>

              <Text style={[styles.label, { color: theme.foreground }]}>Numéro de téléphone</Text>
              <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <Text style={styles.flag}>{selectedCountry.flag}</Text>
                <Text style={[styles.prefix, { color: theme.foreground }]}>{selectedCountry.code}</Text>
                <TextInput
                  style={[styles.input, { color: theme.foreground }]}
                  placeholder="7X XXX XX XX"
                  placeholderTextColor={theme.mutedForeground}
                  value={recipientPhone}
                  onChangeText={setRecipientPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {operators.length > 0 && (
                <>
                  <Text style={[styles.label, { color: theme.foreground }]}>Opérateur</Text>
                  <View style={styles.operatorsGrid}>
                    {operators.map((op) => (
                      <TouchableOpacity
                        key={op.code}
                        style={[
                          styles.operatorCard,
                          {
                            borderColor: selectedOperator?.code === op.code ? theme.primary : theme.border,
                            backgroundColor: selectedOperator?.code === op.code ? theme.secondary : theme.surface,
                          },
                        ]}
                        onPress={() => setSelectedOperator(op)}
                      >
                        <Text style={[styles.operatorName, { color: theme.foreground }]}>{op.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              <Button onPress={handleNextStep} style={styles.button}>
                Continuer
              </Button>
            </Card>
          )}

          {step === 'amount' && (
            <Card style={styles.formCard}>
              <Text style={[styles.stepTitle, { color: theme.foreground }]}>Montant</Text>
              <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
                Combien souhaitez-vous envoyer ?
              </Text>

              <View style={[styles.amountCard, { backgroundColor: theme.muted }]}>
                <TextInput
                  style={[styles.amountInput, { color: theme.foreground }]}
                  placeholder="0"
                  placeholderTextColor={theme.mutedForeground}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                />
                <Text style={[styles.currency, { color: theme.mutedForeground }]}>FCFA</Text>
              </View>

              <View style={styles.quickAmounts}>
                {[1000, 5000, 10000, 25000].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.quickAmount, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={() => setAmount(value.toString())}
                  >
                    <Text style={[styles.quickAmountText, { color: theme.foreground }]}>
                      {new Intl.NumberFormat('fr-FR').format(value)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: theme.foreground }]}>Description (optionnel)</Text>
              <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                <TextInput
                  style={[styles.input, { color: theme.foreground }]}
                  placeholder="Ex: Remboursement"
                  placeholderTextColor={theme.mutedForeground}
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View style={styles.buttonRow}>
                <Button variant="outline" onPress={() => setStep('recipient')} style={styles.buttonHalf}>
                  Retour
                </Button>
                <Button onPress={handleNextStep} loading={loading} style={styles.buttonHalf}>
                  Continuer
                </Button>
              </View>
            </Card>
          )}

          {step === 'preview' && (
            <Card style={styles.formCard}>
              <Text style={[styles.stepTitle, { color: theme.foreground }]}>Confirmation</Text>
              <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
                Vérifiez les détails du transfert
              </Text>

              <View style={[styles.summaryCard, { backgroundColor: theme.muted }]}>
                <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Destinataire</Text>
                  <Text style={[styles.summaryValue, { color: theme.foreground }]}>{recipientName}</Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Téléphone</Text>
                  <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                    {selectedCountry.code}{recipientPhone}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Montant</Text>
                  <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                    {formatAmount(parseFloat(amount))}
                  </Text>
                </View>
                <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                  <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Frais</Text>
                  <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                    {formatAmount(preview?.fees || 0)}
                  </Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, { color: theme.foreground }]}>Total</Text>
                  <Text style={[styles.totalValue, { color: theme.primary }]}>
                    {formatAmount(preview?.total || 0)}
                  </Text>
                </View>
              </View>

              <View style={styles.buttonRow}>
                <Button variant="outline" onPress={() => setStep('amount')} style={styles.buttonHalf}>
                  Modifier
                </Button>
                <Button onPress={handleConfirmTransfer} loading={loading} style={styles.buttonHalf}>
                  Confirmer
                </Button>
              </View>
            </Card>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 60,
    height: 2,
    marginHorizontal: 8,
  },
  formCard: {
    padding: 20,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  prefix: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 14,
  },
  operatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  operatorCard: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  operatorName: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  buttonHalf: {
    flex: 1,
  },
  amountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    textAlign: 'center',
  },
  currency: {
    fontSize: 18,
    marginTop: 8,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickAmount: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  transactionId: {
    fontSize: 14,
    marginBottom: 32,
  },
  successButton: {
    width: '100%',
  },
});
