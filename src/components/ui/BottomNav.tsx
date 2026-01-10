import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../hooks/useTheme';

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const navItems: NavItem[] = [
  { label: 'Accueil', href: '/(tabs)', icon: 'home-outline', iconActive: 'home' },
  { label: 'Envoyer', href: '/(tabs)/transfer', icon: 'paper-plane-outline', iconActive: 'paper-plane' },
  { label: 'Historique', href: '/(tabs)/history', icon: 'time-outline', iconActive: 'time' },
  { label: 'Profil', href: '/(tabs)/profile', icon: 'person-outline', iconActive: 'person' },
];

function NavItemComponent({ item, isActive, isDark }: { item: NavItem; isActive: boolean; isDark: boolean }) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, friction: 8, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  const handlePress = async () => {
    try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    router.push(item.href as any);
  };

  const activeIconBg = isDark ? 'rgba(92, 133, 255, 0.25)' : 'rgba(51, 102, 255, 0.15)';
  const inactiveColor = isDark ? 'rgba(148, 163, 184, 0.9)' : 'rgba(100, 116, 139, 0.8)';

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={styles.navItem}>
      <Animated.View style={[styles.navItemInner, { transform: [{ scale: scaleAnim }] }]}>
        <View style={[styles.iconWrap, isActive && { backgroundColor: activeIconBg }]}>
          <Ionicons
            name={isActive ? item.iconActive : item.icon}
            size={22}
            color={isActive ? theme.primary : inactiveColor}
          />
        </View>
        <Text style={[styles.label, { color: isActive ? theme.primary : inactiveColor }, isActive && styles.labelActive]}>
          {item.label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomNav() {
  const { isDark } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/(tabs)') return pathname === '/' || pathname === '/(tabs)' || pathname === '/index';
    return pathname.includes(href.replace('/(tabs)', ''));
  };

  // Mode light: fond blanc pur avec ombre forte pour se démarquer
  // Mode dark: fond sombre bleuté semi-transparent
  const glassColor = isDark 
    ? 'rgba(15, 23, 42, 0.85)'
    : 'rgba(255, 255, 255, 0.95)';
  
  const borderColor = isDark 
    ? 'rgba(51, 65, 85, 0.6)'
    : 'rgba(226, 232, 240, 1)'; // Bordure visible en light

  const shadowColor = isDark ? '#000' : '#1E293B';
  const shadowOpacity = isDark ? 0.3 : 0.12;

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, { shadowColor, shadowOpacity }]}>
        {/* Blur effect */}
        <BlurView intensity={isDark ? 50 : 80} tint={isDark ? 'dark' : 'light'} style={styles.blur} />
        
        {/* Fond glass */}
        <View style={[styles.glassOverlay, { backgroundColor: glassColor }]} />
        
        {/* Bordure */}
        <View style={[styles.innerBorder, { borderColor }]} />
        
        {/* Contenu */}
        <View style={styles.navContent}>
          {navItems.map((item) => (
            <NavItemComponent key={item.href} item={item} isActive={isActive(item.href)} isDark={isDark} />
          ))}
        </View>
      </View>
    </View>
  );
}

const RADIUS = 32;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 30 : 22,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 50,
  },
  navBar: {
    width: '100%',
    maxWidth: 380,
    height: 76,
    borderRadius: RADIUS,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 20,
    elevation: 15,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  innerBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: RADIUS,
    borderWidth: 1,
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  navItemInner: {
    alignItems: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '600',
  },
});
