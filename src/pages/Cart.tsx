import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ConfirmModal from '../components/ConfirmModal';
import { deleteSelectedCartProducts } from '../lib/cart';

const Cart: React.FC = () => {
  const {
    items,
    recommendedProducts,
    loading,
    error,
    updateItemQuantity,
    updateItemSelection,
    updateAllItemsSelection,
    removeItem,
    removeSelectedItems,
    refreshCart
  } = useCart();

  const [deletingItems, setDeletingItems] = useState<number[]>([]);
  
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

  // 실시간 요약 정보 계산
  const calculateSummary = () => {
    const selectedItems = items.filter(item => item.isSelected);
    const selectedItemCount = selectedItems.length;
    const subTotal = selectedItems.reduce((sum, item) => sum + (item.price || 0) * item.qty, 0);
    const shippingFee = subTotal >= 50000 ? 0 : 3000; // 5만원 이상 무료배송
    const totalAmount = subTotal + shippingFee;

    return {
      selectedItemCount,
      subTotal,
      shippingFee,
      totalAmount
    };
  };

  const calculatedSummary = calculateSummary();

  const handleQuantityChange = async (cartProductId: number, newQty: number) => {
    if (newQty < 1) return;
    
    try {
      await updateItemQuantity(cartProductId, newQty);
    } catch (error) {
      // Error handled by CartContext
    }
  };

  const handleSelectionChange = (cartProductId: number, isSelected: boolean) => {
    updateItemSelection(cartProductId, isSelected);
  };

  const handleAllSelectionChange = (isSelected: boolean) => {
    updateAllItemsSelection(isSelected);
  };

  const handleRemoveItem = (cartProductId: number) => {
    setConfirmModal({
      isOpen: true,
      title: '상품 삭제',
      message: '이 상품을 장바구니에서 삭제하시겠습니까?',
      onConfirm: async () => {
        setDeletingItems(prev => [...prev, cartProductId]);
        try {
          await removeItem(cartProductId);
        } catch (error) {
          // Error handled by CartContext
        } finally {
          setDeletingItems(prev => prev.filter(id => id !== cartProductId));
        }
      }
    });
  };

  const handleRemoveSelected = () => {
    if(!someSelected) return;
    setConfirmModal({
      isOpen: true,
      title: '선택 상품 삭제',
      message: '선택한 상품을 장바구니에서 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          await removeSelectedItems();
        } catch (error) {
          // Error handled by CartContext
        }
      }
    });
  };

  const handleRemoveAll = () => {
    // 현재 모든 아이템의 ID를 미리 수집
    const allIds = items.map(item => item.cartProductId);
    
    setConfirmModal({
      isOpen: true,
      title: '전체 상품 삭제',
      message: '장바구니의 모든 상품을 삭제하시겠습니까?',
      onConfirm: async () => {
        try {
          // 수집한 모든 ID로 삭제 API 직접 호출
          await deleteSelectedCartProducts(allIds);
          // 장바구니 새로고침
          await refreshCart();
        } catch (error) {
          // Error handled
        }
      }
    });
  };

  const allSelected = items.length > 0 && items.every(item => item.isSelected);
  const someSelected = items.some(item => item.isSelected);
  const selectedCount = items.filter(item => item.isSelected).length;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-pink mx-auto mb-4"></div>
          <p className="text-brand-gray-600">장바구니를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refreshCart}
            className="px-4 py-2 bg-brand-pink text-white rounded-md hover:bg-brand-pink/80"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H19M7 13v4a2 2 0 002 2h6a2 2 0 002-2v-4m-8 0V9a2 2 0 012-2h4a2 2 0 012 2v4.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-brand-gray-900 mb-2">장바구니가 비어있습니다</h2>
            <p className="text-brand-gray-600 mb-8">원하는 상품을 장바구니에 담아보세요!</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-brand-pink text-brand-gray-900 rounded-md hover:bg-brand-pink/80 transition-colors"
            >
              쇼핑 계속하기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-gray-900">장바구니</h1>
          <p className="text-sm text-brand-gray-600 mt-1">
            총 {items.length}개의 상품
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 장바구니 아이템 목록 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* 전체 선택 헤더 */}
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={(e) => handleAllSelectionChange(e.target.checked)}
                      className="w-4 h-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"
                    />
                    <span className="ml-2 text-sm text-brand-gray-700">
                      전체 선택 ({selectedCount}/{items.length})
                    </span>
                  </label>
                    <button
                      onClick={handleRemoveSelected}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      선택 삭제
                    </button>
                </div>
              </div>

              {/* 상품 목록 */}
              <div className="divide-y divide-gray-200">
                {items.map((item, index) => (
                  <div key={item.cartProductId || `item-${index}`} className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* 체크박스 */}
                      <input
                        type="checkbox"
                        checked={item.isSelected}
                        onChange={(e) => handleSelectionChange(item.cartProductId, e.target.checked)}
                        className="w-4 h-4 text-brand-pink border-gray-300 rounded focus:ring-brand-pink"
                      />

                      {/* 상품 이미지 */}
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* 상품 정보 */}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/p/${item.productId}`}
                          className="text-sm font-medium text-brand-gray-900 hover:text-brand-pink line-clamp-2"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-xs text-brand-gray-500 mt-1">{item.brandName}</p>
                        {item.isOutOfStock && (
                          <p className="text-xs text-red-600 mt-1">품절</p>
                        )}
                      </div>

                      {/* 수량 조절 */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleQuantityChange(item.cartProductId, item.qty - 1)}
                          disabled={item.qty <= 1}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm">{item.qty}</span>
                        <button
                          onClick={() => handleQuantityChange(item.cartProductId, item.qty + 1)}
                          disabled={item.isOutOfStock || item.qty >= item.stockQuantity}
                          className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      {/* 가격 */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-brand-gray-900">
                          {((item.price || 0) * item.qty).toLocaleString()}원
                        </p>
                        <p className="text-xs text-brand-gray-500">
                          {(item.price || 0).toLocaleString()}원
                        </p>
                      </div>

                      {/* 삭제 버튼 */}
                      <button
                        onClick={() => handleRemoveItem(item.cartProductId)}
                        disabled={deletingItems.includes(item.cartProductId)}
                        className="text-gray-400 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingItems.includes(item.cartProductId) ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* 전체 삭제 버튼 */}
              <div className="px-4 py-3 border-t border-gray-200">
                <button
                  onClick={handleRemoveAll}
                  className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  전체 삭제
                </button>
              </div>
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-brand-gray-900 mb-4">주문 요약</h3>
              
              {items.length > 0 && (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray-600">선택 상품 ({calculatedSummary.selectedItemCount}개)</span>
                      <span className="text-brand-gray-900">{calculatedSummary.subTotal.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-gray-600">배송비</span>
                      <span className="text-brand-gray-900">
                        {calculatedSummary.shippingFee === 0 ? '무료' : `${calculatedSummary.shippingFee.toLocaleString()}원`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between">
                        <span className="font-semibold text-brand-gray-900">총 결제금액</span>
                        <span className="font-bold text-lg text-brand-gray-900">
                          {calculatedSummary.totalAmount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={selectedCount === 0}
                    className={`w-full py-3 rounded-md font-semibold transition-colors ${
                      selectedCount === 0
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                    }`}
                  >
                    주문하기 ({selectedCount}개)
                  </button>
                </>
              )}
            </div>

            {/* 추천 상품 */}
            {recommendedProducts?.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
                <h3 className="text-lg font-semibold text-brand-gray-900 mb-4">추천 상품</h3>
                <div className="space-y-3">
                  {recommendedProducts.map((product, index) => (
                    <Link
                      key={product.productId || `product-${index}`}
                      to={`/p/${product.productId}`}
                      className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-md transition-colors"
                    >
                      <div className="w-12 h-12 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-brand-gray-900 line-clamp-2">
                          {product.productName}
                        </p>
                        <p className="text-sm text-brand-gray-500">
                          {(product.price || 0).toLocaleString()}원
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
};

export default Cart;
