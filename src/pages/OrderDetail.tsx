import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrderDetail, type OrderDetailDto } from '../lib/orderHistory';
import MyPageNav from '../components/MyPageNav';

const OrderDetail: React.FC = () => {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail(Number(orderId));
    }
  }, [orderId]);

  const loadOrderDetail = async (id: number) => {
    try {
      setLoading(true);
      const data = await getOrderDetail(id);
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || '주문 상세를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 주문 상태 이름
  const getStatusName = (statusKey: number) => {
    const statusMap: Record<number, string> = {
      301: '결제 대기',
      302: '결제 완료',
      303: '상품 준비',
      304: '출고 완료',
      305: '배송 완료',
      306: '구매 확정',
      307: '주문 취소',
      308: '환불 요청',
      309: '환불 완료',
      310: '부분 환불',
      311: '처리 실패',
    };
    return statusMap[statusKey] || '알 수 없음';
  };

  // 주문 상태에 따른 배지 색상
  const getStatusBadgeColor = (statusKey: number) => {
    if (statusKey === 301) return 'bg-yellow-100 text-yellow-800';
    if (statusKey === 302) return 'bg-blue-100 text-blue-800';
    if (statusKey === 303 || statusKey === 304) return 'bg-purple-100 text-purple-800';
    if (statusKey === 305 || statusKey === 306) return 'bg-green-100 text-green-800';
    if (statusKey === 307) return 'bg-gray-100 text-gray-800';
    if (statusKey >= 308) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <MyPageNav />
            </div>
            <div className="lg:col-span-3">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
                <p className="text-brand-gray-500">주문 상세를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <MyPageNav />
            </div>
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <p className="text-red-600 mb-4">{error || '주문을 찾을 수 없습니다.'}</p>
                <button
                  onClick={() => navigate('/orders')}
                  className="px-4 py-2 bg-brand-pink text-white rounded-md hover:bg-brand-pink/90"
                >
                  주문 내역으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 네비게이션 */}
          <div className="lg:col-span-1">
            <MyPageNav />
          </div>

          {/* 주문 상세 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 뒤로가기 */}
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-2 text-sm text-brand-gray-600 hover:text-brand-gray-900"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              주문 내역으로 돌아가기
            </button>

            {/* 주문 정보 */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">주문 상세</h1>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-brand-gray-600">
                        주문번호: {order.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(order.orderStatusKey)}`}>
                        {getStatusName(order.orderStatusKey)}
                      </span>
                    </div>
                    <p className="text-xs text-brand-gray-500 mt-1">
                      {formatDate(order.orderDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* 주문 상품 */}
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">주문 상품</h2>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <img
                        src={item.thumbnailUrl}
                        alt={item.productName}
                        className="w-24 h-24 object-cover rounded-md border"
                        onClick={() => navigate(`/products/${item.productId}`)}
                      />
                      <div className="flex-1">
                        <p 
                          className="text-sm font-medium text-brand-gray-900 hover:text-brand-pink cursor-pointer line-clamp-2"
                          onClick={() => navigate(`/products/${item.productId}`)}
                        >
                          {item.productName}
                        </p>
                        <p className="text-xs text-brand-gray-500 mt-2">
                          수량: {item.qty}개
                        </p>
                        <p className="text-sm font-semibold text-brand-gray-900 mt-1">
                          {(item.unitPrice * item.qty).toLocaleString()}원
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-brand-gray-500">단가</p>
                        <p className="text-sm text-brand-gray-900">
                          {item.unitPrice.toLocaleString()}원
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 결제 금액 */}
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">결제 금액</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-gray-600">상품 금액</span>
                    <span className="text-brand-gray-900">{order.subtotal.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray-600">배송비</span>
                    <span className="text-brand-gray-900">
                      {order.deliveryFee === 0 ? '무료' : `${order.deliveryFee.toLocaleString()}원`}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>할인</span>
                      <span>-{order.discount.toLocaleString()}원</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-3 border-t font-semibold">
                    <span className="text-brand-gray-900">최종 결제 금액</span>
                    <span className="text-lg text-brand-pink">
                      {order.totalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>

              {/* 배송 정보 */}
              {order.trackingNumber && (
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-brand-gray-900 mb-4">배송 정보</h2>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-24 text-brand-gray-600">택배사</span>
                      <span className="text-brand-gray-900">{order.deliveryCompany}</span>
                    </div>
                    <div className="flex">
                      <span className="w-24 text-brand-gray-600">운송장번호</span>
                      <span className="text-brand-gray-900">{order.trackingNumber}</span>
                    </div>
                    {order.delStartAt && (
                      <div className="flex">
                        <span className="w-24 text-brand-gray-600">배송 시작</span>
                        <span className="text-brand-gray-900">{formatDate(order.delStartAt)}</span>
                      </div>
                    )}
                    {order.delCompleteAt && (
                      <div className="flex">
                        <span className="w-24 text-brand-gray-600">배송 완료</span>
                        <span className="text-brand-gray-900">{formatDate(order.delCompleteAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

