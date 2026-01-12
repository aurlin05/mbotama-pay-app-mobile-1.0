import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
// import * as ImagePicker from 'expo-image-picker';
// Dynamic import for expo-image-picker
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch (e) {
  // Module not available
}

const launchImageLibraryAsync = ImagePicker?.launchImageLibraryAsync;
const launchCameraAsync = ImagePicker?.launchCameraAsync;
const requestMediaLibraryPermissionsAsync = ImagePicker?.requestMediaLibraryPermissionsAsync;
const requestCameraPermissionsAsync = ImagePicker?.requestCameraPermissionsAsync;
const MediaTypeOptions = ImagePicker?.MediaTypeOptions;
import { useAuthStore } from '../../src/store/authStore';
import { userService } from '../../src/services/user';
import { useTheme } from '../../src/hooks/useTheme';
import { Card } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';
import { AnimatedPressable } from '../../src/components/ui/AnimatedPressable';

type DocumentType = 'ID_CARD' | 'PASSPORT' | 'SELFIE';

interface DocumentState {
  type: DocumentType;
  uri: string | null;
  uploaded: boolean;
}

export default function KycScreen() {
  const { theme, tokens } = useTheme();
  const { kycStatus, fetchUserData } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<DocumentState[]>([
    { type: 'ID_CARD', uri: null, uploaded: false },
    { type: 'SELFIE', uri: null, uploaded: false },
  ]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const getKycLevel = () => {
    switch (kycStatus?.status) {
      case 'LEVEL_2': return { level: 2, label: 'Niveau 2 - Complet', color: theme.success };
      case 'LEVEL_1': return { level: 1, label: 'Niveau 1 - Basique', color: theme.primary };
      case 'PENDING': return { level: 0, label: 'En cours de vérification', color: theme.warning };
      case 'REJECTED': return { level: 0, label: 'Rejeté', color: theme.destructive };
      default: return { level: 0, label: 'Non vérifié', color: theme.mutedForeground };
    }
  };

  const kycLevel = getKycLevel();

  const pickImage = async (docType: DocumentType) => {
    if (!ImagePicker) {
      Alert.alert('Non disponible', 'Le sélecteur d\'images n\'est pas disponible');
      return;
    }
    const { status } = await requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la galerie est nécessaire");
      return;
    }

    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions?.Images,
      allowsEditing: true,
      aspect: docType === 'SELFIE' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDocuments(docs =>
        docs.map(d => d.type === docType ? { ...d, uri: result.assets[0].uri } : d)
      );
    }
  };

  const takePhoto = async (docType: DocumentType) => {
    if (!ImagePicker) {
      Alert.alert('Non disponible', 'La caméra n\'est pas disponible');
      return;
    }
    const { status } = await requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission requise', "L'accès à la caméra est nécessaire");
      return;
    }

    const result = await launchCameraAsync({
      allowsEditing: true,
      aspect: docType === 'SELFIE' ? [1, 1] : [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setDocuments(docs =>
        docs.map(d => d.type === docType ? { ...d, uri: result.assets[0].uri } : d)
      );
    }
  };

  const handleSubmit = async () => {
    const allUploaded = documents.every(d => d.uri);
    if (!allUploaded) {
      Alert.alert('Documents manquants', 'Veuillez ajouter tous les documents requis');
      return;
    }

    setLoading(true);
    try {
      for (const doc of documents) {
        if (doc.uri) {
          await userService.submitKycDocument({
            documentType: doc.type,
            documentUrl: doc.uri,
          });
        }
      }
      await fetchUserData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Succès', 'Documents soumis pour vérification');
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de la soumission');
    } finally {
      setLoading(false);
    }
  };

  const DocumentCard = ({ doc, title, description, icon }: {
    doc: DocumentState;
    title: string;
    description: string;
    icon: string;
  }) => (
    <Card variant="outline" style={styles.docCard}>
      <View style={styles.docHeader}>
        <View style={[styles.docIcon, { backgroundColor: theme.primaryLighter }]}>
          <Ionicons name={icon as any} size={24} color={theme.primary} />
        </View>
        <View style={styles.docInfo}>
          <Text style={[styles.docTitle, { color: theme.foreground }]}>{title}</Text>
          <Text style={[styles.docDesc, { color: theme.mutedForeground }]}>{description}</Text>
        </View>
        {doc.uri && (
          <View style={[styles.checkBadge, { backgroundColor: theme.success }]}>
            <Ionicons name="checkmark" size={14} color="#FFF" />
          </View>
        )}
      </View>

      {doc.uri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: doc.uri }} style={styles.preview} resizeMode="cover" />
          <AnimatedPressable
            onPress={() => setDocuments(docs =>
              docs.map(d => d.type === doc.type ? { ...d, uri: null } : d)
            )}
            style={StyleSheet.flatten([styles.removeBtn, { backgroundColor: theme.destructive }])}
          >
            <Ionicons name="trash-outline" size={16} color="#FFF" />
          </AnimatedPressable>
        </View>
      ) : (
        <View style={styles.uploadActions}>
          <AnimatedPressable
            onPress={() => takePhoto(doc.type)}
            style={StyleSheet.flatten([styles.uploadBtn, { backgroundColor: theme.primary }])}
          >
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.uploadBtnText}>Caméra</Text>
          </AnimatedPressable>
          <AnimatedPressable
            onPress={() => pickImage(doc.type)}
            style={StyleSheet.flatten([styles.uploadBtn, { backgroundColor: theme.secondary }])}
          >
            <Ionicons name="images" size={20} color={theme.primary} />
            <Text style={[styles.uploadBtnText, { color: theme.primary }]}>Galerie</Text>
          </AnimatedPressable>
        </View>
      )}
    </Card>
  );

  const LevelCard = ({ level, title, features, current }: {
    level: number;
    title: string;
    features: string[];
    current: boolean;
  }) => (
    <Card
      variant={current ? 'highlight' : 'outline'}
      style={current ? StyleSheet.flatten([styles.levelCard, { borderColor: theme.primary }]) : styles.levelCard}
    >
      <View style={styles.levelHeader}>
        <View style={[
          styles.levelBadge,
          { backgroundColor: current ? theme.primary : theme.muted }
        ]}>
          <Text style={[styles.levelNum, { color: current ? '#FFF' : theme.mutedForeground }]}>
            {level}
          </Text>
        </View>
        <View style={styles.levelInfo}>
          <Text style={[styles.levelTitle, { color: theme.foreground }]}>{title}</Text>
          {current && (
            <View style={[styles.currentBadge, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.currentText, { color: theme.success }]}>Actuel</Text>
            </View>
          )}
        </View>
      </View>
      {features.map((f, i) => (
        <View key={i} style={styles.featureRow}>
          <Ionicons name="checkmark-circle" size={16} color={theme.success} />
          <Text style={[styles.featureText, { color: theme.mutedForeground }]}>{f}</Text>
        </View>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Status Banner */}
          <LinearGradient
            colors={kycLevel.level >= 1 ? ['#22C55E', '#16A34A'] : ['#3366FF', '#1E40AF']}
            style={styles.statusBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons
              name={kycLevel.level >= 1 ? 'shield-checkmark' : 'shield-outline'}
              size={32}
              color="#FFF"
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>{kycLevel.label}</Text>
              <Text style={styles.statusDesc}>
                {kycLevel.level >= 2
                  ? 'Toutes les fonctionnalités débloquées'
                  : kycLevel.level === 1
                  ? 'Passez au niveau 2 pour des limites plus élevées'
                  : 'Vérifiez votre identité pour débloquer les fonctionnalités'}
              </Text>
            </View>
          </LinearGradient>

          {/* Levels */}
          <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Niveaux de vérification</Text>
          <LevelCard
            level={1}
            title="Basique"
            features={['Transferts jusqu\'à 100 000 FCFA/mois', 'Retraits limités']}
            current={kycLevel.level === 1}
          />
          <LevelCard
            level={2}
            title="Complet"
            features={['Transferts illimités', 'Tous les services disponibles', 'Support prioritaire']}
            current={kycLevel.level === 2}
          />

          {/* Documents */}
          {kycLevel.level < 2 && kycStatus?.status !== 'PENDING' && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Documents requis
              </Text>
              <DocumentCard
                doc={documents[0]}
                title="Pièce d'identité"
                description="CNI, Passeport ou Permis de conduire"
                icon="card-outline"
              />
              <DocumentCard
                doc={documents[1]}
                title="Selfie"
                description="Photo de vous tenant votre pièce d'identité"
                icon="person-outline"
              />

              <Button
                onPress={handleSubmit}
                loading={loading}
                disabled={!documents.every(d => d.uri)}
                style={styles.submitBtn}
              >
                Soumettre pour vérification
              </Button>
            </>
          )}

          {kycStatus?.status === 'PENDING' && (
            <Card variant="outline" style={styles.pendingCard}>
              <Ionicons name="time" size={48} color={theme.warning} />
              <Text style={[styles.pendingTitle, { color: theme.foreground }]}>
                Vérification en cours
              </Text>
              <Text style={[styles.pendingDesc, { color: theme.mutedForeground }]}>
                Vos documents sont en cours d'examen. Vous serez notifié une fois la vérification terminée.
              </Text>
            </Card>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusInfo: { marginLeft: 16, flex: 1 },
  statusLabel: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  statusDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  levelCard: { marginBottom: 12, padding: 16 },
  levelHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  levelBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  levelNum: { fontSize: 16, fontWeight: '700' },
  levelInfo: { marginLeft: 12, flex: 1, flexDirection: 'row', alignItems: 'center' },
  levelTitle: { fontSize: 16, fontWeight: '600' },
  currentBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  currentText: { fontSize: 11, fontWeight: '600' },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  featureText: { marginLeft: 8, fontSize: 13 },
  docCard: { marginBottom: 16, padding: 16 },
  docHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  docIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docInfo: { marginLeft: 12, flex: 1 },
  docTitle: { fontSize: 15, fontWeight: '600' },
  docDesc: { fontSize: 12, marginTop: 2 },
  checkBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  uploadActions: { flexDirection: 'row', gap: 12 },
  uploadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, gap: 8 },
  uploadBtnText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  previewContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden' },
  preview: { width: '100%', height: 180, borderRadius: 12 },
  removeBtn: { position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  submitBtn: { marginTop: 24 },
  pendingCard: { alignItems: 'center', padding: 32, marginTop: 16 },
  pendingTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  pendingDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
