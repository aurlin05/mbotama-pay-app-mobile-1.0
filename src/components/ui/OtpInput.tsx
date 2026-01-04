import React, { useRef, useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Pressable, Animated, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';
import { OTP_LENGTH } from '../../constants/config';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  value,
  onChange,
  length = OTP_LENGTH,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const { theme, tokens } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const cellAnims = useRef(Array.from({ length }, () => new Animated.Value(0))).current;

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  useEffect(() => {
    // Animate cells when value changes
    const currentLength = value.length;
    if (currentLength > 0 && currentLength <= length) {
      Animated.spring(cellAnims[currentLength - 1], {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    }
  }, [value]);

  const handlePress = () => {
    inputRef.current?.focus();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    if (cleaned.length > value.length) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onChange(cleaned);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}>
        {Array.from({ length }).map((_, index) => {
          const char = value[index] || '';
          const isActive = focused && index === value.length;
          const isFilled = char !== '';
          const isPast = index < value.length;

          const cellScale = cellAnims[index].interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.05],
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.cellWrapper,
                { transform: [{ scale: isFilled ? cellScale : 1 }] },
              ]}
            >
              {isFilled ? (
                <LinearGradient
                  colors={error ? [theme.destructive, theme.destructiveDark] : ['#3366FF', '#1E40AF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.cell, styles.cellFilled]}
                >
                  <Text style={styles.cellTextFilled}>{char}</Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.cell,
                    {
                      backgroundColor: theme.surface,
                      borderColor: error
                        ? theme.destructive
                        : isActive
                        ? theme.primary
                        : theme.border,
                      borderWidth: isActive ? 2 : 1.5,
                    },
                  ]}
                >
                  {isActive && (
                    <Animated.View
                      style={[
                        styles.cursor,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                  )}
                </View>
              )}
            </Animated.View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        caretHidden
      />
    </Pressable>
  );
}

// Cursor blink animation component
function BlinkingCursor({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const blink = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.cursor,
        { backgroundColor: color, opacity },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  cellWrapper: {},
  cell: {
    width: 52,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cellTextFilled: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cursor: {
    width: 2,
    height: 28,
    borderRadius: 1,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});
