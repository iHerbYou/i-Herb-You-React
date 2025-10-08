import React from 'react';
import { createPortal } from 'react-dom';
import type { UsableCouponDto } from '../lib/coupons';

type CouponSelectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  coupons: UsableCouponDto[];
  selectedCouponId: number | null;
  onSelect: (coupon: UsableCouponDto | null) => void;
  minOrderAmount?: number;
};

const CouponSelectModal: React.FC<CouponSelectModalProps> = ({
  isOpen,
  onClose,
  coupons,
  selectedCouponId,
  onSelect,
  minOrderAmount = 50000,
}) => {
  if (!isOpen) return null;

  const handleSelect = (coupon: UsableCouponDto | null) => {
    onSelect(coupon);
    onClose();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div
        className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-brand-gray-900">쿠폰 선택</h2>
          <button
            onClick={onClose}
            className="text-brand-gray-400 hover:text-brand-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 쿠폰 목록 */}
        <div className="flex-1 overflow-y-auto p-6">
          {coupons.length === 0 ? (
            <div className="text-center py-8 text-brand-gray-500">
              사용 가능한 쿠폰이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {/* 쿠폰 미사용 옵션 */}
              <button
                onClick={() => handleSelect(null)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                  selectedCouponId === null
                    ? 'border-brand-pink bg-brand-pink/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-brand-gray-900">쿠폰 사용 안 함</div>
              </button>

              {/* 쿠폰 목록 */}
              {coupons.map((coupon) => (
                <button
                  key={coupon.userCouponId}
                  onClick={() => handleSelect(coupon)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-colors ${
                    selectedCouponId === coupon.userCouponId
                      ? 'border-brand-pink bg-brand-pink/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-brand-gray-900 mb-1">
                        {coupon.name}
                      </div>
                      <div className="text-sm text-brand-gray-600">
                        {coupon.amount >= 1 
                          ? `${coupon.amount.toLocaleString()}원 할인`
                          : `${(coupon.amount * 100).toFixed(0)}% 할인`
                        }
                      </div>
                    </div>
                    <div className="text-lg font-bold text-brand-pink ml-2">
                      {coupon.amount >= 1 
                        ? `${coupon.amount.toLocaleString()}원`
                        : `${(coupon.amount * 100).toFixed(0)}%`
                      }
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-gray-500">
                    <span>유효기간: {formatDate(coupon.expiresAt)}까지</span>
                    {coupon.combinable && (
                      <span className="text-brand-pink">중복사용 가능</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 최소 주문 금액 안내 */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-brand-gray-600">
            ℹ️ 쿠폰은 {minOrderAmount.toLocaleString()}원 이상 주문 시 사용 가능합니다.
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CouponSelectModal;
