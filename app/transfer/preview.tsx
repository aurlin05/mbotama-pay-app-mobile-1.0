import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  useWindowDimensions,
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

const useResponsive = () => {
  const { width } = useWindowDimensions();
  return {
    isSmall: width < 360,
    isMedium: width >= 360 && width < 400,
  };
};

export default function PreviewScreen() {
  const { theme } = useTheme();
  const responsive = useResponsive();
  const { user } = useAuthStore();
  const {
    senderPhone,
    selectedSourceOperator,
    selectedCountry,
    recipientPhone,
    recipientName,
    selectedDestOperator,
    amount,
    description,
    preview,
    setTransactionRef,
  } = useTransferStore();

  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const formatAmount = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

  const handleConfirm = async () => {
    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/transfer/success');
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', 'Le transfert a échoué');
      }
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.response?.data?.message || 'Le transfert a échoué');
    } finally {
      setLoading(false);
    }
  };

  if (!preview) {
    router.back();
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Progress */}
          <StepIndicator currentStep={3} />

          <Card variant="elevated" style={StyleSheet.flatten([styles.formCard, responsive.isSmall && styles.formCardSmall])}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconContainer, { backgroundColor: theme.successLight }]}>
                <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={[styles.title, { color: theme.foreground }]}>Confirmation</Text>
                <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
                  Vérifiez les détails
                </Text>
              </View>
            </View>

            {/* Route Banner */}
            <View style={[styles.routeBanner, { backgroundColor: theme.secondary }]}>
              <View style={styles.routeEndpoint}>
                <Text style={[styles.routeCountry, { color: theme.foreground }]}>
                  {preview.sourceCountry}
                </Text>
                <Text style={[styles.routeOperator, { color: theme.mutedForeground }]}>
                  {preview.sourceOperatorName || selectedSourceOperator?.name}
                </Text>
              </View>
              <View style={[styles.routeArrow, { backgroundColor: theme.primary }]}>
                <Ionicons name="arrow-forward" size={16} color="#FFF" />
              </View>
              <View style={styles.routeEndpoint}>
                <Text style={[styles.routeCountry, { color: theme.foreground }]}>
                  {preview.destCountry}
                </Text>
                <Text style={[styles.routeOperator, { color: theme.mutedForeground }]}>
                  {preview.destOperatorName || selectedDestOperator?.name}
                </Text>
              </View>
            </View>

            {/* Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.muted }]}>
              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Destinataire</Text>
                <Text style={[styles.summaryValue, { color: theme.foreground }]}>{recipientName}</Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Téléphone</Text>
                <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                  {selectedCountry.code} {recipientPhone}
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>Montant</Text>
                <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                  {formatAmount(preview.amount)}
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.summaryLabel, { color: theme.mutedForeground }]}>
                  Frais ({preview.feePercent}%)
                </Text>
                <Text style={[styles.summaryValue, { color: theme.foreground }]}>
                  {formatAmount(preview.fee)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: theme.foreground }]}>Total à payer</Text>
                <Text style={[styles.totalValue, { color: theme.primary }]}>
                  {formatAmount(preview.totalAmount)}
                </Text>
              </View>
            </View>

            {/* Gateway Info */}
            <View style={[styles.gatewayInfo, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons name="shield-checkmark-outline" size={16} color={theme.success} />
              <Text style={[styles.gatewayText, { color: theme.mutedForeground }]}>
                Sécurisé via {preview.gateway}
              </Text>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <Button variant="outline" onPress={() => router.back()} style={styles.buttonHalf}>
                Modifier
              </Button>
              <Button onPress={handleConfirm} loading={loading} style={styles.buttonHalf}>
                Confirmer
              </Button>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16 },
  formCard: { padding: 20, borderRadius: 20 },
  formCardSmall: { padding: 16, borderRadius: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  cardIconContainer: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  cardHeaderText: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  subtitle: { fontSize: 14 },
  routeBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 14, marginBottom: 16 },
  routeEndpoint: { alignItems: 'center', flex: 1 },
  routeCountry: { fontSize: 14, fontWeight: '600' },
  routeOperator: { fontSize: 12, marginTop: 2 },
  routeArrow: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  summaryCard: { borderRadius: 16, padding: 16, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  summaryLabel: { fontSize: 14 },
  summaryValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 16 },
  totalLabel: { fontSize: 16, fontWeight: '600' },
  totalValue: { fontSize: 20, fontWeight: '700' },
  gatewayInfo: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20, gap: 8 },
  gatewayText: { fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  buttonHalf: { flex: 1 },
});
