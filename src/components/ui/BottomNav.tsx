import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  isMain?: boolean;
}

const navItems: NavItem[] = [
  {
    label: 'Accueil',
    href: '/(tabs)',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    label: 'Historique',
    href: '/(tabs)/history',
    icon: 'time-outline',
    iconActive: 'time',
  },
  {
    label: 'Envoyer',
    href: '/(tabs)/transfer',
    icon: 'paper-plane-outline',
    iconActive: 'paper-plane',
    isMain: true,
  },
  {
    label: 'Profil',
    href: '/(tabs)/profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
}

function NavItemComponent({ item, isActive }: NavItemComponentProps) {
  const { theme, tokens } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
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
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    router.push(item.href as any);
  };

  // Main action button (Send)
  if (item.isMain) {
    return (
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={styles.mainButtonWrapper}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <LinearGradient
            colors={['#3366FF', '#1E40AF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.mainButton,
              {
                shadowColor: '#3366FF',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 8,
              },
            ]}
          >
            <Ionicons name={isActive ? item.iconActive : item.icon} size={24} color="#FFFFFF" />
          </LinearGradient>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.navItem}
    >
      <Animated.View
        style={[
          styles.navItemContent,
          isActive && [styles.navItemActive, { backgroundColor: theme.primaryLighter }],
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Ionicons
          name={isActive ? item.iconActive : item.icon}
          size={22}
          color={isActive ? theme.primary : theme.mutedForeground}
        />
        <Text
          style={[
            styles.label,
            { color: isActive ? theme.primary : theme.mutedForeground },
            isActive && styles.labelActive,
          ]}
        >
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomNav() {
  const { theme, tokens } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/index';
    }
    return pathname.includes(href.replace('/(tabs)', ''));
  };

  // Reorder items to put main button in center
  const orderedItems = [
    navItems[0], // Accueil
    navItems[1], // Historique
    navItems[2], // Envoyer (main)
    navItems[3], // Profil
  ];

  return (
    <View style={styles.container}>
      <View style={styles.navWrapper}>
        {/* Blur background */}
        <BlurView intensity={80} tint="light" style={styles.blurView} />

        {/* Glass overlay */}
        <View style={[styles.glassOverlay, { backgroundColor: theme.surface + 'E8' }]} />

        {/* Border */}
        <View style={[styles.borderOverlay, { borderColor: theme.border + '60' }]} />

        {/* Content */}
        <View style={styles.navContent}>
          {orderedItems.map((item) => (
            <NavItemComponent key={item.href} item={item} isActive={isActive(item.href)} />
          ))}
        </View>
      </View>
    </View>
  );
}

const BORDER_RADIUS = 28;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    paddingHorizontal: 16,
  },
  navWrapper: {
    width: '100%',
    maxWidth: 380,
    height: 72,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1,
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 2,
  },
  navItemActive: {
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  labelActive: {
    fontWeight: '600',
  },
  mainButtonWrapper: {
    marginTop: -20,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
