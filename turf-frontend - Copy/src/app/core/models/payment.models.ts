export interface Payment {
  id: number;
  bookingId: number;
  username: string;
  amount: number;
  currency: string;
  provider: 'MOCK' | 'RAZORPAY' | string;
  providerOrderId?: string;
  providerPaymentId?: string;
  checkoutKey?: string | null;
  status: 'CREATED' | 'SUCCESS' | 'FAILED' | 'INITIATED';
  paymentTime?: string;
}

export interface PaymentOrderPayload {
  amount: number;
  currency?: string;
  provider?: string;
}

export interface PaymentVerificationPayload {
  providerOrderId?: string;
  providerPaymentId: string;
  signature?: string;
}
