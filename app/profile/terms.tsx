import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';

export default function TermsScreen() {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.foreground }]}>{title}</Text>
      <Text style={[styles.sectionContent, { color: theme.mutedForeground }]}>{children}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <Card variant="gradient" gradientColors={['#3366FF', '#1E40AF']} style={styles.headerCard}>
            <Ionicons name="document-text" size={32} color="#FFF" />
            <Text style={styles.headerTitle}>Conditions d'utilisation</Text>
            <Text style={styles.headerDate}>Dernière mise à jour : Janvier 2026</Text>
          </Card>

          {/* Content */}
          <Card variant="outline" style={styles.contentCard}>
            <Section title="1. Acceptation des conditions">
              En utilisant l'application MBOTAMAPAY, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </Section>

            <Section title="2. Description du service">
              MBOTAMAPAY est un service de transfert d'argent mobile permettant aux utilisateurs d'envoyer et de recevoir de l'argent via leur téléphone mobile. Le service est disponible en République Démocratique du Congo et dans d'autres pays africains.
            </Section>

            <Section title="3. Inscription et compte">
              Pour utiliser MBOTAMAPAY, vous devez créer un compte en fournissant un numéro de téléphone valide. Vous êtes responsable de maintenir la confidentialité de vos informations de connexion et de toutes les activités effectuées sous votre compte.
            </Section>

            <Section title="4. Vérification d'identité (KYC)">
              Conformément aux réglementations en vigueur, nous pouvons vous demander de vérifier votre identité. Les limites de transaction varient selon votre niveau de vérification. La soumission de faux documents est strictement interdite.
            </Section>

            <Section title="5. Frais et tarifs">
              Des frais peuvent s'appliquer aux transferts d'argent. Les frais applicables sont clairement affichés avant chaque transaction. MBOTAMAPAY se réserve le droit de modifier ses tarifs avec un préavis raisonnable.
            </Section>

            <Section title="6. Limites de transaction">
              Des limites quotidiennes et mensuelles s'appliquent aux transactions. Ces limites varient selon votre niveau de vérification KYC. Les limites actuelles sont affichées dans votre profil.
            </Section>

            <Section title="7. Utilisation interdite">
              Il est interdit d'utiliser MBOTAMAPAY pour des activités illégales, le blanchiment d'argent, le financement du terrorisme, ou toute autre activité frauduleuse. Tout compte soupçonné d'activité illicite sera suspendu.
            </Section>

            <Section title="8. Responsabilité">
              MBOTAMAPAY s'efforce de fournir un service fiable mais ne garantit pas un fonctionnement ininterrompu. Nous ne sommes pas responsables des pertes résultant de circonstances indépendantes de notre volonté.
            </Section>

            <Section title="9. Protection des données">
              Vos données personnelles sont traitées conformément à notre politique de confidentialité. Nous utilisons des mesures de sécurité appropriées pour protéger vos informations.
            </Section>

            <Section title="10. Modifications">
              MBOTAMAPAY peut modifier ces conditions à tout moment. Les modifications importantes seront notifiées aux utilisateurs. L'utilisation continue du service après modification constitue une acceptation des nouvelles conditions.
            </Section>

            <Section title="11. Contact">
              Pour toute question concernant ces conditions, contactez-nous à support@mbotamapay.com ou via l'application.
            </Section>
          </Card>

          <Text style={[styles.footer, { color: theme.mutedForeground }]}>
            © 2026 MBOTAMAPAY. Tous droits réservés.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  headerCard: { alignItems: 'center', padding: 24, marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#FFF', marginTop: 12 },
  headerDate: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  contentCard: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  sectionContent: { fontSize: 14, lineHeight: 22 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
