import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { createOrder, requestPayment, type OrderItemDto } from '../lib/orders';
import { getUsableCoupons, type UsableCouponDto } from '../lib/coupons';
import { getPointBalance, usePoints, restorePoints } from '../lib/points';
import { getAuth, getCurrentUser, type UserInfoResponseDto } from '../lib/auth';
import { getAddresses, type UserAddressResponseDto } from '../lib/addresses';
import ConfirmModal from '../components/ConfirmModal';
import CouponSelectModal from '../components/CouponSelectModal';
import AddressManageModal from '../components/AddressManageModal';

// 토스페이먼츠 클라이언트 키 (테스트용)
const TOSS_CLIENT_KEY = 'test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm';

const Order: React.FC = () => {
  const navigate = useNavigate();
  const { items: cartItems } = useCart();
  const auth = getAuth();

  // 장바구니에서 선택된 상품만 가져오기
  const selectedItems = cartItems.filter(item => item.isSelected);
  
  // 결제할 상품들의 cartProductId 목록
  const selectedCartProductIds = selectedItems.map(item => item.cartProductId);

  // 주문 상품이 없으면 장바구니로 리다이렉트
  useEffect(() => {
    if (selectedItems.length === 0) {
      navigate('/cart');
    }
  }, [selectedItems.length, navigate]);

  // 사용자 정보 상태
  const [userInfo, setUserInfo] = useState<UserInfoResponseDto | null>(null);
  const [loadingUserInfo, setLoadingUserInfo] = useState(true);

  // 배송지 상태
  const [selectedAddress, setSelectedAddress] = useState<UserAddressResponseDto | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [customsInfo, setCustomsInfo] = useState('');

  // 사용자 정보, 배송지, 쿠폰, 포인트 데이터 로드
  useEffect(() => {
    if (auth?.userId) {
      loadUserData();
    }
  }, [auth?.userId]);

  const loadUserData = async () => {
    if (!auth?.userId) return;

    try {
      const [userData, addressesData, couponsData, pointsData] = await Promise.all([
        getCurrentUser(),
        getAddresses(),
        getUsableCoupons(),
        getPointBalance(),
      ]);
      setUserInfo(userData);
      setCoupons(couponsData);
      setAvailablePoints(pointsData.balance);

      // 기본 배송지 자동 선택
      const defaultAddress = addressesData.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (addressesData.length > 0) {
        setSelectedAddress(addressesData[0]);
      }
    } catch (err: any) {
      alert(err.message || '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoadingUserInfo(false);
    }
  };

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

  // 토스페이먼츠 위젯 상태
  const [paymentWidget, setPaymentWidget] = useState<TossPayments.PaymentWidget | null>(null);
  const [widgetLoading, setWidgetLoading] = useState(true);

  // 전화번호 포맷팅 함수
  const formatPhoneNumber = (value: string): string => {
    // 숫자만 추출
    const numbers = value.replace(/[^\d]/g, '');
    
    // 길이에 따라 포맷팅
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    } else if (numbers.length <= 10) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  // 금액 계산
  const subtotal = selectedItems.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
  const deliveryFee = subtotal >= 50000 ? 0 : 2500;
  
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

  // 토스페이먼츠 위젯 초기화
  useEffect(() => {
    if (!auth?.userId || loadingUserInfo || selectedItems.length === 0) {
      setWidgetLoading(false);
      return;
    }

    let isSubscribed = true;

    const initializeWidget = async () => {
      try {
        setWidgetLoading(true);

        // SDK 로드 대기
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.TossPayments && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.TossPayments) {
          console.error('토스페이먼츠 SDK를 로드할 수 없습니다.');
          setWidgetLoading(false);
          return;
        }

        if (!isSubscribed) return;

        const amount = Math.floor(Number(totalPrice));
        
        if (amount <= 0 || !Number.isFinite(amount)) {
          console.error('유효하지 않은 금액:', amount);
          setWidgetLoading(false);
          return;
        }
        
        const tossPayments = window.TossPayments(TOSS_CLIENT_KEY);
        const customerKey = `customer_${auth.userId}`;
        
        const widgets = tossPayments.widgets({ customerKey });
        
        if (!isSubscribed) return;
        
        setPaymentWidget(widgets);

        // 1. 금액 설정 (필수 - 먼저 호출해야 함)
        await widgets.setAmount({
          currency: 'KRW',
          value: amount
        });

        // 2. 결제 수단 위젯과 이용약관 위젯을 병렬로 렌더링
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-widget',
            variantKey: 'DEFAULT'
          }),
          widgets.renderAgreement({
            selector: '#agreement-widget',
            variantKey: 'AGREEMENT'
          })
        ]);
        
        setWidgetLoading(false);
      } catch (error: any) {
        console.error('위젯 초기화 오류:', error);
        console.error('오류 상세:', error.message, error.stack);
        setWidgetLoading(false);
      }
    };

    // 컴포넌트 마운트 후 초기화
    const timer = setTimeout(() => {
      initializeWidget();
    }, 1000);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [auth?.userId, loadingUserInfo, selectedItems.length]);

  // 금액 변경 시 위젯 업데이트
  useEffect(() => {
    const updateAmount = async () => {
      if (paymentWidget && !widgetLoading) {
        try {
          await paymentWidget.setAmount({
            currency: 'KRW',
            value: Math.floor(Number(totalPrice))
          });
          console.log('금액 업데이트 완료:', totalPrice);
        } catch (error) {
          console.error('금액 업데이트 오류:', error);
        }
      }
    };
    
    updateAmount();
  }, [totalPrice, paymentWidget, widgetLoading]);

  // 토스페이먼츠 결제 처리
  const handleTossPayment = async (externalOrderKey: string, cartProductIdsParam: string) => {
    try {
      if (!paymentWidget) {
        throw new Error('결제 위젯이 초기화되지 않았습니다.');
      }
      
      // 주문명 생성
      const orderName = selectedItems.length > 1
        ? `${selectedItems[0].productName} 외 ${selectedItems.length - 1}건`
        : selectedItems[0].productName;

      // 결제 요청 (백엔드에서 생성한 externalOrderKey 사용)
      await paymentWidget.requestPayment({
        orderId: externalOrderKey,
        orderName: orderName,
        customerName: selectedAddress?.recipient || userInfo?.name || '',
        customerEmail: userInfo?.email || '',
        customerMobilePhone: selectedAddress?.phone.replace(/[^0-9]/g, '') || '',
        successUrl: `${window.location.origin}/order/success?cartProductIds=${cartProductIdsParam}`,
        failUrl: `${window.location.origin}/order/fail`,
      });
    } catch (error: any) {
      console.error('토스페이먼츠 결제 오류:', error);
      throw error;
    }
  };

  // 주문하기
  const handleOrder = async () => {
    if (!auth?.userId) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    // 배송지 검증
    if (!selectedAddress) {
      alert('배송지를 등록해주세요.');
      setAddressModalOpen(true);
      return;
    }

    // 결제 위젯 검증
    if (!paymentWidget) {
      alert('결제 수단을 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
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

      // 3. 결제 요청 생성 (백엔드에서 externalOrderKey 생성)

      const paymentResult = await requestPayment(orderId, {
        methodCodeValue: 417, // 토스페이먼츠
        paymentPrice: totalPrice, // 최종 결제 금액
        recipientName: selectedAddress?.recipient,
        recipientPhone: selectedAddress?.phone,
        zipcode: selectedAddress?.zipcode,
        address: selectedAddress?.address,
        addressDetail: selectedAddress?.addressDetail || undefined,
      });

      // 4. 토스페이먼츠 결제 처리 (결제한 상품 ID와 함께 전달)
      const cartProductIdsParam = encodeURIComponent(JSON.stringify(selectedCartProductIds));
      await handleTossPayment(paymentResult.externalOrderKey, cartProductIdsParam);
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
                <button 
                  onClick={() => setAddressModalOpen(true)}
                  className="text-sm text-brand-pink hover:text-brand-pink/80"
                >
                  {selectedAddress ? '변경' : '배송지 등록'}
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
              ) : selectedAddress ? (
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">수령인</span>
                    <span className="text-brand-gray-900">{selectedAddress.recipient}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">연락처</span>
                    <span className="text-brand-gray-900">{formatPhoneNumber(selectedAddress.phone)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">우편번호</span>
                    <span className="text-brand-gray-900">{selectedAddress.zipcode}</span>
                  </div>
                  <div className="flex">
                    <span className="w-20 text-brand-gray-600">주소</span>
                    <span className="text-brand-gray-900">
                      {selectedAddress.address}
                      {selectedAddress.addressDetail && ` ${selectedAddress.addressDetail}`}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-brand-gray-500 mb-3">등록된 배송지가 없습니다.</p>
                  <button
                    onClick={() => setAddressModalOpen(true)}
                    className="text-sm text-brand-pink hover:text-brand-pink/80 underline"
                  >
                    배송지 등록하기
                  </button>
                </div>
              )}
              {selectedAddress && (
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
              )}
            </div>

            {/* 결제 수단 (토스페이먼츠 위젯) */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">결제 수단</h2>
              
              <div className="relative">
                {/* 로딩 오버레이 */}
                {widgetLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
                      <p className="text-sm text-brand-gray-500">결제 수단을 불러오는 중...</p>
                    </div>
                  </div>
                )}
                
                {/* 토스페이먼츠 결제 수단 위젯 */}
                <div id="payment-widget" className="mb-4 min-h-[200px]"></div>
                
                {/* 토스페이먼츠 이용약관 위젯 */}
                <div id="agreement-widget" className="min-h-[120px]"></div>
              </div>
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
                disabled={submitting || selectedItems.length === 0 || !selectedAddress}
                className={`w-full py-3 rounded-md font-semibold transition-colors ${
                  submitting || selectedItems.length === 0 || !selectedAddress
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                }`}
              >
                {submitting ? '처리 중...' : !selectedAddress ? '배송지를 등록해주세요' : `${totalPrice.toLocaleString()}원 결제하기`}
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

      {/* 배송지 관리 모달 */}
      <AddressManageModal
        isOpen={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSelectAddress={(address) => {
          setSelectedAddress(address);
          setAddressModalOpen(false);
        }}
        selectedAddressId={selectedAddress?.id}
      />
    </div>
  );
};

export default Order;
