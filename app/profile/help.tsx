import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
  Linking,
  TextInput,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';

// Responsive breakpoints
const useResponsive = () => {
  const { width } = useWindowDimensions();
  return {
    isSmall: width < 360,
    isMedium: width >= 360 && width < 400,
    isLarge: width >= 400,
    width,
    // Calculate topic card width based on screen size
    topicCardWidth: Math.floor((width - 32 - 12) / 2), // padding (16*2) + gap (12)
  };
};

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'Comment effectuer un transfert ?',
    answer: 'Allez dans l\'onglet "Transfert", entrez le numéro du destinataire, le montant et confirmez. Le transfert sera effectué instantanément.',
  },
  {
    question: 'Quels sont les frais de transfert ?',
    answer: 'Les frais varient selon le montant et la destination. Vous verrez toujours le détail des frais avant de confirmer votre transfert.',
  },
  {
    question: 'Comment vérifier mon identité (KYC) ?',
    answer: 'Allez dans Profil > Vérification KYC, puis téléchargez une photo de votre pièce d\'identité et un selfie. La vérification prend généralement 24-48h.',
  },
  {
    question: 'Quelles sont les limites de transfert ?',
    answer: 'Sans KYC: 50 000 FCFA/mois. Niveau 1: 100 000 FCFA/mois. Niveau 2: Illimité.',
  },
  {
    question: 'Comment contacter le support ?',
    answer: 'Vous pouvez nous contacter par email à support@mbotamapay.com ou via WhatsApp au +221 XXX XXX XXX.',
  },
  {
    question: 'Mon transfert a échoué, que faire ?',
    answer: 'Si votre transfert a échoué, le montant sera automatiquement remboursé sous 24h. Si ce n\'est pas le cas, contactez notre support.',
  },
];

export default function HelpScreen() {
  const { theme } = useTheme();
  const responsive = useResponsive();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filteredFaq = FAQ_DATA.filter(
    item =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const ContactCard = ({
    icon,
    title,
    subtitle,
    action,
    color,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    action: () => void;
    color: string;
  }) => (
    <AnimatedPressable 
      onPress={action} 
      haptic 
      style={StyleSheet.flatten([
        styles.contactCard,
        responsive.isSmall && styles.contactCardSmall
      ])}
    >
      <View style={[
        styles.contactIcon, 
        { backgroundColor: color + '20' },
        responsive.isSmall && styles.contactIconSmall
      ]}>
        <Ionicons name={icon as any} size={responsive.isSmall ? 20 : 24} color={color} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[
          styles.contactTitle, 
          { color: theme.foreground },
          responsive.isSmall && styles.contactTitleSmall
        ]}>{title}</Text>
        <Text style={[
          styles.contactSubtitle, 
          { color: theme.mutedForeground },
          responsive.isSmall && styles.contactSubtitleSmall
        ]}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={responsive.isSmall ? 18 : 20} color={theme.mutedForeground} />
    </AnimatedPressable>
  );

  const FaqCard = ({ item, index }: { item: FaqItem; index: number }) => {
    const isExpanded = expandedIndex === index;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(rotateAnim, {
        toValue: isExpanded ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [isExpanded]);

    const rotate = rotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    return (
      <Card variant="outline" padding="none" style={styles.faqCard}>
        <AnimatedPressable onPress={() => toggleExpand(index)} haptic>
          <View style={styles.faqHeader}>
            <Text style={[styles.faqQuestion, { color: theme.foreground }]}>{item.question}</Text>
            <Animated.View style={{ transform: [{ rotate }] }}>
              <Ionicons name="chevron-down" size={20} color={theme.mutedForeground} />
            </Animated.View>
          </View>
        </AnimatedPressable>
        {isExpanded && (
          <View style={[styles.faqAnswer, { borderTopColor: theme.border }]}>
            <Text style={[styles.faqAnswerText, { color: theme.mutedForeground }]}>
              {item.answer}
            </Text>
          </View>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="search" size={20} color={theme.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: theme.foreground }]}
              placeholder="Rechercher une question..."
              placeholderTextColor={theme.mutedForeground}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <AnimatedPressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.mutedForeground} />
              </AnimatedPressable>
            )}
          </View>

          {/* Quick Contact */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Nous contacter</Text>
          <Card variant="outline" padding="none" style={styles.contactsCard}>
            <ContactCard
              icon="mail"
              title="Email"
              subtitle="support@mbotamapay.com"
              action={() => Linking.openURL('mailto:support@mbotamapay.com')}
              color={theme.primary}
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ContactCard
              icon="logo-whatsapp"
              title="WhatsApp"
              subtitle="+221 XXX XXX XXX"
              action={() => Linking.openURL('https://wa.me/221775688191')}
              color="#25D366"
            />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ContactCard
              icon="call"
              title="Téléphone"
              subtitle="Lun-Ven, 8h-18h"
              action={() => Linking.openURL('tel:+221775688191')}
              color={theme.warning}
            />
          </Card>

          {/* FAQ */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
            Questions fréquentes
          </Text>
          {filteredFaq.length > 0 ? (
            filteredFaq.map((item, index) => (
              <FaqCard key={index} item={item} index={index} />
            ))
          ) : (
            <Card variant="outline" style={styles.emptyCard}>
              <Ionicons name="search" size={48} color={theme.mutedForeground} />
              <Text style={[styles.emptyText, { color: theme.mutedForeground }]}>
                Aucun résultat pour "{searchQuery}"
              </Text>
            </Card>
          )}

          {/* Help Topics */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Guides</Text>
          <View style={styles.topicsGrid}>
            {[
              { icon: 'swap-horizontal', label: 'Transferts', color: theme.primary },
              { icon: 'shield-checkmark', label: 'Sécurité', color: theme.success },
              { icon: 'card', label: 'Paiements', color: theme.warning },
              { icon: 'person', label: 'Compte', color: theme.accentPurple },
            ].map((topic, i) => (
              <AnimatedPressable
                key={i}
                haptic
                style={StyleSheet.flatten([
                  styles.topicCard,
                  { 
                    backgroundColor: theme.surface,
                    width: responsive.topicCardWidth,
                  },
                  responsive.isSmall && styles.topicCardSmall
                ])}
              >
                <View style={[
                  styles.topicIcon,
                  { backgroundColor: topic.color + '20' },
                  responsive.isSmall && styles.topicIconSmall
                ]}>
                  <Ionicons name={topic.icon as any} size={responsive.isSmall ? 20 : 24} color={topic.color} />
                </View>
                <Text style={[
                  styles.topicLabel,
                  { color: theme.foreground },
                  responsive.isSmall && styles.topicLabelSmall
                ]}>{topic.label}</Text>
              </AnimatedPressable>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  contactsCard: { marginBottom: 16, overflow: 'hidden' },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  contactCardSmall: {
    padding: 12,
  },
  contactIcon: { 
    width: 44, 
    height: 44, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  contactIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 10,
  },
  contactInfo: { marginLeft: 12, flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '500' },
  contactTitleSmall: { fontSize: 13 },
  contactSubtitle: { fontSize: 12, marginTop: 2 },
  contactSubtitleSmall: { fontSize: 11 },
  divider: { height: 1, marginLeft: 72 },
  faqCard: { marginBottom: 10, overflow: 'hidden' },
  faqHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  faqQuestion: { flex: 1, fontSize: 14, fontWeight: '500', marginRight: 12 },
  faqAnswer: { padding: 16, paddingTop: 0, borderTopWidth: 1 },
  faqAnswerText: { fontSize: 13, lineHeight: 20, paddingTop: 12 },
  emptyCard: { alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, marginTop: 12 },
  topicsGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12,
    justifyContent: 'space-between',
  },
  topicCard: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 14,
  },
  topicCardSmall: {
    padding: 14,
    borderRadius: 12,
  },
  topicIcon: { 
    width: 52, 
    height: 52, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 10 
  },
  topicIconSmall: {
    width: 42,
    height: 42,
    borderRadius: 12,
    marginBottom: 8,
  },
  topicLabel: { 
    fontSize: 14, 
    fontWeight: '500',
    textAlign: 'center',
  },
  topicLabelSmall: {
    fontSize: 12,
  },
});
