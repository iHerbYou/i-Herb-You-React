import { get } from './api';

// 주문 요약 (목록용)
export type OrderSummaryDto = {
  id: number;
  orderDate: string;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  orderStatusKey: number;
};

// 주문 아이템
export type OrderItemDto = {
  productId: number;
  productName: string;
  thumbnailUrl: string;
  qty: number;
  unitPrice: number;
};

// 주문 상세
export type OrderDetailDto = {
  id: number;
  orderStatusKey: number;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  totalPrice: number;
  customsInfo?: string;
  orderDate: string;
  deliveryCompany?: string;
  trackingNumber?: string;
  delStartAt?: string;
  delCompleteAt?: string;
  deliveryStatusKey?: number;
  items: OrderItemDto[];
};

// 페이지 응답
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
};

// 주문 목록 조회 (페이지네이션)
export async function getMyOrders(page: number = 0, size: number = 10): Promise<PageResponse<OrderSummaryDto>> {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  
  return await get<PageResponse<OrderSummaryDto>>(
    `/api/orders?${params.toString()}`,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 주문 상세 조회
export async function getOrderDetail(orderId: number): Promise<OrderDetailDto> {
  return await get<OrderDetailDto>(
    `/api/orders/${orderId}`,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

