// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Auth types
export interface PhoneAuthRequest {
  phoneNumber: string;
  countryCode: string;
}

export interface OtpVerifyRequest {
  phoneNumber: string;
  code: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// User types
export interface User {
  id: number;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  countryCode: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface TransactionLimitInfo {
  monthlyLimit: number;
  usedAmount: number;
}

// KYC types
export interface KycStatusResponse {
  status: 'NONE' | 'PENDING' | 'LEVEL_1' | 'LEVEL_2' | 'REJECTED';
  level: number;
}

export interface KycDocumentRequest {
  documentType: string;
  documentUrl: string;
}

// Operator types
export interface MobileOperator {
  code: string;
  name: string;
  logo?: string;
  color?: string;
  countryCode?: string;
}

export interface CountryInfo {
  code: string;
  name: string;
  flag: string;
  phonePrefix: string;
  currency: string;
}

export interface CountryOperators {
  country: CountryInfo | null;
  operators: MobileOperator[];
}

// Transfer types
export interface TransferPreviewRequest {
  senderPhone: string;
  sourceOperator: string;
  recipientPhone: string;
  destOperator: string;
  amount: number;
}

export interface TransferRequest extends TransferPreviewRequest {
  recipientName: string;
  description?: string;
}

export interface TransferPreviewResponse {
  available: boolean;
  amount: number;
  fee: number;
  totalAmount: number;
  feePercent: number;
  gatewayFee: number;
  appFee: number;
  gateway: string;
  sourceCountry: string;
  destCountry: string;
  sourceOperatorName: string;
  destOperatorName: string;
  useStock: boolean;
  reason?: string;
  // Aliases pour compatibilité
  fees?: number;
  total?: number;
}

export interface TransferResponse {
  success: boolean;
  transactionId: number;
  reference: string;
  amount: number;
  fee: number;
  totalAmount: number;
  feePercent: number;
  status: string;
  message: string;
  gateway: string;
  sourceCountry: string;
  destCountry: string;
  sourceOperatorName: string;
  destOperatorName: string;
  // Alias pour compatibilité
  id?: number;
}

// Transaction types
export interface TransactionRequest {
  recipientPhone: string;
  recipientName: string;
  amount: number;
  platform: string;
  description?: string;
}

export interface TransactionResponse {
  id: number;
  status: string;
  amount: number;
  currency?: string;
  type?: 'OUTGOING' | 'INCOMING' | 'TRANSFER';
  recipientPhone?: string;
  recipientName?: string;
  operatorCode?: string;
  operatorName?: string;
  createdAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
}

// Payment types
export interface PaymentInitResponse {
  reference: string;
  redirectUrl: string;
}

export interface PaymentStatusResponse {
  reference: string;
  status: string;
}

// Refund types
export interface RefundRequest {
  reason: string;
}

export interface RefundResponse {
  id: number;
  status: string;
}

// User Limits types
export interface UserLimitsResponse {
  kycLevel: string;
  kycLevelDisplayName: string;
  dailyLimits: {
    limit: number;
    used: number;
    remaining: number;
    percentageUsed: number;
  };
  monthlyLimits: {
    limit: number;
    used: number;
    remaining: number;
    percentageUsed: number | null;
    unlimited: boolean;
  };
}
