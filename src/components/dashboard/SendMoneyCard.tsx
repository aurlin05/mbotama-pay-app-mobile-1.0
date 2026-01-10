import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

export function SendMoneyCard() {
    const { tokens } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const arrowAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Subtle pulse animation
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        // Arrow animation
        const arrow = Animated.loop(
            Animated.sequence([
                Animated.timing(arrowAnim, {
                    toValue: 8,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(arrowAnim, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        arrow.start();

        return () => {
            pulse.stop();
            arrow.stop();
        };
    }, []);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 8,
            tension: 300,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 200,
            useNativeDriver: true,
        }).start();
    };

    const handlePress = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch { }
        router.push('/(tabs)/transfer');
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                    <LinearGradient
                        colors={['#3366FF', '#1E40AF', '#1E3A8A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.gradient, { borderRadius: tokens.borderRadius['2xl'] }]}
                    >
                        {/* Decorative elements */}
                        <View style={styles.decorCircle1} />
                        <View style={styles.decorCircle2} />

                        <View style={styles.content}>
                            <View style={styles.iconContainer}>
                                <View style={styles.iconWrapper}>
                                    <Ionicons name="paper-plane" size={32} color="#FFFFFF" />
                                </View>
                            </View>

                            <View style={styles.textContainer}>
                                <Text style={styles.title}>Envoyer de l'argent</Text>
                                <Text style={styles.subtitle}>
                                    Transfert rapide via Wave, Orange Money, MTN
                                </Text>
                            </View>

                            <Animated.View
                                style={[
                                    styles.arrowContainer,
                                    { transform: [{ translateX: arrowAnim }] },
                                ]}
                            >
                                <View style={styles.arrowWrapper}>
                                    <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                                </View>
                            </Animated.View>
                        </View>
                    </LinearGradient>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    gradient: {
        overflow: 'hidden',
        minHeight: 100,
    },
    decorCircle1: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        top: -60,
        right: -40,
    },
    decorCircle2: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        bottom: -30,
        left: -20,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        gap: 16,
    },
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.85)',
        lineHeight: 18,
    },
    arrowContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    arrowWrapper: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
