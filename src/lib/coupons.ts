import { get, post } from './api';

// 사용 가능한 쿠폰
export type UsableCouponDto = {
  userCouponId: number;
  name: string;
  amount: number;
  expiresAt: string;
  combinable: boolean;
};

// 웰컴 쿠폰 응답
export type WelcomeCouponResponse = {
  issued: boolean;
  coupon: UsableCouponDto | null;
};

// 쿠폰 잠금 요청
export type LockCouponRequest = {
  couponCode: string;
};

// 쿠폰 잠금 결과
export type CouponLockResultDto = {
  userCouponId: number;
};

// 쿠폰 확정 요청
export type RedeemCouponRequest = {
  userCouponId: number;
  discountAmount: number;
};

// 쿠폰 해제 요청
export type ReleaseCouponRequest = {
  userCouponId: number;
};

// 웰컴 쿠폰 발급
export async function issueWelcomeCoupon(userId: number): Promise<WelcomeCouponResponse> {
  return await post<WelcomeCouponResponse>(
    `/api/users/${userId}/coupons/welcome`,
    undefined,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 사용 가능한 쿠폰 목록 조회
export async function getUsableCoupons(userId: number): Promise<UsableCouponDto[]> {
  return await get<UsableCouponDto[]>(
    `/api/users/${userId}/coupons/usable`,
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 주문 시 쿠폰 잠금
export async function lockCoupon(orderId: number, couponCode: string): Promise<CouponLockResultDto> {
  return await post<CouponLockResultDto>(
    `/api/orders/${orderId}/coupons/lock`,
    { couponCode },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 결제 성공 시 쿠폰 확정
export async function redeemCoupon(orderId: number, userCouponId: number, discountAmount: number): Promise<void> {
  await post(
    `/api/orders/${orderId}/coupons/redeem`,
    { userCouponId, discountAmount },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}

// 결제 실패/취소 시 쿠폰 해제
export async function releaseCoupon(orderId: number, userCouponId: number): Promise<void> {
  await post(
    `/api/orders/${orderId}/coupons/release`,
    { userCouponId },
    { 
      credentials: 'include',
      auth: true 
    }
  );
}
