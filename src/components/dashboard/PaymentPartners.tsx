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
    countries?: string[];
}

const partners: Partner[] = [
    {
        id: 'feexpay',
        name: 'FeexPay',
        shortName: 'FeexPay',
        icon: 'flash',
        color: '#10B981',
        bgColor: '#D1FAE5',
        countries: ['BJ', 'TG', 'CI', 'CG'],
    },
    {
        id: 'cinetpay',
        name: 'CinetPay',
        shortName: 'CinetPay',
        icon: 'globe',
        color: '#3B82F6',
        bgColor: '#DBEAFE',
        countries: ['CI', 'SN', 'ML', 'GN', 'CM', 'BF', 'BJ', 'TG', 'NE', 'CD'],
    },
    {
        id: 'paytech',
        name: 'PayTech',
        shortName: 'PayTech',
        icon: 'card',
        color: '#8B5CF6',
        bgColor: '#EDE9FE',
        countries: ['SN', 'CI', 'ML'],
    },
    {
        id: 'mobile',
        name: 'Mobile Money',
        shortName: 'MoMo',
        icon: 'phone-portrait',
        color: '#F59E0B',
        bgColor: '#FEF3C7',
        countries: ['Tous'],
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
