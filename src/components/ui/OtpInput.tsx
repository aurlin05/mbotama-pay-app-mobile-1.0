import React, { useRef, useState } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { useColors } from '../../hooks/useColors';
import { OTP_LENGTH } from '../../constants/config';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OtpInput({ value, onChange, length = OTP_LENGTH }: OtpInputProps) {
  const colors = useColors();
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, length);
    onChange(cleaned);
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.container}>
        {Array.from({ length }).map((_, index) => {
          const char = value[index] || '';
          const isActive = focused && index === value.length;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                {
                  backgroundColor: colors.surface,
                  borderColor: isActive ? colors.primary : char ? colors.primaryLight : colors.border,
                  borderWidth: isActive ? 2 : 1,
                },
              ]}
            >
              <TextInput
                style={[styles.cellText, { color: colors.text }]}
                value={char}
                editable={false}
              />
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={length}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  cell: {
    width: 48,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 24,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});
