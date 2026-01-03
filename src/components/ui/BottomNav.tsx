import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { usePathname, router } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
}

const navItems: NavItem[] = [
  {
    label: 'Accueil',
    href: '/(tabs)',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    label: 'Envoyer',
    href: '/(tabs)/transfer',
    icon: 'send-outline',
    iconActive: 'send',
  },
  {
    label: 'Historique',
    href: '/(tabs)/history',
    icon: 'time-outline',
    iconActive: 'time',
  },
  {
    label: 'Profil',
    href: '/(tabs)/profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

export function BottomNav() {
  const { theme } = useTheme();
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/(tabs)') {
      return pathname === '/' || pathname === '/(tabs)' || pathname === '/index';
    }
    return pathname.includes(href.replace('/(tabs)', ''));
  };

  return (
    <View style={styles.container}>
      <View style={styles.navWrapper}>
        {/* Blur background */}
        <BlurView 
          intensity={100} 
          tint="light" 
          style={styles.blurView}
        />
        
        {/* Semi-transparent overlay */}
        <View style={styles.glassOverlay} />
        
        {/* Border */}
        <View style={styles.borderOverlay} />
        
        {/* Content */}
        <View style={styles.navContent}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <TouchableOpacity
                key={item.href}
                style={[
                  styles.navItem,
                  active && styles.navItemActive,
                ]}
                onPress={() => router.push(item.href as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={active ? item.iconActive : item.icon}
                  size={22}
                  color={active ? theme.primary : theme.mutedForeground}
                  style={active ? styles.iconActive : undefined}
                />
                <Text
                  style={[
                    styles.label,
                    { color: active ? theme.primary : theme.mutedForeground },
                    active && styles.labelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const BORDER_RADIUS = 35;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
    paddingHorizontal: 20,
  },
  navWrapper: {
    width: '100%',
    maxWidth: 350,
    height: 68,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    // Shadow
    shadowColor: '#3366FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: BORDER_RADIUS,
  },
  borderOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BORDER_RADIUS,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  navContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS - 8,
    gap: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  iconActive: {
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  labelActive: {
    fontWeight: '600',
  },
});
