import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';

export default function PrivacyScreen() {
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

  const DataItem = ({ icon, title, description }: { icon: string; title: string; description: string }) => (
    <View style={styles.dataItem}>
      <View style={[styles.dataIcon, { backgroundColor: theme.primaryLighter }]}>
        <Ionicons name={icon as any} size={20} color={theme.primary} />
      </View>
      <View style={styles.dataInfo}>
        <Text style={[styles.dataTitle, { color: theme.foreground }]}>{title}</Text>
        <Text style={[styles.dataDesc, { color: theme.mutedForeground }]}>{description}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <Card variant="gradient" gradientColors={['#8B5CF6', '#6D28D9']} style={styles.headerCard}>
            <Ionicons name="shield-checkmark" size={32} color="#FFF" />
            <Text style={styles.headerTitle}>Politique de confidentialité</Text>
            <Text style={styles.headerDate}>Dernière mise à jour : Janvier 2026</Text>
          </Card>

          {/* Intro */}
          <Card variant="outline" style={styles.introCard}>
            <Text style={[styles.introText, { color: theme.mutedForeground }]}>
              Chez MBOTAMAPAY, nous prenons la protection de vos données personnelles très au sérieux. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.
            </Text>
          </Card>

          {/* Data We Collect */}
          <Text style={[styles.mainTitle, { color: theme.foreground }]}>Données collectées</Text>
          <Card variant="outline" style={styles.dataCard}>
            <DataItem
              icon="person"
              title="Informations personnelles"
              description="Nom, prénom, numéro de téléphone, email"
            />
            <DataItem
              icon="card"
              title="Informations de transaction"
              description="Historique des transferts, montants, destinataires"
            />
            <DataItem
              icon="document"
              title="Documents d'identité"
              description="CNI, passeport pour la vérification KYC"
            />
            <DataItem
              icon="location"
              title="Données de localisation"
              description="Pays et région pour la conformité réglementaire"
            />
            <DataItem
              icon="phone-portrait"
              title="Données techniques"
              description="Type d'appareil, version de l'app, adresse IP"
            />
          </Card>

          {/* Content */}
          <Card variant="outline" style={styles.contentCard}>
            <Section title="Utilisation des données">
              Nous utilisons vos données pour fournir nos services de transfert d'argent, vérifier votre identité, prévenir la fraude, améliorer nos services et vous contacter concernant votre compte.
            </Section>

            <Section title="Partage des données">
              Nous ne vendons jamais vos données personnelles. Nous pouvons partager vos informations avec nos partenaires de paiement pour traiter vos transactions, les autorités réglementaires si requis par la loi, et nos prestataires de services sous contrat de confidentialité.
            </Section>

            <Section title="Sécurité des données">
              Nous utilisons des mesures de sécurité avancées incluant le chiffrement des données en transit et au repos, l'authentification à deux facteurs, la surveillance continue des activités suspectes et des audits de sécurité réguliers.
            </Section>

            <Section title="Conservation des données">
              Nous conservons vos données aussi longtemps que nécessaire pour fournir nos services et respecter nos obligations légales. Les données de transaction sont conservées pendant 10 ans conformément aux réglementations anti-blanchiment.
            </Section>

            <Section title="Vos droits">
              Vous avez le droit d'accéder à vos données personnelles, de les rectifier ou les supprimer, de vous opposer au traitement, de retirer votre consentement et de porter plainte auprès d'une autorité de protection des données.
            </Section>

            <Section title="Cookies et technologies similaires">
              Notre application peut utiliser des technologies de suivi pour améliorer votre expérience et analyser l'utilisation du service. Vous pouvez gérer ces préférences dans les paramètres de votre appareil.
            </Section>

            <Section title="Modifications">
              Nous pouvons mettre à jour cette politique périodiquement. Les modifications importantes seront notifiées via l'application ou par email.
            </Section>

            <Section title="Contact">
              Pour toute question sur la confidentialité de vos données, contactez notre délégué à la protection des données à privacy@mbotamapay.com.
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
  introCard: { padding: 16, marginBottom: 16 },
  introText: { fontSize: 14, lineHeight: 22 },
  mainTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  dataCard: { padding: 16, marginBottom: 16 },
  dataItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dataIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dataInfo: { marginLeft: 12, flex: 1 },
  dataTitle: { fontSize: 14, fontWeight: '500' },
  dataDesc: { fontSize: 12, marginTop: 2 },
  contentCard: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 8 },
  sectionContent: { fontSize: 14, lineHeight: 22 },
  footer: { textAlign: 'center', fontSize: 12, marginTop: 24 },
});
