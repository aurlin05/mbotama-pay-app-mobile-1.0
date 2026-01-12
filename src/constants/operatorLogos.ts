import { ImageSourcePropType } from 'react-native';

// Mapping des codes opérateurs vers leurs logos
// Basé sur les opérateurs définis dans le backend (MobileOperator.java)

// Logo par défaut pour les opérateurs sans logo spécifique
const DEFAULT_LOGO = require('../../assets/operators/mtn.webp');

// Logos disponibles
const AVAILABLE_LOGOS = {
  mtn: require('../../assets/operators/mtn.webp'),
  moov: require('../../assets/operators/moov.webp'),
  orange: require('../../assets/operators/orange.webp'),
  wave: require('../../assets/operators/wave.webp'),
  celtiis: require('../../assets/operators/celtiis.webp'),
  togocom: require('../../assets/operators/togocom.webp'),
  yas: require('../../assets/operators/yas.webp'),
};

export const OPERATOR_LOGOS: Record<string, ImageSourcePropType> = {
  // === BÉNIN (BJ) ===
  MTN_BJ: AVAILABLE_LOGOS.mtn,
  MOOV_BJ: AVAILABLE_LOGOS.moov,
  CELTIIS_BJ: AVAILABLE_LOGOS.celtiis,

  // === SÉNÉGAL (SN) ===
  ORANGE_SN: AVAILABLE_LOGOS.orange,
  FREE_SN: AVAILABLE_LOGOS.yas,
  WAVE_SN: AVAILABLE_LOGOS.wave,

  // === CÔTE D'IVOIRE (CI) ===
  ORANGE_CI: AVAILABLE_LOGOS.orange,
  MTN_CI: AVAILABLE_LOGOS.mtn,
  MOOV_CI: AVAILABLE_LOGOS.moov,
  WAVE_CI: AVAILABLE_LOGOS.wave,

  // === TOGO (TG) ===
  TOGOCOM_TG: AVAILABLE_LOGOS.togocom,
  MOOV_TG: AVAILABLE_LOGOS.moov,

  // === MALI (ML) ===
  ORANGE_ML: AVAILABLE_LOGOS.orange,
  MOOV_ML: AVAILABLE_LOGOS.moov,

  // === BURKINA FASO (BF) ===
  ORANGE_BF: AVAILABLE_LOGOS.orange,
  MOOV_BF: AVAILABLE_LOGOS.moov,

  // === CONGO-BRAZZAVILLE (CG) ===
  MTN_CG: AVAILABLE_LOGOS.mtn,

  // === CAMEROUN (CM) ===
  ORANGE_CM: AVAILABLE_LOGOS.orange,
  MTN_CM: AVAILABLE_LOGOS.mtn,

  // === GUINÉE (GN) ===
  ORANGE_GN: AVAILABLE_LOGOS.orange,
  MTN_GN: AVAILABLE_LOGOS.mtn,

  // === NIGER (NE) ===
  AIRTEL_NE: AVAILABLE_LOGOS.orange, // Fallback - logo Airtel non disponible
  MOOV_NE: AVAILABLE_LOGOS.moov,

  // === RD CONGO (CD) ===
  ORANGE_CD: AVAILABLE_LOGOS.orange,
  VODACOM_CD: AVAILABLE_LOGOS.mtn, // Fallback - logo Vodacom non disponible
  AIRTEL_CD: AVAILABLE_LOGOS.orange, // Fallback - logo Airtel non disponible
};

// Fonction pour obtenir le logo d'un opérateur
export const getOperatorLogo = (operatorCode: string): ImageSourcePropType | null => {
  return OPERATOR_LOGOS[operatorCode] || DEFAULT_LOGO;
};

// Couleurs des opérateurs pour le fallback
export const OPERATOR_COLORS: Record<string, string> = {
  // Orange
  ORANGE_SN: '#FF6600',
  ORANGE_CI: '#FF6600',
  ORANGE_ML: '#FF6600',
  ORANGE_BF: '#FF6600',
  ORANGE_CM: '#FF6600',
  ORANGE_GN: '#FF6600',
  ORANGE_CD: '#FF6600',
  
  // MTN
  MTN_BJ: '#FFCC00',
  MTN_CI: '#FFCC00',
  MTN_CG: '#FFCC00',
  MTN_CM: '#FFCC00',
  MTN_GN: '#FFCC00',
  
  // Moov
  MOOV_BJ: '#FF6B00',
  MOOV_CI: '#FF6B00',
  MOOV_TG: '#FF6B00',
  MOOV_ML: '#FF6B00',
  MOOV_BF: '#FF6B00',
  MOOV_NE: '#FF6B00',
  
  // Wave
  WAVE_SN: '#1DC9FF',
  WAVE_CI: '#1DC9FF',
  
  // Free/Yas
  FREE_SN: '#003399',
  
  // Airtel
  AIRTEL_NE: '#ED1C24',
  AIRTEL_CD: '#ED1C24',
  
  // Vodacom
  VODACOM_CD: '#E60000',
  
  // Autres
  CELTIIS_BJ: '#00A651',
  TOGOCOM_TG: '#E30613',
};

export const getOperatorColor = (operatorCode: string): string => {
  return OPERATOR_COLORS[operatorCode] || '#6B7280';
};
