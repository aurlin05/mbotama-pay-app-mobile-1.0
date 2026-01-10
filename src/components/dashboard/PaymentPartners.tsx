import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface Partner {
    id: string;
    name: string;
    shortName: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bgColor: string;
}

const partners: Partner[] = [
    {
        id: 'wave',
        name: 'Wave',
        shortName: 'Wave',
        icon: 'water',
        color: '#1DC4E9',
        bgColor: '#E6F9FD',
    },
    {
        id: 'orange',
        name: 'Orange Money',
        shortName: 'OM',
        icon: 'phone-portrait',
        color: '#FF6600',
        bgColor: '#FFF0E6',
    },
    {
        id: 'mtn',
        name: 'MTN Mobile Money',
        shortName: 'MTN',
        icon: 'wallet',
        color: '#FFCC00',
        bgColor: '#FFFAE6',
    },
    {
        id: 'bank',
        name: 'Banques',
        shortName: 'Banque',
        icon: 'business',
        color: '#6366F1',
        bgColor: '#EEF2FF',
    },
];

interface PartnerItemProps {
    partner: Partner;
    index: number;
}

function PartnerItem({ partner, index }: PartnerItemProps) {
    const { theme, tokens } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 80,
            useNativeDriver: true,
        }).start();
    }, [index]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch { }
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={styles.partnerWrapper}
        >
            <Animated.View
                style={[
                    styles.partnerItem,
                    {
                        backgroundColor: theme.surface,
                        ...tokens.shadows.sm,
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <View style={[styles.partnerIcon, { backgroundColor: partner.bgColor }]}>
                    <Ionicons name={partner.icon} size={22} color={partner.color} />
                </View>
                <Text
                    style={[styles.partnerName, { color: theme.foreground }]}
                    numberOfLines={1}
                >
                    {partner.shortName}
                </Text>
            </Animated.View>
        </Pressable>
    );
}

export function PaymentPartners() {
    const { theme } = useTheme();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.mutedForeground }]}>
                    Nos partenaires de paiement
                </Text>
            </View>
            <View style={styles.partnersGrid}>
                {partners.map((partner, index) => (
                    <PartnerItem key={partner.id} partner={partner} index={index} />
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
    },
    header: {
        marginBottom: 12,
    },
    title: {
        fontSize: 13,
        fontWeight: '500',
    },
    partnersGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    partnerWrapper: {
        flex: 1,
    },
    partnerItem: {
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        gap: 8,
    },
    partnerIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    partnerName: {
        fontSize: 12,
        fontWeight: '600',
        textAlign: 'center',
    },
});
