import { post } from './api';

// 결제 승인 요청 DTO
export type ConfirmRequest = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

// 결제 승인 응답 DTO
export type ConfirmResponse = {
  status: string;
  paymentKey: string;
  orderId: string;
  amount: number;
  method?: string;
  approvedAt?: string;
};

// 토스페이먼츠 결제 승인
export async function confirmTossPayment(data: ConfirmRequest): Promise<ConfirmResponse> {
  return await post<ConfirmResponse>(
    '/api/payments/confirm',
    data,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

