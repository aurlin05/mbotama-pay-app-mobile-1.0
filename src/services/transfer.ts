import { api } from './api';
import type {
  ApiResponse,
  CountryOperators,
  TransferPreviewRequest,
  TransferPreviewResponse,
  TransferRequest,
  TransferResponse,
  TransactionRequest,
  TransactionResponse,
  PageResponse,
  PaymentInitResponse,
  PaymentStatusResponse,
} from '../types/api';

export const transferService = {
  async getOperatorsByCountry(country: string) {
    const response = await api.get<ApiResponse<CountryOperators>>('/operators/by-country', { country });
    return response.data;
  },

  async getOperatorsByPhone(phone: string) {
    const response = await api.get<ApiResponse<CountryOperators>>('/operators/by-phone', { phone });
    return response.data;
  },

  async validateOperator(code: string) {
    const response = await api.get<ApiResponse<boolean>>(`/operators/validate/${code}`);
    return response.data;
  },

  async previewTransfer(data: TransferPreviewRequest) {
    const response = await api.post<ApiResponse<TransferPreviewResponse>>('/transfers/preview', data);
    return response.data;
  },

  async createTransfer(data: TransferRequest) {
    const response = await api.post<ApiResponse<TransferResponse>>('/transfers', data);
    return response.data;
  },

  async createTransaction(data: TransactionRequest) {
    const response = await api.post<ApiResponse<TransactionResponse>>('/transactions', data);
    return response.data;
  },

  async getTransactions(page = 0, size = 10) {
    const response = await api.get<ApiResponse<PageResponse<TransactionResponse>>>('/transactions', { page, size });
    return response.data;
  },

  async getTransaction(id: number) {
    const response = await api.get<ApiResponse<TransactionResponse>>(`/transactions/${id}`);
    return response.data;
  },

  async initiatePayment(transactionId: number) {
    const response = await api.post<ApiResponse<PaymentInitResponse>>(`/payments/initiate/${transactionId}`);
    return response.data;
  },

  async getPaymentStatus(reference: string) {
    const response = await api.get<ApiResponse<PaymentStatusResponse>>(`/payments/status/${reference}`);
    return response.data;
  },
};
