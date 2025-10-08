import { post } from './api';

// 주문 생성 요청
export type OrderItemDto = {
  productVariantId: number;
  qty: number;
  unitPrice: number;
  regularPrice: number;
};

export type OrderCreateDto = {
  customsInfo?: string;
  deliveryFee: number;
  discount: number;
  items: OrderItemDto[];
};

// 주문 생성 응답
export type OrderSummaryDto = {
  id: number;
  orderDate: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  orderStatusKey: number;
};

// 결제 요청
export type PaymentRequestDto = {
  methodCodeValue: number;
};

// 결제 응답
export type PaymentResponseDto = {
  paymentId: number;
  orderId: number;
  paymentPrice: number;
  paymentStatusKey: number;
  paymentMethodKey: number;
  requestedAt: string;
  paidAt: string | null;
  externalOrderKey: string;
};

// 결제 완료/취소/실패
export type PaymentCancelDto = {
  actor?: string;
};

export type PaymentFailDto = {
  reason: string;
};

// 주문 생성
export async function createOrder(orderData: OrderCreateDto): Promise<OrderSummaryDto> {
  return await post<OrderSummaryDto>('/api/orders', orderData, { 
    credentials: 'include',
    auth: true 
  });
}

// 결제 요청
export async function requestPayment(orderId: number, paymentData: PaymentRequestDto): Promise<PaymentResponseDto> {
  return await post<PaymentResponseDto>(
    `/api/orders/${orderId}/payments`,
    paymentData,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 결제 완료
export async function completePayment(paymentId: number): Promise<void> {
  await post(`/api/payments/${paymentId}/complete`, undefined, {
    credentials: 'include',
    auth: true
  });
}

// 결제 취소
export async function cancelPayment(paymentId: number, actor?: string): Promise<void> {
  await post(
    `/api/payments/${paymentId}/cancel`,
    actor ? { actor } : undefined,
    {
      credentials: 'include',
      auth: true
    }
  );
}

// 결제 실패
export async function failPayment(paymentId: number, reason: string): Promise<void> {
  await post(
    `/api/payments/${paymentId}/fail`,
    { reason },
    {
      credentials: 'include',
      auth: true
    }
  );
}
