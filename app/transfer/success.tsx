import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { useTransferStore } from '../../src/store/transferStore';

export default function SuccessScreen() {
  const { theme } = useTheme();
  const { amount, recipientName, transactionRef, resetTransfer } = useTransferStore();

  const formatAmount = (value: number) => new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';

  const handleNewTransfer = () => {
    resetTransfer();
    router.replace('/(tabs)/transfer');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.successLight }]}>
          <Ionicons name="checkmark-circle" size={64} color={theme.success} />
        </View>

        <Text style={[styles.title, { color: theme.foreground }]}>Transfert réussi !</Text>
        <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
          {formatAmount(parseFloat(amount))} envoyés à {recipientName}
        </Text>

        {transactionRef && (
          <Text style={[styles.reference, { color: theme.mutedForeground }]}>
            Réf: {transactionRef}
          </Text>
        )}

        <Button onPress={handleNewTransfer} style={styles.button}>
          Nouveau transfert
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconContainer: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 8, textAlign: 'center' },
  reference: { fontSize: 14, marginBottom: 8 },
  button: { width: '100%', marginTop: 24 },
});
