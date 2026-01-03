import { api } from './api';
import type {
  ApiResponse,
  PhoneAuthRequest,
  OtpVerifyRequest,
  AuthResponse,
} from '../types/api';

export const authService = {
  async register(data: PhoneAuthRequest) {
    const response = await api.post<ApiResponse<string>>('/auth/register', data);
    return response.data;
  },

  async login(data: PhoneAuthRequest) {
    const response = await api.post<ApiResponse<string>>('/auth/login', data);
    return response.data;
  },

  async verifyOtp(data: OtpVerifyRequest) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/verify-otp', data);
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      await api.setTokens(accessToken, refreshToken);
    }
    return response.data;
  },

  async resendOtp(data: PhoneAuthRequest) {
    const response = await api.post<ApiResponse<string>>('/auth/resend-otp', data);
    return response.data;
  },

  async refreshToken() {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/refresh-token');
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken } = response.data.data;
      await api.setTokens(accessToken, refreshToken);
    }
    return response.data;
  },

  async logout() {
    await api.clearTokens();
  },
};
