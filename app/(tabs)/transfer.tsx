import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { transferService } from '../../src/services/transfer';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';
import { COUNTRY_CODES, PHONE_PREFIX_TO_ISO } from '../../src/constants/config';
import { getOperatorLogo } from '../../src/constants/operatorLogos';
import type { MobileOperator, TransferPreviewResponse } from '../../src/types/api';

type Step = 'source' | 'recipient' | 'amount' | 'preview' | 'success';

export default function TransferScreen() {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [step, setStep] = useState<Step>('source');
  const [loading, setLoading] = useState(false);
  const [detectingOperator, setDetectingOperator] = useState(false);
  const [sourceOperators, setSourceOperators] = useState<MobileOperator[]>([]);
  const [selectedSourceOperator, setSelectedSourceOperator] = useState<MobileOperator | null>(null);
  const [loadingSource, setLoadingSource] = useState(true);
  const [senderPhone, setSenderPhone] = useState('');
  const [isEditingSender, setIsEditingSender] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [destOperators, setDestOperators] = useState<MobileOperator[]>([]);
  const [selectedDestOperator, setSelectedDestOperator] = useState<MobileOperator | null>(null);
  const [detectedDestCountry, setDetectedDestCountry] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<TransferPreviewResponse | null>(null);
  const [transactionRef, setTransactionRef] = useState<string | null>(null);

  useEffect(() => {
    if (user?.phoneNumber) setSenderPhone(user.phoneNumber);
    loadSourceOperators();
  }, [user?.phoneNumber]);

  const loadOperatorsForSender = async (phone: string) => {
    if (!phone || phone.length < 8) return;
    setLoadingSource(true);
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
      setLoadingSource(false);
    }
  };

  const loadSourceOperators = async () => {
    setLoadingSource(true);
    try {
      let countryIso = user?.countryCode || 'SN';
      if (countryIso.startsWith('+')) countryIso = PHONE_PREFIX_TO_ISO[countryIso] || 'SN';
      const response = await transferService.getOperatorsByCountry(countryIso);
      if (response.success && response.data?.operators) {
        setSourceOperators(response.data.operators);
        setSelectedSourceOperator(response.data.operators[0] || null);
      }
    } catch (error) {
      console.error('Failed to load source operators:', error);
    } finally {
      setLoadingSource(false);
    }
  };

  const loadOperatorsForCountry = async (countryCode: string) => {
    setDetectingOperator(true);
    try {
      const response = await transferService.getOperatorsByCountry(countryCode);
      if (response.success && response.data?.operators) {
        setDestOperators(response.data.operators);
        setDetectedDestCountry(response.data.country?.name || null);
        setSelectedDestOperator(response.data.operators[0] || null);
      }
    } catch (error) {
      setDestOperators([]);
      setSelectedDestOperator(null);
    } finally {
      setDetectingOperator(false);
    }
  };

  const detectDestinationOperator = useCallback(async (phone: string) => {
    if (phone.length < 8) {
      if (phone.length === 0) loadOperatorsForCountry(selectedCountry.country);
      return;
    }
    setDetectingOperator(true);
    try {
      const fullPhone = selectedCountry.code + phone;
      const response = await transferService.getOperatorsByPhone(fullPhone);
      if (response.success && response.data?.operators) {
        setDestOperators(response.data.operators);
        setDetectedDestCountry(response.data.country?.name || null);
        setSelectedDestOperator(response.data.operators[0] || null);
      }
    } catch {
      loadOperatorsForCountry(selectedCountry.country);
    } finally {
      setDetectingOperator(false);
    }
  }, [selectedCountry]);

  const handleCountryChange = (country: typeof COUNTRY_CODES[0]) => {
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSelectedDestOperator(null);
    loadOperatorsForCountry(country.country);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (recipientPhone.length >= 8) detectDestinationOperator(recipientPhone);
    }, 500);
    return () => clearTimeout(timer);
  }, [recipientPhone, detectDestinationOperator]);

  const handleNextStep = async () => {
    if (step === 'source') {
      if (!selectedSourceOperator) {
        Alert.alert('Erreur', 'Veuillez selectionner votre compte');
        return;
      }
      setStep('recipient');
    } else if (step === 'recipient') {
      if (!recipientPhone || recipientPhone.length < 8) {
        Alert.alert('Erreur', 'Veuillez entrer un numero valide');
        return;
      }
      if (!recipientName.trim()) {
        Alert.alert('Erreur', 'Veuillez entrer le nom du destinataire');
        return;
      }
      if (!selectedDestOperator) {
        Alert.alert('Erreur', 'Veuillez selectionner un operateur');
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

  const handleBack = () => {
    if (step === 'recipient') setStep('source');
    else if (step === 'amount') setStep('recipient');
    else if (step === 'preview') setStep('amount');
  };

  const loadPreview = async () => {
    setLoading(true);
    try {
      const response = await transferService.previewTransfer({
        senderPhone: senderPhone || user?.phoneNumber || '',
        sourceOperator: selectedSourceOperator?.code || '',
        recipientPhone: selectedCountry.code + recipientPhone,
        destOperator: selectedDestOperator?.code || '',
        amount: parseFloat(amount),
      });
      if (response.success && response.data) {
        if (!response.data.available) {
          Alert.alert('Non disponible', response.data.reason || 'Ce transfert est indisponible');
          return;
        }
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
      const response = await transferService.createTransfer({
        senderPhone: senderPhone || user?.phoneNumber || '',
        sourceOperator: selectedSourceOperator?.code || '',
        recipientPhone: selectedCountry.code + recipientPhone,
        destOperator: selectedDestOperator?.code || '',
        amount: parseFloat(amount),
        recipientName,
        description,
      });
      if (response.success && response.data) {
        setTransactionRef(response.data.reference || null);
        setStep('success');
      } else {
        Alert.alert('Erreur', 'Le transfert a echoue');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Le transfert a echoue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('source');
    setSelectedSourceOperator(null);
    setSenderPhone(user?.phoneNumber || '');
    setIsEditingSender(false);
    setRecipientPhone('');
    setRecipientName('');
    setAmount('');
    setDescription('');
    setPreview(null);
    setTransactionRef(null);
    setSelectedDestOperator(null);
    setDestOperators([]);
    setDetectedDestCountry(null);
  };

  const formatAmount = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  const stepLabels = ['source', 'recipient', 'amount', 'preview'];
  const currentStepIndex = stepLabels.indexOf(step);

  // SUCCESS SCREEN
  if (step === 'success') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
        <View style={styles.successContainer}>
          <View style={[styles.successIcon, { backgroundColor: theme.successLight }]}>
            <Ionicons name="checkmark-circle" size={64} color={theme.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.foreground }]}>Transfert reussi !</Text>
          <Text style={[styles.successText, { color: theme.mutedForeground }]}>
            {formatAmount(parseFloat(amount))} envoyes a {recipientName}
          </Text>
          {transactionRef && (
            <Text style={[styles.transactionId, { color: theme.mutedForeground }]}>Ref: {transactionRef}</Text>
          )}
          <Button onPress={resetForm} style={styles.successButton}>Nouveau transfert</Button>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN SCREEN
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {renderStepIndicator()}
          {step === 'source' && renderSourceStep()}
          {step === 'recipient' && renderRecipientStep()}
          {step === 'amount' && renderAmountStep()}
          {step === 'preview' && preview && renderPreviewStep()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  function renderStepIndicator() {
    return (
      <View style={styles.stepIndicator}>
        {stepLabels.map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, { backgroundColor: currentStepIndex >= i ? theme.primary : theme.border }]}>
              {currentStepIndex > i ? <Ionicons name="checkmark" size={12} color="#FFFFFF" /> : null}
              {currentStepIndex === i ? <Text style={styles.stepNumber}>{i + 1}</Text> : null}
            </View>
            {i < stepLabels.length - 1 && (
              <View style={[styles.stepLine, { backgroundColor: currentStepIndex > i ? theme.primary : theme.border }]} />
            )}
          </View>
        ))}
      </View>
    );
  }

  function renderSourceStep() {
    return (
      <Card style={styles.formCard}>
        <Text style={[styles.stepTitle, { color: theme.foreground }]}>Compte a debiter</Text>
        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>
          {isEditingSender ? 'Entrez le numero a debiter' : 'Votre compte sera debite'}
        </Text>
        {loadingSource ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.mutedForeground }]}>Chargement...</Text>
          </View>
        ) : (
          <View>
            {!isEditingSender ? (
              <View style={[styles.userAccountCard, { backgroundColor: theme.secondary, borderColor: theme.primary }]}>
                <View style={styles.userAccountHeader}>
                  <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
                    <Text style={styles.userAvatarText}>{user?.firstName?.charAt(0) || 'U'}</Text>
                  </View>
                  <View style={styles.userAccountInfo}>
                    <Text style={[styles.userName, { color: theme.foreground }]}>
                      {senderPhone === user?.phoneNumber ? (user?.firstName ? user.firstName + ' ' + (user?.lastName || '') : 'Mon compte') : 'Autre compte'}
                    </Text>
                    <Text style={[styles.userPhone, { color: theme.mutedForeground }]}>{senderPhone || 'Non disponible'}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsEditingSender(true)} style={[styles.editButton, { backgroundColor: theme.muted }]}>
                    <Ionicons name="pencil" size={18} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.editSenderContainer}>
                <Text style={[styles.label, { color: theme.foreground }]}>Numero a debiter</Text>
                <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <Ionicons name="call-outline" size={20} color={theme.mutedForeground} style={styles.inputIcon} />
                  <TextInput style={[styles.input, { color: theme.foreground }]} placeholder="Ex: +221 77 123 45 67" placeholderTextColor={theme.mutedForeground} value={senderPhone} onChangeText={setSenderPhone} keyboardType="phone-pad" />
                </View>
                <View style={styles.editButtonsRow}>
                  <TouchableOpacity onPress={() => { setSenderPhone(user?.phoneNumber || ''); setIsEditingSender(false); }} style={[styles.cancelEditButton, { borderColor: theme.border }]}>
                    <Text style={[styles.cancelEditText, { color: theme.mutedForeground }]}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => { setIsEditingSender(false); loadOperatorsForSender(senderPhone); }} style={[styles.confirmEditButton, { backgroundColor: theme.primary }]}>
                    <Text style={styles.confirmEditText}>Confirmer</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            {sourceOperators.length > 0 && (
              <View>
                <Text style={[styles.label, { color: theme.foreground, marginTop: 20 }]}>Envoyer depuis</Text>
                <View style={styles.sourceGrid}>
                  {sourceOperators.map((op) => {
                    const logo = getOperatorLogo(op.code);
                    const isSelected = selectedSourceOperator?.code === op.code;
                    return (
                      <TouchableOpacity key={op.code} style={[styles.sourceCard, { borderColor: isSelected ? theme.primary : theme.border, backgroundColor: isSelected ? theme.secondary : theme.surface }]} onPress={() => setSelectedSourceOperator(op)}>
                        <View style={[styles.sourceIconContainer, { backgroundColor: theme.muted }]}>
                          {logo ? <Image source={logo} style={styles.operatorLogo} /> : <Ionicons name="wallet" size={24} color={theme.primary} />}
                        </View>
                        <View style={styles.sourceInfo}>
                          <Text style={[styles.sourceName, { color: theme.foreground }]}>{op.name}</Text>
                          {isSelected && <Text style={[styles.defaultLabel, { color: theme.primary }]}>Selectionne</Text>}
                        </View>
                        {isSelected && (
                          <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
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
                <Ionicons name="wallet-outline" size={48} color={theme.mutedForeground} />
                <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>Aucun operateur disponible</Text>
              </View>
            )}
          </View>
        )}
        <Button onPress={handleNextStep} style={styles.button} disabled={!selectedSourceOperator}>Continuer</Button>
      </Card>
    );
  }


  function renderRecipientStep() {
    return (
      <Card style={styles.formCard}>
        <Text style={[styles.stepTitle, { color: theme.foreground }]}>Destinataire</Text>
        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>Entrez les informations du beneficiaire</Text>
        <Text style={[styles.label, { color: theme.foreground }]}>Pays du destinataire</Text>
        <TouchableOpacity style={[styles.countryPickerButton, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={() => setShowCountryPicker(!showCountryPicker)}>
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <View style={styles.countryPickerInfo}>
            <Text style={[styles.countryName, { color: theme.foreground }]}>{selectedCountry.name}</Text>
            <Text style={[styles.countryCode, { color: theme.mutedForeground }]}>{selectedCountry.code}</Text>
          </View>
          <Ionicons name={showCountryPicker ? 'chevron-up' : 'chevron-down'} size={20} color={theme.mutedForeground} />
        </TouchableOpacity>
        {showCountryPicker && (
          <View style={[styles.countryList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ScrollView style={styles.countryListScroll} nestedScrollEnabled>
              {COUNTRY_CODES.map((country) => (
                <TouchableOpacity key={country.country} style={[styles.countryItem, selectedCountry.country === country.country && { backgroundColor: theme.secondary }]} onPress={() => handleCountryChange(country)}>
                  <Text style={styles.countryItemFlag}>{country.flag}</Text>
                  <Text style={[styles.countryItemName, { color: theme.foreground }]}>{country.name}</Text>
                  <Text style={[styles.countryItemCode, { color: theme.mutedForeground }]}>{country.code}</Text>
                  {selectedCountry.country === country.country && <Ionicons name="checkmark" size={18} color={theme.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        <Text style={[styles.label, { color: theme.foreground }]}>Nom du destinataire</Text>
        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <Ionicons name="person-outline" size={20} color={theme.mutedForeground} style={styles.inputIcon} />
          <TextInput style={[styles.input, { color: theme.foreground }]} placeholder="Ex: Mamadou Diallo" placeholderTextColor={theme.mutedForeground} value={recipientName} onChangeText={setRecipientName} />
        </View>
        <Text style={[styles.label, { color: theme.foreground }]}>Numero de telephone</Text>
        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <View style={styles.phonePrefix}>
            <Text style={styles.phonePrefixFlag}>{selectedCountry.flag}</Text>
            <Text style={[styles.phonePrefixCode, { color: theme.foreground }]}>{selectedCountry.code}</Text>
          </View>
          <TextInput style={[styles.input, { color: theme.foreground }]} placeholder="7X XXX XX XX" placeholderTextColor={theme.mutedForeground} value={recipientPhone} onChangeText={setRecipientPhone} keyboardType="phone-pad" />
          {detectingOperator && <ActivityIndicator size="small" color={theme.primary} />}
        </View>
        {detectedDestCountry && (
          <View style={[styles.detectedInfo, { backgroundColor: theme.secondary }]}>
            <Ionicons name="checkmark-circle" size={16} color={theme.success} />
            <Text style={[styles.detectedText, { color: theme.foreground }]}>{detectedDestCountry}</Text>
          </View>
        )}
        {destOperators.length > 0 && (
          <View>
            <Text style={[styles.label, { color: theme.foreground }]}>Operateur du destinataire</Text>
            <View style={styles.destOperatorsGrid}>
              {destOperators.map((op) => {
                const logo = getOperatorLogo(op.code);
                const isSelected = selectedDestOperator?.code === op.code;
                return (
                  <TouchableOpacity key={op.code} style={[styles.destOperatorCard, { borderColor: isSelected ? theme.primary : theme.border, backgroundColor: isSelected ? theme.secondary : theme.surface }]} onPress={() => setSelectedDestOperator(op)}>
                    <View style={[styles.destOperatorLogoContainer, { backgroundColor: theme.muted }]}>
                      {logo ? <Image source={logo} style={styles.destOperatorLogo} /> : <Ionicons name="wallet" size={20} color={theme.primary} />}
                    </View>
                    <Text style={[styles.destOperatorName, { color: theme.foreground }]} numberOfLines={1}>{op.name}</Text>
                    {isSelected && (
                      <View style={[styles.destOperatorCheck, { backgroundColor: theme.primary }]}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        {destOperators.length === 0 && !detectingOperator && (
          <View style={styles.noOperatorsContainer}>
            <Ionicons name="information-circle-outline" size={24} color={theme.mutedForeground} />
            <Text style={[styles.noOperatorsText, { color: theme.mutedForeground }]}>Selectionnez un pays pour voir les operateurs</Text>
          </View>
        )}
        <View style={styles.buttonRow}>
          <Button variant="outline" onPress={handleBack} style={styles.buttonHalf}>Retour</Button>
          <Button onPress={handleNextStep} style={styles.buttonHalf} disabled={!selectedDestOperator || !recipientName.trim() || recipientPhone.length < 8}>Continuer</Button>
        </View>
      </Card>
    );
  }

  function renderAmountStep() {
    return (
      <Card style={styles.formCard}>
        <Text style={[styles.stepTitle, { color: theme.foreground }]}>Montant</Text>
        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>Combien souhaitez-vous envoyer ?</Text>
        <View style={[styles.amountCard, { backgroundColor: theme.muted }]}>
          <TextInput style={[styles.amountInput, { color: theme.foreground }]} placeholder="0" placeholderTextColor={theme.mutedForeground} value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Text style={[styles.currency, { color: theme.mutedForeground }]}>FCFA</Text>
        </View>
        <View style={styles.quickAmounts}>
          {[1000, 5000, 10000, 25000].map((value) => (
            <TouchableOpacity key={value} style={[styles.quickAmount, { borderColor: theme.border, backgroundColor: theme.surface }]} onPress={() => setAmount(value.toString())}>
              <Text style={[styles.quickAmountText, { color: theme.foreground }]}>{new Intl.NumberFormat('fr-FR').format(value)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.label, { color: theme.foreground }]}>Description (optionnel)</Text>
        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <TextInput style={[styles.input, { color: theme.foreground }]} placeholder="Ex: Remboursement" placeholderTextColor={theme.mutedForeground} value={description} onChangeText={setDescription} />
        </View>
        <View style={styles.buttonRow}>
          <Button variant="outline" onPress={handleBack} style={styles.buttonHalf}>Retour</Button>
          <Button onPress={handleNextStep} loading={loading} style={styles.buttonHalf}>Continuer</Button>
        </View>
      </Card>
    );
  }

  function renderPreviewStep() {
    if (!preview) return null;
    return (
      <Card style={styles.formCard}>
        <Text style={[styles.stepTitle, { color: theme.foreground }]}>Confirmation</Text>
        <Text style={[styles.stepSubtitle, { color: theme.mutedForeground }]}>Verifiez les details du transfert</Text>
        <View style={[styles.routeBanner, { backgroundColor: theme.secondary }]}>
          <View style={styles.routeEndpoint}>
            <Text style={[styles.routeCountry, { color: theme.foreground }]}>{preview.sourceCountry}</Text>
            <Text style={[styles.routeOperator, { color: theme.mutedForeground }]}>{preview.sourceOperatorName || selectedSourceOperator?.name}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color={theme.primary} />
          <View style={styles.routeEndpoint}>
            <Text style={[styles.routeCountry, { color: theme.foreground }]}>{preview.destCountry}</Text>
            <Text style={[styles.routeOperator, { color: theme.mutedForeground }]}>{preview.destOperatorName || selectedDestOperator?.name}</Text>
          </View>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: theme.muted }]}>
          <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Destinataire</Text>
            <Text style={[styles.summaryValue, { color: theme.foreground }]}>{recipientName}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Telephone</Text>
            <Text style={[styles.summaryValue, { color: theme.foreground }]}>{selectedCountry.code + recipientPhone}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Montant</Text>
            <Text style={[styles.summaryValue, { color: theme.foreground }]}>{formatAmount(preview.amount)}</Text>
          </View>
          <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Frais ({preview.feePercent}%)</Text>
            <Text style={[styles.summaryValue, { color: theme.foreground }]}>{formatAmount(preview.fee)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.foreground }]}>Total a payer</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>{formatAmount(preview.totalAmount)}</Text>
          </View>
        </View>
        <View style={[styles.gatewayInfo, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="shield-checkmark-outline" size={16} color={theme.success} />
          <Text style={[styles.gatewayText, { color: theme.mutedForeground }]}>Via {preview.gateway}</Text>
        </View>
        <View style={styles.buttonRow}>
          <Button variant="outline" onPress={handleBack} style={styles.buttonHalf}>Modifier</Button>
          <Button onPress={handleConfirmTransfer} loading={loading} style={styles.buttonHalf}>Confirmer</Button>
        </View>
      </Card>
    );
  }
}


const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepNumber: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  stepLine: { width: 40, height: 2, marginHorizontal: 6 },
  formCard: { padding: 20 },
  stepTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  stepSubtitle: { fontSize: 14, marginBottom: 24 },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyContainer: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, fontSize: 14 },
  userAccountCard: { padding: 16, borderRadius: 16, borderWidth: 2 },
  userAccountHeader: { flexDirection: 'row', alignItems: 'center' },
  userAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  userAvatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  userAccountInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '600' },
  userPhone: { fontSize: 14, marginTop: 2 },
  editButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  editSenderContainer: { marginBottom: 8 },
  editButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelEditButton: { flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  cancelEditText: { fontSize: 14, fontWeight: '500' },
  confirmEditButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  confirmEditText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  sourceGrid: { gap: 12, marginBottom: 24 },
  sourceCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 2 },
  sourceIconContainer: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 16, overflow: 'hidden' },
  operatorLogo: { width: 40, height: 40, borderRadius: 8 },
  sourceInfo: { flex: 1 },
  sourceName: { fontSize: 16, fontWeight: '600' },
  defaultLabel: { fontSize: 12, marginTop: 2 },
  selectedBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, paddingVertical: 14 },
  detectedInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 16, gap: 8 },
  detectedText: { fontSize: 13, fontWeight: '500' },
  countryPickerButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, borderRadius: 12, marginBottom: 16 },
  countryFlag: { fontSize: 24, marginRight: 12 },
  countryPickerInfo: { flex: 1 },
  countryName: { fontSize: 16, fontWeight: '500' },
  countryCode: { fontSize: 13, marginTop: 2 },
  countryList: { borderWidth: 1, borderRadius: 12, marginBottom: 16, maxHeight: 200, overflow: 'hidden' },
  countryListScroll: { maxHeight: 200 },
  countryItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  countryItemFlag: { fontSize: 20 },
  countryItemName: { flex: 1, fontSize: 15 },
  countryItemCode: { fontSize: 13, marginRight: 8 },
  phonePrefix: { flexDirection: 'row', alignItems: 'center', paddingRight: 12, borderRightWidth: 1, borderRightColor: '#E5E5E5', marginRight: 12 },
  phonePrefixFlag: { fontSize: 18, marginRight: 6 },
  phonePrefixCode: { fontSize: 15, fontWeight: '500' },
  destOperatorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  destOperatorCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, borderWidth: 2, minWidth: '45%', flex: 1 },
  destOperatorLogoContainer: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden' },
  destOperatorLogo: { width: 28, height: 28, borderRadius: 6 },
  destOperatorName: { fontSize: 13, fontWeight: '500', flex: 1 },
  destOperatorCheck: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 6 },
  noOperatorsContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 10, marginBottom: 16 },
  noOperatorsText: { fontSize: 13, flex: 1 },
  button: { marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  buttonHalf: { flex: 1 },
  amountCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24 },
  amountInput: { fontSize: 48, fontWeight: '700', textAlign: 'center' },
  currency: { fontSize: 18, marginTop: 8 },
  quickAmounts: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  quickAmount: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1 },
  quickAmountText: { fontSize: 14, fontWeight: '500' },
  routeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 16 },
  routeEndpoint: { alignItems: 'center', flex: 1 },
  routeCountry: { fontSize: 14, fontWeight: '600' },
  routeOperator: { fontSize: 12, marginTop: 2 },
  summaryCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  gatewayInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, borderWidth: 1, marginBottom: 8, gap: 8 },
  gatewayText: { fontSize: 13 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  successText: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  transactionId: { fontSize: 14, marginBottom: 8 },
  successButton: { width: '100%', marginTop: 24 },
});
