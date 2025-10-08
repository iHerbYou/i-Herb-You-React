import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createOrder, requestPayment, type OrderItemDto } from '../lib/orders';
import { getUsableCoupons, type UsableCouponDto } from '../lib/coupons';
import { getPointBalance, usePoints, restorePoints } from '../lib/points';
import { getAuth, getCurrentUser, type UserInfoResponseDto } from '../lib/auth';
import ConfirmModal from '../components/ConfirmModal';
import CouponSelectModal from '../components/CouponSelectModal';

// 결제 수단 코드
const PAYMENT_METHODS = [
  { code: 4101, name: '네이버페이', icon: 'N' },
  { code: 4102, name: '페이코', icon: 'P' },
  { code: 4103, name: '카카오페이', icon: 'K' },
  { code: 4104, name: '신용/체크카드', icon: '💳' },
  { code: 4105, name: '무통장입금', icon: '🏦' },
];

const Order: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems, refreshCart } = useCart();
  const auth = getAuth();

  // 장바구니에서 선택된 상품만 가져오기
  const selectedItems = cartItems.filter(item => item.isSelected);

  // 주문 상품이 없으면 장바구니로 리다이렉트
  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart');
    }
  }, [selectedItems.length, navigate]);

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfoResponseDto | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  // 사용자 정보, 쿠폰, 포인트 데이터 로드
  useEffect(() => {
    if (auth?.userId) {
      loadUserData();
    }
  }, [auth?.userId]);

  const loadUserData = async () => {
    if (!auth?.userId) return;

    try {
      const [userData, couponsData, pointsData] = await Promise.all([
        getCurrentUser(),
        getUsableCoupons(auth.userId),
        getPointBalance(auth.userId),
      ]);
      setUserInfo(userData);
      setCoupons(couponsData);
      setAvailablePoints(pointsData.balance);
    } catch (err: any) {
      alert(err.message || '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingUserInfo(false);
    }
  };

  // 배송 정보 (사용자 정보에서 자동으로 채워짐)
  const recipient = userInfo?.name || '수령인';
  const phone = userInfo?.phoneNumber || '연락처';
  const address = '서울특별시 강남구 강남대로 364'; // TODO: 배송지 API 연동 필요
  const [customsInfo, setCustomsInfo] = useState('');

  // 결제 수단
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(4101);
  const [rememberPaymentMethod, setRememberPaymentMethod] = useState(false);

  // 쿠폰 & 포인트
  const [coupons, setCoupons] = useState<UsableCouponDto[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<UsableCouponDto | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [usedPointsOrderId, setUsedPointsOrderId] = useState<number | null>(null);

  // 모달 상태
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [submitting, setSubmitting] = useState(false);

  // 금액 계산
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const deliveryFee = subtotal >= 50000 ? 0 : 3000;
  
  // 쿠폰 할인 계산
  const couponDiscount = selectedCoupon
    ? selectedCoupon.amount >= 1
      ? selectedCoupon.amount // 정액 할인
      : Math.floor(subtotal * selectedCoupon.amount) // 정률 할인
    : 0;
  
  const totalDiscount = couponDiscount + pointsToUse;
  const totalPrice = Math.max(0, subtotal + deliveryFee - totalDiscount);

  // 최소 주문 금액
  const MIN_ORDER_AMOUNT = 50000;

  // 장바구니로 돌아가기
  const handleBackToCart = () => {
    setConfirmModal({
      isOpen: true,
      title: '장바구니로 돌아가기',
      message: '작성 중인 주문 정보가 사라집니다. 장바구니로 돌아가시겠습니까?',
      onConfirm: () => {
        navigate('/cart');
      }
    });
  };

  // 포인트 전액 사용
  const handleUseAllPoints = () => {
    const maxUsable = Math.min(availablePoints, subtotal + deliveryFee - couponDiscount);
    setPointsToUse(maxUsable);
  };

  // 쿠폰 선택
  const handleCouponSelect = (coupon: UsableCouponDto | null) => {
    setSelectedCoupon(coupon);
    // 쿠폰 변경 시 포인트 재조정 (음수 방지)
    if (coupon) {
      const newCouponDiscount = coupon.amount >= 1
        ? coupon.amount
        : Math.floor(subtotal * coupon.amount);
      const maxPoints = Math.max(0, subtotal + deliveryFee - newCouponDiscount);
      if (pointsToUse > maxPoints) {
        setPointsToUse(maxPoints);
      }
    }
  };

  // 주문하기
  const handleOrder = async () => {
    if (!auth?.userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 최소 주문 금액 검증
    if (subtotal < MIN_ORDER_AMOUNT && (selectedCoupon || pointsToUse > 0)) {
      alert(`쿠폰과 포인트는 ${MIN_ORDER_AMOUNT.toLocaleString()}원 이상 주문 시 사용 가능합니다.`);
      return;
    }

    setSubmitting(true);
    let orderId: number | null = null;

    try {
      // 1. 주문 생성
      const orderItems: OrderItemDto[] = selectedItems.map(item => ({
        productVariantId: item.productVariantId,
        qty: item.qty,
        unitPrice: item.price || 0,
        regularPrice: item.price || 0,
      }));

      const orderData = {
        customsInfo: customsInfo.trim() || undefined,
        deliveryFee,
        discount: totalDiscount,
        items: orderItems,
      };

      const orderResult = await createOrder(orderData);
      orderId = orderResult.id;

      // 2. 포인트 사용 (있는 경우)
      if (pointsToUse > 0) {
        await usePoints(orderId, auth.userId, pointsToUse);
        setUsedPointsOrderId(orderId);
      }

      // 3. 결제 요청
      const paymentResult = await requestPayment(orderId, {
        methodCodeValue: selectedPaymentMethod,
      });

      // 4. 결제 수단별 페이지로 이동 (TODO: 실제 PG 연동)
      alert(`주문이 생성되었습니다. 주문번호: ${orderResult.id}\n결제ID: ${paymentResult.paymentId}`);
      
      // 장바구니 새로고침 (주문한 상품 제거)
      await refreshCart();
      
      // 주문 완료 페이지로 이동 (TODO: 주문 완료 페이지 구현)
      navigate('/');
    } catch (error: any) {
      // 실패 시 포인트 복구
      if (orderId && usedPointsOrderId === orderId && pointsToUse > 0) {
        try {
          await restorePoints(orderId, auth.userId, pointsToUse);
          setUsedPointsOrderId(null);
        } catch (restoreError) {
          // 복구 실패는 로그만 남김
        }
      }
      alert(error.message || '주문 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 상단 네비게이션 */}
        <div className="mb-6">
          <button
            onClick={handleBackToCart}
            className="flex items-center gap-2 text-sm text-brand-gray-600 hover:text-brand-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            장바구니로 돌아가기
          </button>
          <h1 className="text-2xl font-bold text-brand-gray-900 mt-4">주문서 작성</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 배송 정보, 결제 수단, 쿠폰/포인트 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 배송 정보 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-gray-900">배송 정보</h2>
                <button className="text-sm text-brand-pink hover:text-brand-pink/80">
                  변경
                </button>
              </div>
              {loadingUserInfo ? (
                <div className="space-y-2 text-sm animate-pulse">
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">수령인</span>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">연락처</span>
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">주소</span>
                    <div className="h-5 bg-gray-200 rounded w-48"></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">수령인</span>
                    <span className="text-brand-gray-900">{recipient}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">연락처</span>
                    <span className="text-brand-gray-900">{phone}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">주소</span>
                    <span className="text-brand-gray-900">{address}</span>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <label className="block text-sm text-brand-gray-700 mb-2">
                  개인통관고유부호 (선택)
                </label>
                <input
                  type="text"
                  value={customsInfo}
                  onChange={(e) => setCustomsInfo(e.target.value)}
                  maxLength={50}
                  placeholder="P로 시작하는 13자리 번호"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </div>
            </div>

            {/* 결제 수단 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">결제 수단</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method.code}
                    onClick={() => setSelectedPaymentMethod(method.code)}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedPaymentMethod === method.code
                        ? 'border-brand-pink bg-brand-pink/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <div className="text-sm font-medium text-brand-gray-900">{method.name}</div>
                  </button>
                ))}
              </div>
              <label className="flex items-center text-sm text-brand-gray-700">
                <input
                  type="checkbox"
                  checked={rememberPaymentMethod}
                  onChange={(e) => setRememberPaymentMethod(e.target.checked)}
                  className="w-4 h-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink mr-2"
                />
                결제방법 기억하기
              </label>
            </div>

            {/* 쿠폰 & 포인트 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">쿠폰 & 포인트</h2>
              
              {/* 쿠폰 */}
              <div className="mb-4">
                <label className="block text-sm text-brand-gray-700 mb-2">
                  쿠폰 선택 (사용 가능: {coupons.length}개)
                </label>
                <button
                  onClick={() => setCouponModalOpen(true)}
                  disabled={subtotal < MIN_ORDER_AMOUNT}
                  className={`w-full border rounded-md px-3 py-2 text-sm text-left transition-colors ${
                    subtotal < MIN_ORDER_AMOUNT
                      ? 'border-gray-200 text-brand-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-brand-gray-600 hover:border-brand-pink'
                  }`}
                >
                  {selectedCoupon
                    ? `${selectedCoupon.name} (-${couponDiscount.toLocaleString()}원)`
                    : '사용 가능한 쿠폰 선택'
                  }
                </button>
                {subtotal < MIN_ORDER_AMOUNT && (
                  <p className="text-xs text-red-500 mt-1">
                    {MIN_ORDER_AMOUNT.toLocaleString()}원 이상 주문 시 사용 가능
                  </p>
                )}
              </div>

              {/* 포인트 */}
              <div>
                <label className="block text-sm text-brand-gray-700 mb-2">
                  포인트 사용 (보유: {availablePoints.toLocaleString()}P)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={pointsToUse}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      const maxUsable = Math.min(availablePoints, subtotal + deliveryFee - couponDiscount);
                      setPointsToUse(Math.min(Math.max(0, value), maxUsable));
                    }}
                    disabled={subtotal < MIN_ORDER_AMOUNT}
                    min={0}
                    max={Math.min(availablePoints, subtotal + deliveryFee - couponDiscount)}
                    className={`flex-1 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink ${
                      subtotal < MIN_ORDER_AMOUNT
                        ? 'border-gray-200 bg-gray-50 text-brand-gray-400 cursor-not-allowed'
                        : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={handleUseAllPoints}
                    disabled={subtotal < MIN_ORDER_AMOUNT}
                    className={`px-4 py-2 text-sm border rounded-md transition-colors ${
                      subtotal < MIN_ORDER_AMOUNT
                        ? 'border-gray-200 text-brand-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-brand-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    최대 사용
                  </button>
                </div>
                {subtotal < MIN_ORDER_AMOUNT && (
                  <p className="text-xs text-red-500 mt-1">
                    {MIN_ORDER_AMOUNT.toLocaleString()}원 이상 주문 시 사용 가능
                  </p>
                )}
              </div>
            </div>

            {/* 주문 상품 내역 */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">
                주문 상품 ({selectedItems.length}개)
              </h2>
              <div className="space-y-4">
                {selectedItems.map((item) => (
                  <div key={item.cartProductId} className="flex items-center gap-4 pb-4 border-b last:border-b-0">
                    {/* 상품 이미지 */}
                    <div className="w-20 h-20 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-brand-gray-500 mb-1">{item.brandName}</p>
                      <p className="text-sm font-medium text-brand-gray-900 line-clamp-2 mb-2">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-brand-gray-600">수량: {item.qty}개</span>
                      </div>
                    </div>

                    {/* 가격 */}
                    <div className="text-right">
                      <p className="text-sm font-medium text-brand-gray-900">
                        {((item.price || 0) * item.qty).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽: 결제 금액 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-brand-gray-900 mb-4">결제 금액</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-600">상품 총액 ({selectedItems.length}개)</span>
                  <span className="text-brand-gray-900">{subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray-600">배송비</span>
                  <span className="text-brand-gray-900">
                    {deliveryFee === 0 ? '무료' : `${deliveryFee.toLocaleString()}원`}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-gray-600">할인</span>
                    <span className="text-red-600">-{totalDiscount.toLocaleString()}원</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-brand-gray-900">최종 결제 금액</span>
                    <span className="font-bold text-lg text-brand-gray-900">
                      {totalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={submitting || selectedItems.length === 0}
                className={`w-full py-3 rounded-md font-semibold transition-colors ${
                  submitting || selectedItems.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                }`}
              >
                {submitting ? '처리 중...' : `${totalPrice.toLocaleString()}원 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="확인"
        cancelText="취소"
      />

      {/* 쿠폰 선택 모달 */}
      <CouponSelectModal
        isOpen={couponModalOpen}
        onClose={() => setCouponModalOpen(false)}
        coupons={coupons}
        selectedCouponId={selectedCoupon?.userCouponId || null}
        onSelect={handleCouponSelect}
        minOrderAmount={MIN_ORDER_AMOUNT}
      />
    </div>
  );
};

export default Order;
