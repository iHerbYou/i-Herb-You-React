import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getMyOrders, type OrderSummaryDto } from '../lib/orderHistory';
import MyPageNav from '../components/MyPageNav';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightOrderId = searchParams.get('orderId');

  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadOrders(currentPage);
  }, [currentPage]);

  const loadOrders = async (page: number) => {
    try {
      setLoading(true);
      const data = await getMyOrders(page, 10);
      setOrders(data.content);
      setTotalPages(data.totalPages);
      setError(null);
    } catch (err: any) {
      setError(err.message || '주문 내역을 불러오는데 실패했습니다.');
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
    if (statusKey === 301) return 'bg-yellow-100 text-yellow-800'; // PENDING
    if (statusKey === 302) return 'bg-blue-100 text-blue-800'; // PAID
    if (statusKey === 303 || statusKey === 304) return 'bg-purple-100 text-purple-800'; // PACKING, SHIPPED
    if (statusKey === 305 || statusKey === 306) return 'bg-green-100 text-green-800'; // DELIVERED, COMPLETED
    if (statusKey === 307) return 'bg-gray-100 text-gray-800'; // CANCELED
    if (statusKey >= 308) return 'bg-red-100 text-red-800'; // REFUND
    return 'bg-gray-100 text-gray-800';
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 사이드바 네비게이션 */}
          <div className="lg:col-span-1">
            <MyPageNav />
          </div>

          {/* 주문 내역 */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-brand-gray-900">주문 내역</h1>
              </div>

              {error ? (
                <div className="p-8 text-center">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => loadOrders(currentPage)}
                    className="px-4 py-2 bg-brand-pink text-white rounded-md hover:bg-brand-pink/90"
                  >
                    다시 시도
                  </button>
                </div>
              ) : loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
                  <p className="text-brand-gray-500">주문 내역을 불러오는 중...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-brand-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-brand-gray-500 mb-4">주문 내역이 없습니다.</p>
                  <button
                    onClick={() => navigate('/')}
                    className="text-brand-pink hover:text-brand-pink/80 underline"
                  >
                    쇼핑하러 가기
                  </button>
                </div>
              ) : (
                <div className="divide-y">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        highlightOrderId && String(order.id) === highlightOrderId
                          ? 'bg-brand-pinkSoft border-l-4 border-brand-pink'
                          : ''
                      }`}
                      onClick={() => navigate(`/orders/${order.id}`)}
                    >
                      {/* 주문 헤더 */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-brand-gray-900">
                              주문번호: {order.id}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(order.orderStatusKey)}`}>
                              {getStatusName(order.orderStatusKey)}
                            </span>
                          </div>
                          <p className="text-xs text-brand-gray-500">
                            {formatDate(order.orderDate)}
                          </p>
                        </div>
                        <svg className="w-5 h-5 text-brand-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>

                      {/* 주문 금액 요약 */}
                      <div className="space-y-1 text-sm">
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
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="font-semibold text-brand-gray-900">결제 금액</span>
                          <span className="font-bold text-lg text-brand-gray-900">
                            {order.totalPrice.toLocaleString()}원
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 페이지네이션 */}
              {!loading && !error && totalPages > 1 && (
                <div className="p-6 border-t flex justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    이전
                  </button>
                  <span className="px-4 py-2 text-sm text-brand-gray-600">
                    {currentPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;

