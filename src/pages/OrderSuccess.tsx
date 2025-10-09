import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmTossPayment } from '../lib/payments';
import { useCart } from '../contexts/CartContext';
import { deleteSelectedCartProducts } from '../lib/cart';
import { getOrderDetail, type OrderDetailDto } from '../lib/orderHistory';

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshCart } = useCart();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderDetail, setOrderDetail] = useState<OrderDetailDto | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey');
      const tossOrderId = searchParams.get('orderId'); // 토스에서 온 orderId (ORDER_123_timestamp_random)
      const amount = searchParams.get('amount');
      const cartProductIdsParam = searchParams.get('cartProductIds');

      if (!paymentKey || !tossOrderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setProcessing(false);
        return;
      }

      try {
        console.log('결제 승인 요청', {
          paymentKey,
          orderId: tossOrderId,  // 백엔드에서 생성한 externalOrderKey
          amount,
          cartProductIds: cartProductIdsParam
        });

        // 백엔드에 결제 승인 요청 (externalOrderKey 그대로 전송)
        await confirmTossPayment({
          paymentKey,
          orderId: tossOrderId,
          amount: Number(amount),
        });

        // 장바구니에서 결제한 상품만 제거
        if (cartProductIdsParam) {
          try {
            const cartProductIds = JSON.parse(decodeURIComponent(cartProductIdsParam));
            console.log('장바구니 상품 제거:', cartProductIds);
            await deleteSelectedCartProducts(cartProductIds);
            await refreshCart();
          } catch (cartError) {
            console.error('장바구니 정리 오류:', cartError);
          }
        }

        // 주문 상세 정보 조회
        const orderIdMatch = tossOrderId.match(/ORDER[_-](\d+)[_-]/);
        const orderId = orderIdMatch ? orderIdMatch[1] : null;
        
        console.log('주문번호 추출:', { tossOrderId, orderId });
        
        if (orderId) {
          try {
            const detail = await getOrderDetail(Number(orderId));
            setOrderDetail(detail);
          } catch (detailError) {
            console.error('주문 상세 조회 오류:', detailError);
          }
        }

        setProcessing(false);
      } catch (err: any) {
        console.error('결제 승인 실패:', err);
        setError(err.message || '결제 승인에 실패했습니다.');
        setProcessing(false);
      }
    };

    confirmPayment();
  }, [searchParams, refreshCart]);

  if (processing) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-brand-pink mx-auto mb-4"></div>
          <p className="text-brand-gray-700">결제를 처리하고 있습니다...</p>
          <p className="text-sm text-brand-gray-500 mt-2">잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">결제 실패</h1>
            <p className="text-brand-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-brand-pink text-white py-3 rounded-md hover:bg-brand-pink/90 transition-colors"
            >
              장바구니로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* 성공 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">주문이 완료되었습니다!</h1>
          <p className="text-brand-gray-600 mb-2">결제가 정상적으로 처리되었습니다.</p>
          {orderDetail && (
            <p className="text-sm text-brand-gray-500">
              주문번호: {orderDetail.id}
            </p>
          )}
        </div>

        {/* 주문 상세 정보 */}
        {orderDetail && (
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold text-brand-gray-900">주문 상세</h2>
            </div>
            
            <div className="p-6">
              {/* 주문 상품 */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-brand-gray-900 mb-3">주문 상품</h3>
                <div className="space-y-3">
                  {orderDetail.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-brand-gray-900 line-clamp-2">
                          {item.productName}
                        </p>
                        <p className="text-xs text-brand-gray-500 mt-1">
                          수량: {item.qty}개 | 단가: {item.unitPrice.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 결제 금액 */}
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-gray-600">상품 금액</span>
                  <span className="text-brand-gray-900">{orderDetail.subtotal.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray-600">배송비</span>
                  <span className="text-brand-gray-900">
                    {orderDetail.deliveryFee === 0 ? '무료' : `${orderDetail.deliveryFee.toLocaleString()}원`}
                  </span>
                </div>
                {orderDetail.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>할인</span>
                    <span>-{orderDetail.discount.toLocaleString()}원</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold text-brand-gray-900">최종 결제 금액</span>
                  <span className="font-bold text-lg text-brand-pink">
                    {orderDetail.totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={() => {
              const orderId = orderDetail?.id;
              navigate(orderId ? `/orders?orderId=${orderId}` : '/orders');
            }}
            className="w-full bg-brand-pink text-white py-3 rounded-md hover:bg-brand-pink/90 transition-colors"
          >
            전체 주문 내역 보기
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-gray-300 text-brand-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
          >
            쇼핑 계속하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;

