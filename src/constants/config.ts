export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mbotamapay-backend.onrender.com/api/v1';

// Tous les pays supportés par le backend
export const COUNTRY_CODES = [
  { code: '+221', country: 'SN', name: 'Sénégal', flag: '🇸🇳', currency: 'XOF' },
  { code: '+229', country: 'BJ', name: 'Bénin', flag: '🇧🇯', currency: 'XOF' },
  { code: '+225', country: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', currency: 'XOF' },
  { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱', currency: 'XOF' },
  { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫', currency: 'XOF' },
  { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬', currency: 'XOF' },
  { code: '+227', country: 'NE', name: 'Niger', flag: '🇳🇪', currency: 'XOF' },
  { code: '+224', country: 'GN', name: 'Guinée', flag: '🇬🇳', currency: 'GNF' },
  { code: '+237', country: 'CM', name: 'Cameroun', flag: '🇨🇲', currency: 'XAF' },
  { code: '+242', country: 'CG', name: 'Congo-Brazzaville', flag: '🇨🇬', currency: 'XAF' },
  { code: '+243', country: 'CD', name: 'RD Congo', flag: '🇨🇩', currency: 'CDF' },
  { code: '+234', country: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN' },
];

// Mapping préfixe téléphonique -> code ISO pays
export const PHONE_PREFIX_TO_ISO: Record<string, string> = {
  '+221': 'SN',
  '+229': 'BJ',
  '+225': 'CI',
  '+223': 'ML',
  '+226': 'BF',
  '+228': 'TG',
  '+227': 'NE',
  '+224': 'GN',
  '+237': 'CM',
  '+242': 'CG',
  '+243': 'CD',
  '+234': 'NG',
};

export const OTP_LENGTH = 6;
export const OTP_RESEND_DELAY = 60; // seconds
