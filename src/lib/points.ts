import { get, post } from './api';

// 포인트 잔액
export type PointBalanceDto = {
  userId: number;
  balance: number;
};

// 포인트 이력
export type PointHistoryItemDto = {
  type: number | null;
  amount: number;
  balanceAfter: number;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
  orderId: number | null;
  reviewId: number | null;
};

// 리뷰 포인트 적립 요청
export type GrantReviewPointsRequest = {
  userId: number;
  containsImage: boolean;
};

// 구매 확정 포인트 적립 요청
export type GrantOrderCompletionPointsRequest = {
  userId: number;
  paymentAmount: number;
};

// 포인트 사용/복구 요청
export type UsePointsRequest = {
  userId: number;
  amount: number;
};

// 리뷰 포인트 적립
export async function grantReviewPoints(
  reviewId: number,
  userId: number,
  containsImage: boolean
): Promise<PointBalanceDto> {
  return await post<PointBalanceDto>(
    `/api/reviews/${reviewId}/points`,
    { userId, containsImage },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 구매 확정 포인트 적립
export async function grantOrderCompletionPoints(
  orderId: number,
  userId: number,
  paymentAmount: number
): Promise<PointBalanceDto> {
  return await post<PointBalanceDto>(
    `/api/orders/${orderId}/points/earn`,
    { userId, paymentAmount },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 포인트 사용
export async function usePoints(
  orderId: number,
  userId: number,
  amount: number
): Promise<PointBalanceDto> {
  return await post<PointBalanceDto>(
    `/api/orders/${orderId}/points/use`,
    { userId, amount },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 포인트 복구
export async function restorePoints(
  orderId: number,
  userId: number,
  amount: number
): Promise<PointBalanceDto> {
  return await post<PointBalanceDto>(
    `/api/orders/${orderId}/points/restore`,
    { userId, amount },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 포인트 잔액 조회
export async function getPointBalance(userId: number): Promise<PointBalanceDto> {
  return await get<PointBalanceDto>(
    `/api/users/${userId}/points`,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 포인트 이력 조회
export async function getPointHistory(userId: number): Promise<PointHistoryItemDto[]> {
  return await get<PointHistoryItemDto[]>(
    `/api/users/${userId}/points/history`,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}
