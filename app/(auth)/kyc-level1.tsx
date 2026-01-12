import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Pressable,
  Dimensions,
  Image,
  StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../../src/services/user';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme } from '../../src/hooks/useTheme';
import { Button } from '../../src/components/ui/Button';
import { Card } from '../../src/components/ui/Card';

const { height } = Dimensions.get('window');

type DocumentType = 'NATIONAL_ID' | 'SELFIE';

interface DocumentState {
  uri: string | null;
  uploading: boolean;
  uploaded: boolean;
}

export default function KycLevel1Screen() {
  const { theme } = useTheme();
  const { fetchUserData, clearPendingAuth } = useAuthStore();
  const [documents, setDocuments] = useState<Record<DocumentType, DocumentState>>({
    NATIONAL_ID: { uri: null, uploading: false, uploaded: false },
    SELFIE: { uri: null, uploading: false, uploaded: false },
  });
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async (type: DocumentType, useCamera: boolean = false) => {
    try {
      let result;
      
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la caméra');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: type === 'SELFIE' ? [1, 1] : [4, 3],
          quality: 0.8,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à la galerie');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: type === 'SELFIE' ? [1, 1] : [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        setDocuments(prev => ({
          ...prev,
          [type]: { ...prev[type], uri: result.assets[0].uri },
        }));
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const showImageOptions = (type: DocumentType) => {
    Alert.alert(
      type === 'SELFIE' ? 'Prendre un selfie' : 'Ajouter un document',
      'Choisissez une option',
      [
        {
          text: 'Prendre une photo',
          onPress: () => pickImage(type, true),
        },
        {
          text: 'Choisir dans la galerie',
          onPress: () => pickImage(type, false),
        },
        { text: 'Annuler', style: 'cancel' },
      ]
    );
  };

  const uploadDocument = async (type: DocumentType) => {
    const doc = documents[type];
    if (!doc.uri) return;

    setDocuments(prev => ({
      ...prev,
      [type]: { ...prev[type], uploading: true },
    }));

    try {
      // In a real app, you would upload the image to a server and get a URL
      // For now, we'll simulate this with the local URI
      await userService.submitKycDocument({
        documentType: type,
        documentUrl: doc.uri, // In production, this would be the uploaded URL
      });

      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], uploading: false, uploaded: true },
      }));
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } catch (error: any) {
      setDocuments(prev => ({
        ...prev,
        [type]: { ...prev[type], uploading: false },
      }));
      Alert.alert('Erreur', error.response?.data?.message || 'Échec de l\'envoi du document');
    }
  };

  const handleSubmit = async () => {
    const allUploaded = documents.NATIONAL_ID.uploaded && documents.SELFIE.uploaded;
    
    if (!allUploaded) {
      // Upload remaining documents
      setLoading(true);
      try {
        if (documents.NATIONAL_ID.uri && !documents.NATIONAL_ID.uploaded) {
          await uploadDocument('NATIONAL_ID');
        }
        if (documents.SELFIE.uri && !documents.SELFIE.uploaded) {
          await uploadDocument('SELFIE');
        }
        
        await fetchUserData();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        
        Alert.alert(
          'Documents soumis !',
          'Vos documents sont en cours de vérification. Vous serez notifié une fois la vérification terminée.',
          [{ text: 'Continuer', onPress: () => {
            clearPendingAuth();
            router.replace('/(tabs)');
          }}]
        );
      } catch (error: any) {
        Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Passer cette étape ?',
      'Sans vérification KYC, vous ne pourrez pas effectuer de transferts. Vous pourrez compléter cette étape plus tard.',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Passer', 
          style: 'destructive',
          onPress: () => {
            clearPendingAuth();
            router.replace('/(tabs)');
          },
        },
      ]
    );
  };

  const isFormValid = documents.NATIONAL_ID.uri && documents.SELFIE.uri;

  const renderDocumentCard = (
    type: DocumentType,
    title: string,
    description: string,
    icon: string
  ) => {
    const doc = documents[type];
    
    return (
      <Pressable
        style={[
          styles.documentCard,
          {
            borderColor: doc.uploaded ? theme.success : doc.uri ? theme.primary : theme.border,
            backgroundColor: theme.surface,
          },
        ]}
        onPress={() => !doc.uploaded && showImageOptions(type)}
      >
        {doc.uri ? (
          <View style={styles.documentPreview}>
            <Image source={{ uri: doc.uri }} style={styles.documentImage} />
            {doc.uploaded ? (
              <View style={[styles.uploadedBadge, { backgroundColor: theme.success }]}>
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              </View>
            ) : doc.uploading ? (
              <View style={[styles.uploadingOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                <Text style={styles.uploadingText}>Envoi...</Text>
              </View>
            ) : (
              <Pressable
                style={[styles.changeButton, { backgroundColor: theme.primary }]}
                onPress={() => showImageOptions(type)}
              >
                <Ionicons name="camera" size={16} color="#FFFFFF" />
              </Pressable>
            )}
          </View>
        ) : (
          <View style={styles.documentPlaceholder}>
            <View style={[styles.documentIconContainer, { backgroundColor: theme.primaryLighter }]}>
              <Ionicons name={icon as any} size={32} color={theme.primary} />
            </View>
            <Text style={[styles.documentTitle, { color: theme.foreground }]}>{title}</Text>
            <Text style={[styles.documentDescription, { color: theme.mutedForeground }]}>
              {description}
            </Text>
            <View style={[styles.addButton, { backgroundColor: theme.primaryLighter }]}>
              <Ionicons name="add" size={20} color={theme.primary} />
              <Text style={[styles.addButtonText, { color: theme.primary }]}>Ajouter</Text>
            </View>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      {/* Background */}
      <View style={styles.bgDecoration}>
        <LinearGradient
          colors={['#22C55E15', '#3366FF10', 'transparent']}
          style={styles.bgGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={[styles.bgCircle1, { backgroundColor: theme.success + '10' }]} />
        <View style={[styles.bgCircle2, { backgroundColor: theme.primary + '08' }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <Animated.View style={[styles.progressContainer, { opacity: fadeAnim }]}>
            <View style={styles.progressSteps}>
              <View style={[styles.stepDot, { backgroundColor: theme.success }]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, { backgroundColor: theme.success }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.success }]}>
                <Ionicons name="checkmark" size={12} color="#FFFFFF" />
              </View>
              <View style={[styles.stepLine, { backgroundColor: theme.success }]} />
              <View style={[styles.stepDot, { backgroundColor: theme.primary }]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, { color: theme.success }]}>Téléphone</Text>
              <Text style={[styles.progressLabel, { color: theme.success }]}>Profil</Text>
              <Text style={[styles.progressLabel, { color: theme.primary }]}>KYC</Text>
            </View>
          </Animated.View>

          {/* Header */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#22C55E', '#16A34A']}
              style={styles.iconGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="shield-checkmark" size={36} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.title, { color: theme.foreground }]}>Vérification d'identité</Text>
            <Text style={[styles.subtitle, { color: theme.mutedForeground }]}>
              Pour sécuriser votre compte et effectuer des transferts, nous avons besoin de vérifier votre identité.
            </Text>
          </Animated.View>

          {/* Benefits */}
          <Animated.View
            style={[
              styles.benefitsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={[styles.benefitItem, { backgroundColor: theme.surface }]}>
              <Ionicons name="cash-outline" size={20} color={theme.success} />
              <Text style={[styles.benefitText, { color: theme.foreground }]}>
                Limite de 500 000 FCFA/mois
              </Text>
            </View>
            <View style={[styles.benefitItem, { backgroundColor: theme.surface }]}>
              <Ionicons name="flash-outline" size={20} color={theme.warning} />
              <Text style={[styles.benefitText, { color: theme.foreground }]}>
                Transferts instantanés
              </Text>
            </View>
          </Animated.View>

          {/* Documents */}
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Card style={styles.documentsCard} variant="elevated">
              <Text style={[styles.sectionTitle, { color: theme.foreground }]}>
                Documents requis
              </Text>

              {renderDocumentCard(
                'NATIONAL_ID',
                'Pièce d\'identité',
                'CNI, Passeport ou Permis de conduire',
                'card-outline'
              )}

              {renderDocumentCard(
                'SELFIE',
                'Photo selfie',
                'Prenez une photo claire de votre visage',
                'camera-outline'
              )}

              <View style={styles.tipsContainer}>
                <Text style={[styles.tipsTitle, { color: theme.foreground }]}>
                  <Ionicons name="bulb-outline" size={16} /> Conseils
                </Text>
                <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                  • Assurez-vous que le document est lisible
                </Text>
                <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                  • Évitez les reflets et les ombres
                </Text>
                <Text style={[styles.tipText, { color: theme.mutedForeground }]}>
                  • Le selfie doit montrer clairement votre visage
                </Text>
              </View>

              <Button
                variant="gradient"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !isFormValid}
                style={styles.button}
                icon={<Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
                iconPosition="right"
              >
                Soumettre pour vérification
              </Button>

              <Pressable onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: theme.mutedForeground }]}>
                  Passer cette étape
                </Text>
              </Pressable>
            </Card>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bgDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
  },
  bgCircle1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -100,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    bottom: 80,
    left: -60,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    width: 50,
    height: 3,
    borderRadius: 2,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  benefitsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  benefitItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  documentsCard: {
    padding: 24,
    borderRadius: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  documentCard: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  documentPlaceholder: {
    alignItems: 'center',
    padding: 24,
  },
  documentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  documentDescription: {
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentPreview: {
    height: 160,
    position: 'relative',
  },
  documentImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  changeButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsContainer: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    lineHeight: 22,
  },
  button: {
    height: 56,
    borderRadius: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
