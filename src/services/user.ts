import { api } from './api';
import type {
  ApiResponse,
  User,
  UpdateProfileRequest,
  TransactionLimitInfo,
  KycStatusResponse,
  KycDocumentRequest,
} from '../types/api';

export const userService = {
  async getProfile() {
    const response = await api.get<ApiResponse<User>>('/users/me');
    return response.data;
  },

  async updateProfile(data: UpdateProfileRequest) {
    const response = await api.put<ApiResponse<User>>('/users/me', data);
    return response.data;
  },

  async getTransactionLimit() {
    const response = await api.get<ApiResponse<TransactionLimitInfo>>('/users/me/transaction-limit');
    return response.data;
  },

  async getKycStatus() {
    const response = await api.get<ApiResponse<KycStatusResponse>>('/kyc/status');
    return response.data;
  },

  async submitKycDocument(data: KycDocumentRequest) {
    const response = await api.post<ApiResponse<string>>('/kyc/documents', data);
    return response.data;
  },
};
