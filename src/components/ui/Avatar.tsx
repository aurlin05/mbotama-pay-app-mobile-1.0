import React from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../hooks/useTheme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
  gradient?: boolean;
  gradientColors?: string[];
}

export function Avatar({
  source,
  name,
  size = 'md',
  style,
  showBadge = false,
  badgeColor,
  gradient = true,
  gradientColors,
}: AvatarProps) {
  const { theme, tokens } = useTheme();

  const sizeValue = tokens.components.avatar.size[size];
  const fontSize = sizeValue * 0.4;
  const badgeSize = Math.max(sizeValue * 0.25, 10);
  const borderRadius = sizeValue * 0.3;

  const getInitials = () => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const colors = gradientColors || ['#3366FF', '#1E40AF'];

  const containerStyle: ViewStyle = {
    width: sizeValue,
    height: sizeValue,
    borderRadius,
  };

  if (source) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image
          source={{ uri: source }}
          style={[styles.image, { borderRadius }]}
          resizeMode="cover"
        />
        {showBadge && (
          <View
            style={[
              styles.badge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                backgroundColor: badgeColor || theme.success,
                borderColor: theme.surface,
              },
            ]}
          />
        )}
      </View>
    );
  }

  if (gradient) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <LinearGradient
          colors={colors as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderRadius }]}
        >
          <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
        </LinearGradient>
        {showBadge && (
          <View
            style={[
              styles.badge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                backgroundColor: badgeColor || theme.success,
                borderColor: theme.surface,
              },
            ]}
          />
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        styles.fallback,
        containerStyle,
        { backgroundColor: theme.muted },
        style,
      ]}
    >
      <Ionicons name="person" size={fontSize * 1.2} color={theme.mutedForeground} />
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor || theme.success,
              borderColor: theme.surface,
            },
          ]}
        />
      )}
    </View>
  );
}

// Avatar Group
interface AvatarGroupProps {
  avatars: Array<{ source?: string; name?: string }>;
  max?: number;
  size?: AvatarSize;
}

export function AvatarGroup({ avatars, max = 4, size = 'sm' }: AvatarGroupProps) {
  const { theme, tokens } = useTheme();
  const sizeValue = tokens.components.avatar.size[size];
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <View style={styles.groupContainer}>
      {displayAvatars.map((avatar, index) => (
        <View
          key={index}
          style={[
            styles.groupItem,
            { marginLeft: index > 0 ? -sizeValue * 0.3 : 0, zIndex: displayAvatars.length - index },
          ]}
        >
          <Avatar
            source={avatar.source}
            name={avatar.name}
            size={size}
            style={{ borderWidth: 2, borderColor: theme.surface }}
          />
        </View>
      ))}
      {remaining > 0 && (
        <View
          style={[
            styles.groupItem,
            styles.remainingBadge,
            {
              width: sizeValue,
              height: sizeValue,
              borderRadius: sizeValue * 0.3,
              backgroundColor: theme.muted,
              marginLeft: -sizeValue * 0.3,
              borderWidth: 2,
              borderColor: theme.surface,
            },
          ]}
        >
          <Text style={[styles.remainingText, { color: theme.foreground, fontSize: sizeValue * 0.35 }]}>
            +{remaining}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
  groupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupItem: {
    position: 'relative',
  },
  remainingBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingText: {
    fontWeight: '600',
  },
});
