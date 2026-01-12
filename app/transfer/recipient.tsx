import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  KeyboardAvoidingView,
  Platform,
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
import { transferService } from '../../src/services/transfer';
import { COUNTRY_CODES } from '../../src/constants/config';
import { getOperatorLogo } from '../../src/constants/operatorLogos';

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

export default function RecipientScreen() {
  const { theme } = useTheme();
  const responsive = useResponsive();
  const {
    recipientPhone, setRecipientPhone,
    recipientName, setRecipientName,
    selectedCountry, setSelectedCountry,
    destOperators, setDestOperators,
    selectedDestOperator, setSelectedDestOperator,
    setDetectedDestCountry,
  } = useTransferStore();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [detectingOperator, setDetectingOperator] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    loadOperatorsForCountry(selectedCountry.country);
  }, []);

  const loadOperatorsForCountry = async (countryCode: string) => {
    setDetectingOperator(true);
    try {
      const response = await transferService.getOperatorsByCountry(countryCode);
      if (response.success && response.data?.operators) {
        setDestOperators(response.data.operators);
        setDetectedDestCountry(response.data.country?.name || null);
        setSelectedDestOperator(response.data.operators[0] || null);
      }
    } catch {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (recipientPhone.length >= 8) detectDestinationOperator(recipientPhone);
    }, 500);
    return () => clearTimeout(timer);
  }, [recipientPhone, detectDestinationOperator]);

  const handleCountryChange = (country: typeof COUNTRY_CODES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCountry(country);
    setShowCountryPicker(false);
    setSelectedDestOperator(null);
    loadOperatorsForCountry(country.country);
  };

  const handleSelectOperator = (op: typeof destOperators[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDestOperator(op);
  };

  const handleNext = () => {
    if (!recipientPhone || recipientPhone.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro valide');
      return;
    }
    if (!recipientName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom du destinataire');
      return;
    }
    if (!selectedDestOperator) {
      Alert.alert('Erreur', 'Veuillez sélectionner un opérateur');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/transfer/amount');
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
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Progress */}
            <StepIndicator currentStep={1} />

            <Card variant="elevated" style={StyleSheet.flatten([styles.formCard, responsive.isSmall && styles.formCardSmall])}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: theme.primaryLighter }]}>
                  <Ionicons name="person-outline" size={24} color={theme.primary} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text style={[styles.title, { color: theme.foreground }, responsive.isSmall && styles.titleSmall]}>
                    Destinataire
                  </Text>
                  <Text style={[styles.subtitle, { color: theme.mutedForeground }, responsive.isSmall && styles.subtitleSmall]}>
                    Informations du bénéficiaire
                  </Text>
                </View>
              </View>

              {/* Country Picker */}
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.foreground }]}>
                  <Ionicons name="globe-outline" size={14} color={theme.mutedForeground} /> Pays
                </Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.pickerButton, 
                    { 
                      borderColor: showCountryPicker ? theme.primary : theme.border, 
                      backgroundColor: theme.surface 
                    }
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCountryPicker(!showCountryPicker);
                  }}
                >
                  <Text style={[styles.flag, responsive.isSmall && styles.flagSmall]}>{selectedCountry.flag}</Text>
                  <View style={styles.pickerInfo}>
                    <Text style={[styles.countryName, { color: theme.foreground }, responsive.isSmall && styles.countryNameSmall]}>
                      {selectedCountry.name}
                    </Text>
                    <Text style={[styles.countryCode, { color: theme.mutedForeground }]}>{selectedCountry.code}</Text>
                  </View>
                  <View style={[styles.chevronContainer, { backgroundColor: theme.muted }]}>
                    <Ionicons name={showCountryPicker ? 'chevron-up' : 'chevron-down'} size={18} color={theme.mutedForeground} />
                  </View>
                </TouchableOpacity>

                {showCountryPicker && (
                  <Animated.View style={[styles.countryList, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <ScrollView style={styles.countryScroll} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {COUNTRY_CODES.map((country) => (
                        <TouchableOpacity
                          key={country.country}
                          style={[
                            styles.countryItem, 
                            selectedCountry.country === country.country && { backgroundColor: theme.secondary }
                          ]}
                          onPress={() => handleCountryChange(country)}
                        >
                          <Text style={styles.countryItemFlag}>{country.flag}</Text>
                          <Text style={[styles.countryItemName, { color: theme.foreground }]}>{country.name}</Text>
                          <Text style={[styles.countryItemCode, { color: theme.mutedForeground }]}>{country.code}</Text>
                          {selectedCountry.country === country.country && (
                            <View style={[styles.countryCheck, { backgroundColor: theme.primary }]}>
                              <Ionicons name="checkmark" size={12} color="#FFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </Animated.View>
                )}
              </View>

              {/* Recipient Name */}
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.foreground }]}>
                  <Ionicons name="person-outline" size={14} color={theme.mutedForeground} /> Nom complet
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    borderColor: recipientName ? theme.primary : theme.border, 
                    backgroundColor: theme.surface 
                  }
                ]}>
                  <View style={[styles.inputIconContainer, { backgroundColor: theme.muted }]}>
                    <Ionicons name="person" size={18} color={theme.mutedForeground} />
                  </View>
                  <TextInput
                    style={[styles.input, { color: theme.foreground }, responsive.isSmall && styles.inputSmall]}
                    placeholder="Ex: Mamadou Diallo"
                    placeholderTextColor={theme.mutedForeground}
                    value={recipientName}
                    onChangeText={setRecipientName}
                  />
                  {recipientName.length > 0 && (
                    <TouchableOpacity onPress={() => setRecipientName('')}>
                      <Ionicons name="close-circle" size={20} color={theme.mutedForeground} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputSection}>
                <Text style={[styles.label, { color: theme.foreground }]}>
                  <Ionicons name="call-outline" size={14} color={theme.mutedForeground} /> Numéro de téléphone
                </Text>
                <View style={[
                  styles.inputContainer, 
                  { 
                    borderColor: recipientPhone.length >= 8 ? theme.primary : theme.border, 
                    backgroundColor: theme.surface 
                  }
                ]}>
                  <View style={[styles.phonePrefix, { borderRightColor: theme.border }]}>
                    <Text style={styles.phonePrefixFlag}>{selectedCountry.flag}</Text>
                    <Text style={[styles.phonePrefixCode, { color: theme.foreground }]}>{selectedCountry.code}</Text>
                  </View>
                  <TextInput
                    style={[styles.input, { color: theme.foreground }, responsive.isSmall && styles.inputSmall]}
                    placeholder="7X XXX XX XX"
                    placeholderTextColor={theme.mutedForeground}
                    value={recipientPhone}
                    onChangeText={setRecipientPhone}
                    keyboardType="phone-pad"
                  />
                  {detectingOperator && <ActivityIndicator size="small" color={theme.primary} />}
                </View>
              </View>

              {/* Operators */}
              {destOperators.length > 0 && (
                <View style={styles.inputSection}>
                  <Text style={[styles.label, { color: theme.foreground }]}>
                    <Ionicons name="wallet-outline" size={14} color={theme.mutedForeground} /> Opérateur
                  </Text>
                  <View style={[styles.operatorsGrid, responsive.isSmall && styles.operatorsGridSmall]}>
                    {destOperators.map((op) => {
                      const logo = getOperatorLogo(op.code);
                      const isSelected = selectedDestOperator?.code === op.code;
                      return (
                        <TouchableOpacity
                          key={op.code}
                          activeOpacity={0.7}
                          style={[
                            styles.operatorCard,
                            responsive.isSmall && styles.operatorCardSmall,
                            { 
                              borderColor: isSelected ? theme.primary : theme.border, 
                              backgroundColor: isSelected ? theme.secondary : theme.surface,
                              shadowColor: isSelected ? theme.primary : 'transparent',
                              shadowOpacity: isSelected ? 0.15 : 0,
                            }
                          ]}
                          onPress={() => handleSelectOperator(op)}
                        >
                          <View style={[
                            styles.operatorLogo, 
                            { backgroundColor: isSelected ? theme.primaryLighter : theme.muted },
                            responsive.isSmall && styles.operatorLogoSmall
                          ]}>
                            {logo ? (
                              <Image source={logo} style={[styles.logoImage, responsive.isSmall && styles.logoImageSmall]} />
                            ) : (
                              <Ionicons name="wallet" size={responsive.isSmall ? 16 : 18} color={theme.primary} />
                            )}
                          </View>
                          <Text 
                            style={[
                              styles.operatorName, 
                              { color: theme.foreground },
                              responsive.isSmall && styles.operatorNameSmall
                            ]} 
                            numberOfLines={1}
                          >
                            {op.name}
                          </Text>
                          {isSelected && (
                            <View style={[styles.checkBadge, { backgroundColor: theme.primary }]}>
                              <Ionicons name="checkmark" size={10} color="#FFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {destOperators.length === 0 && !detectingOperator && (
                <View style={[styles.emptyOperators, { backgroundColor: theme.muted }]}>
                  <Ionicons name="information-circle-outline" size={24} color={theme.mutedForeground} />
                  <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                    Sélectionnez un pays pour voir les opérateurs
                  </Text>
                </View>
              )}

              <Button 
                onPress={handleNext} 
                style={styles.button} 
                disabled={!selectedDestOperator || !recipientName.trim() || recipientPhone.length < 8}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Continuer</Text>
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
  formCard: { padding: 20, borderRadius: 20 },
  formCardSmall: { padding: 16, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  cardIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardHeaderText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  titleSmall: { fontSize: 18 },
  subtitle: { fontSize: 14 },
  subtitleSmall: { fontSize: 12 },
  inputSection: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  pickerButton: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 2, borderRadius: 14 },
  flag: { fontSize: 28, marginRight: 12 },
  flagSmall: { fontSize: 24 },
  pickerInfo: { flex: 1 },
  countryName: { fontSize: 16, fontWeight: '600' },
  countryNameSmall: { fontSize: 14 },
  countryCode: { fontSize: 13, marginTop: 2 },
  chevronContainer: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  countryList: { borderWidth: 1, borderRadius: 14, marginTop: 8, maxHeight: 220, overflow: 'hidden' },
  countryScroll: { maxHeight: 220 },
  countryItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  countryItemFlag: { fontSize: 22 },
  countryItemName: { flex: 1, fontSize: 15, fontWeight: '500' },
  countryItemCode: { fontSize: 13, marginRight: 8 },
  countryCheck: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderRadius: 14, paddingRight: 14, overflow: 'hidden' },
  inputIconContainer: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 2 },
  input: { flex: 1, fontSize: 16, paddingVertical: 14, paddingHorizontal: 12 },
  inputSmall: { fontSize: 14, paddingVertical: 12 },
  phonePrefix: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, borderRightWidth: 1, marginRight: 4 },
  phonePrefixFlag: { fontSize: 18, marginRight: 6 },
  phonePrefixCode: { fontSize: 15, fontWeight: '600' },
  operatorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  operatorsGridSmall: { gap: 8 },
  operatorCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, borderWidth: 2, minWidth: '47%', flex: 1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2 },
  operatorCardSmall: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10 },
  operatorLogo: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10, overflow: 'hidden' },
  operatorLogoSmall: { width: 30, height: 30, borderRadius: 8, marginRight: 8 },
  logoImage: { width: 30, height: 30, borderRadius: 8 },
  logoImageSmall: { width: 24, height: 24, borderRadius: 6 },
  operatorName: { fontSize: 13, fontWeight: '600', flex: 1 },
  operatorNameSmall: { fontSize: 12 },
  checkBadge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginLeft: 4 },
  emptyOperators: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 12, marginBottom: 8 },
  emptyText: { fontSize: 13, flex: 1 },
  button: { marginTop: 16 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
