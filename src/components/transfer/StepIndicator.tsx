import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

interface StepIndicatorProps {
  currentStep: number;
  steps?: string[];
}

const DEFAULT_STEPS = ['Source', 'Destinataire', 'Montant', 'Confirmation'];

export function StepIndicator({ currentStep, steps = DEFAULT_STEPS }: StepIndicatorProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > index;
        const isCurrent = currentStep === index;
        const isActive = isCompleted || isCurrent;

        return (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={12} color="#FFF" />
              ) : (
                <Text style={styles.stepNumber}>{index + 1}</Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: isCompleted ? theme.primary : theme.border },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepLine: {
    width: 40,
    height: 2,
    marginHorizontal: 6,
  },
});
