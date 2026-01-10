export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://mbotamapay-backend.onrender.com/api/v1';

export const COUNTRY_CODES = [
  { code: '+221', country: 'SN', name: 'Sénégal', flag: '🇸🇳' },
  { code: '+225', country: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮' },
  { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: '+229', country: 'BJ', name: 'Bénin', flag: '🇧🇯' },
  { code: '+227', country: 'NE', name: 'Niger', flag: '🇳🇪' },
  { code: '+224', country: 'GN', name: 'Guinée', flag: '🇬🇳' },
];

export const OTP_LENGTH = 6;
export const OTP_RESEND_DELAY = 60; // seconds
