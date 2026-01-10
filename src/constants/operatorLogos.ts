import { ImageSourcePropType } from 'react-native';

// Mapping des codes opérateurs vers leurs logos
// Basé sur les opérateurs définis dans le backend (MobileOperator.java)
export const OPERATOR_LOGOS: Record<string, ImageSourcePropType> = {
  // === BÉNIN (BJ) ===
  MTN_BJ: require('../../assets/operators/mtn.webp'),
  MOOV_BJ: require('../../assets/operators/moov.webp'),
  CELTIIS_BJ: require('../../assets/operators/celtiis.webp'), // Fallback

  // === SÉNÉGAL (SN) ===
  ORANGE_SN: require('../../assets/operators/orange.webp'),
  FREE_SN: require('../../assets/operators/yas.webp'),
  WAVE_SN: require('../../assets/operators/wave.webp'),

  // === CÔTE D'IVOIRE (CI) ===
  ORANGE_CI: require('../../assets/operators/orange.webp'),
  MTN_CI: require('../../assets/operators/mtn.webp'),
  MOOV_CI: require('../../assets/operators/moov.webp'),
  WAVE_CI: require('../../assets/operators/wave.webp'),

  // === TOGO (TG) ===
  TOGOCOM_TG: require('../../assets/operators/togocom.webp'), // Fallback
  MOOV_TG: require('../../assets/operators/moov.webp'),

  // === MALI (ML) ===
  ORANGE_ML: require('../../assets/operators/orange.webp'),
  MOOV_ML: require('../../assets/operators/moov.webp'),

  // === BURKINA FASO (BF) ===
  ORANGE_BF: require('../../assets/operators/orange.webp'),
  MOOV_BF: require('../../assets/operators/moov.webp'),

  // === CONGO-BRAZZAVILLE (CG) ===
  MTN_CG: require('../../assets/operators/mtn.webp'),

  // === CAMEROUN (CM) ===
  ORANGE_CM: require('../../assets/operators/orange.webp'),
  MTN_CM: require('../../assets/operators/mtn.webp'),
};

// Fonction pour obtenir le logo d'un opérateur
export const getOperatorLogo = (operatorCode: string): ImageSourcePropType | null => {
  return OPERATOR_LOGOS[operatorCode] || null;
};

// Couleurs des opérateurs pour le fallback
export const OPERATOR_COLORS: Record<string, string> = {
  // Orange
  ORANGE_SN: '#FF6600',
  ORANGE_CI: '#FF6600',
  ORANGE_ML: '#FF6600',
  ORANGE_BF: '#FF6600',
  ORANGE_CM: '#FF6600',
  
  // MTN
  MTN_BJ: '#FFCC00',
  MTN_CI: '#FFCC00',
  MTN_CG: '#FFCC00',
  MTN_CM: '#FFCC00',
  
  // Moov
  MOOV_BJ: '#FF6B00',
  MOOV_CI: '#FF6B00',
  MOOV_TG: '#FF6B00',
  MOOV_ML: '#FF6B00',
  MOOV_BF: '#FF6B00',
  
  // Wave
  WAVE_SN: '#1DC9FF',
  WAVE_CI: '#1DC9FF',
  
  // Free/Yas
  FREE_SN: '#003399',
  
  // Autres
  CELTIIS_BJ: '#00A651',
  TOGOCOM_TG: '#E30613',
};

export const getOperatorColor = (operatorCode: string): string => {
  return OPERATOR_COLORS[operatorCode] || '#6B7280';
};
