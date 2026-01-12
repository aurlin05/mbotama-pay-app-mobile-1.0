import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Animated,
  ViewToken,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks/useTheme';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  gradient: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'send',
    title: 'Envoyez de l\'argent\nfacilement',
    description: 'Transférez de l\'argent vers la RDC en quelques secondes, directement depuis votre téléphone.',
    gradient: ['#3366FF', '#1E40AF'],
  },
  {
    id: '2',
    icon: 'shield-checkmark',
    title: 'Sécurisé et\nfiable',
    description: 'Vos transactions sont protégées par un cryptage de niveau bancaire. Votre argent est en sécurité.',
    gradient: ['#22C55E', '#15803D'],
  },
  {
    id: '3',
    icon: 'flash',
    title: 'Rapide et\nabordable',
    description: 'Des frais transparents et des transferts instantanés. Pas de surprises, pas d\'attente.',
    gradient: ['#F59E0B', '#D97706'],
  },
  {
    id: '4',
    icon: 'people',
    title: 'Rejoignez la\ncommunauté',
    description: 'Des milliers de personnes font confiance à MBotamaPay pour envoyer de l\'argent à leurs proches.',
    gradient: ['#8B5CF6', '#6D28D9'],
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { tokens } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;


  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems[0]) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}

    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const handleSkip = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    onComplete();
  };

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.4, 1, 0.4],
      extrapolate: 'clamp',
    });

    const translateY = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, 50],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <LinearGradient
          colors={item.gradient as any}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Cercles décoratifs */}
          <View style={[styles.circle, styles.circle1]} />
          <View style={[styles.circle, styles.circle2]} />
          <View style={[styles.circle, styles.circle3]} />

          <View style={styles.slideContent}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale }, { translateY }],
                  opacity,
                },
              ]}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name={item.icon} size={64} color={item.gradient[0]} />
              </View>
            </Animated.View>

            <Animated.View
              style={[
                styles.textContainer,
                {
                  opacity,
                  transform: [{ translateY }],
                },
              ]}
            >
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {slides.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const dotOpacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity: dotOpacity,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };


  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        {renderPagination()}

        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 ? (
            <>
              <Button variant="ghost" onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>Passer</Text>
              </Button>
              <Button
                variant="default"
                onPress={handleNext}
                style={styles.nextButton}
              >
                Suivant
              </Button>
            </>
          ) : (
            <Button
              variant="gradient"
              onPress={handleNext}
              style={styles.startButton}
              gradientColors={['#3366FF', '#1E40AF']}
            >
              Commencer
            </Button>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    height: height * 0.75,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 50,
    left: -80,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height * 0.3,
    right: -50,
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 40,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3366FF',
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    flex: 1,
    marginRight: 12,
  },
  skipText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3366FF',
  },
  startButton: {
    width: '100%',
  },
});
