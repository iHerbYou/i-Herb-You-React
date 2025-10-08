import { get, post, patch, del } from './api';

// 장바구니 관련 타입 정의
export type CartItemDTO = {
  cartProductId: number;
  productVariantId: number;
  productId: number;
  productName: string;
  brandName: string;
  imageUrl: string;
  price: number;
  qty: number;
  isSelected: boolean;
  stockQuantity: number;
  isOutOfStock: boolean;
};

export type OrderSummaryDTO = {
  selectedItemCount: number;
  subTotal: number;
  shippingFee: number;
  totalAmount: number;
};

export type RecommendedProductDTO = {
  productId: number;
  productName: string;
  imageUrl: string;
  price: number;
};

export type CartResponseDTO = {
  cartId: number;
  guestToken: string;
  items: CartItemDTO[];
  summary: OrderSummaryDTO;
  recommendedProducts: RecommendedProductDTO[];
};

export type AddToCartRequestDTO = {
  productVariantId: number;
  qty: number;
};

export type UpdateQtyRequestDTO = {
  qty: number;
};

export type UpdateSelectionRequestDTO = {
  isSelected: boolean;
};

export type DeleteSelectedRequestDTO = {
  cartProductIds: number[];
};

export type CartMessageResponseDTO = {
  cartId: number;
  message: string;
  guestToken: string;
};

// 게스트 토큰 관리
export function getGuestToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ihy_guest_token');
}

export function setGuestToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('ihy_guest_token', token);
}

export function clearGuestToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('ihy_guest_token');
}

// 장바구니 API 함수들
export async function getCart(): Promise<CartResponseDTO> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const response = await get<CartResponseDTO>('/api/cart', { 
    auth: false,
    headers 
  });

  // 게스트 토큰이 응답에 포함되어 있으면 저장
  if (response.guestToken) {
    setGuestToken(response.guestToken);
  }

  return response;
}

export async function addToCart(productVariantId: number, qty: number): Promise<CartMessageResponseDTO> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const request: AddToCartRequestDTO = {
    productVariantId,
    qty
  };

  const response = await post<CartMessageResponseDTO>(
    '/api/cart/items',
    request,
    { 
      auth: false,
      headers 
    }
  );

  // 게스트 토큰이 응답에 포함되어 있으면 저장
  if (response.guestToken) {
    setGuestToken(response.guestToken);
  }

  return response;
}

export async function updateQuantity(cartProductId: number, qty: number): Promise<void> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const request: UpdateQtyRequestDTO = { qty };

  await patch(
    `/api/cart/items/${cartProductId}/quantity`,
    request,
    { 
      auth: false,
      headers 
    }
  );
}

export async function updateSelection(cartProductId: number, isSelected: boolean): Promise<void> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const request: UpdateSelectionRequestDTO = { isSelected };

  await patch(
    `/api/cart/items/${cartProductId}/select`,
    request,
    { 
      auth: false,
      headers 
    }
  );
}

export async function updateAllSelection(isSelected: boolean): Promise<void> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  const request: UpdateSelectionRequestDTO = { isSelected };

  await patch(
    '/api/cart/items/select-all',
    request,
    { 
      auth: false,
      headers 
    }
  );
}

export async function deleteCartProduct(cartProductId: number): Promise<void> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  await del(
    `/api/cart/items/${cartProductId}`,
    undefined,  // body
    { 
      auth: false,
      headers 
    }
  );
}

export async function deleteSelectedCartProducts(cartProductIds: number[]): Promise<void> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  await post(
    '/api/cart/items/delete-selected',
    { cartProductIds },  // body
    { 
      auth: false,
      headers
    }
  );
}

export async function mergeGuestCart(): Promise<void> {
  const headers: Record<string, string> = {};
  const guestToken = getGuestToken();
  if (guestToken) {
    headers['X-Guest-Token'] = guestToken;
  }

  await post(
    '/api/cart/merge',
    undefined,
    { 
      auth: true,
      headers 
    }
  );
}
