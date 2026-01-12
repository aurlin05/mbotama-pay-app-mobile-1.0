import { create } from 'zustand';
import type { MobileOperator, TransferPreviewResponse } from '../types/api';
import { COUNTRY_CODES } from '../constants/config';

interface TransferState {
  // Source
  senderPhone: string;
  sourceOperators: MobileOperator[];
  selectedSourceOperator: MobileOperator | null;
  
  // Recipient
  recipientPhone: string;
  recipientName: string;
  selectedCountry: typeof COUNTRY_CODES[0];
  destOperators: MobileOperator[];
  selectedDestOperator: MobileOperator | null;
  detectedDestCountry: string | null;
  
  // Amount
  amount: string;
  description: string;
  
  // Preview & Result
  preview: TransferPreviewResponse | null;
  transactionRef: string | null;
  
  // Actions
  setSenderPhone: (phone: string) => void;
  setSourceOperators: (operators: MobileOperator[]) => void;
  setSelectedSourceOperator: (operator: MobileOperator | null) => void;
  setRecipientPhone: (phone: string) => void;
  setRecipientName: (name: string) => void;
  setSelectedCountry: (country: typeof COUNTRY_CODES[0]) => void;
  setDestOperators: (operators: MobileOperator[]) => void;
  setSelectedDestOperator: (operator: MobileOperator | null) => void;
  setDetectedDestCountry: (country: string | null) => void;
  setAmount: (amount: string) => void;
  setDescription: (description: string) => void;
  setPreview: (preview: TransferPreviewResponse | null) => void;
  setTransactionRef: (ref: string | null) => void;
  resetTransfer: () => void;
}

const initialState = {
  senderPhone: '',
  sourceOperators: [],
  selectedSourceOperator: null,
  recipientPhone: '',
  recipientName: '',
  selectedCountry: COUNTRY_CODES[0],
  destOperators: [],
  selectedDestOperator: null,
  detectedDestCountry: null,
  amount: '',
  description: '',
  preview: null,
  transactionRef: null,
};

export const useTransferStore = create<TransferState>((set) => ({
  ...initialState,
  
  setSenderPhone: (phone) => set({ senderPhone: phone }),
  setSourceOperators: (operators) => set({ sourceOperators: operators }),
  setSelectedSourceOperator: (operator) => set({ selectedSourceOperator: operator }),
  setRecipientPhone: (phone) => set({ recipientPhone: phone }),
  setRecipientName: (name) => set({ recipientName: name }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setDestOperators: (operators) => set({ destOperators: operators }),
  setSelectedDestOperator: (operator) => set({ selectedDestOperator: operator }),
  setDetectedDestCountry: (country) => set({ detectedDestCountry: country }),
  setAmount: (amount) => set({ amount }),
  setDescription: (description) => set({ description }),
  setPreview: (preview) => set({ preview }),
  setTransactionRef: (ref) => set({ transactionRef: ref }),
  resetTransfer: () => set(initialState),
}));
