import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  getCart, 
  addToCart as addToCartAPI, 
  updateQuantity, 
  deleteCartProduct,
  deleteSelectedCartProducts,
  mergeGuestCart,
  type CartItemDTO,
  type OrderSummaryDTO,
  type RecommendedProductDTO
} from '../lib/cart';

interface CartContextValue {
  // 장바구니 데이터
  items: CartItemDTO[];
  summary: OrderSummaryDTO | null;
  recommendedProducts: RecommendedProductDTO[];
  cartId: number | null;
  guestToken: string | null;
  
  // 상태
  loading: boolean;
  error: string | null;
  
  // 액션
  addToCart: (productVariantId: number, qty: number) => Promise<void>;
  updateItemQuantity: (cartProductId: number, qty: number) => Promise<void>;
  removeItem: (cartProductId: number) => Promise<void>;
  removeSelectedItems: () => Promise<void>;
  refreshCart: () => Promise<void>;
  mergeGuestCart: () => Promise<void>;
  
  // 프론트엔드 선택 관리
  updateItemSelection: (cartProductId: number, isSelected: boolean) => void;
  updateAllItemsSelection: (isSelected: boolean) => void;
  
  // 팝업 상태는 제거됨 (AddToCartModal에서 직접 관리)
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 상태
  const [items, setItems] = useState<CartItemDTO[]>([]);
  const [summary, setSummary] = useState<OrderSummaryDTO | null>(null);
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProductDTO[]>([]);
  const [cartId, setCartId] = useState<number | null>(null);
  const [guestToken, setGuestTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 팝업 상태는 AddToCartModal에서 직접 관리

  // 장바구니 데이터 새로고침
  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cartData = await getCart();
      setItems(cartData.items);
      setSummary(cartData.summary);
      setRecommendedProducts(cartData.recommendedProducts);
      setCartId(cartData.cartId);
      setGuestTokenState(cartData.guestToken);
    } catch (err: any) {
      setError(err.message || '장바구니를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // 장바구니에 상품 추가
  const addToCart = useCallback(async (productVariantId: number, qty: number) => {
    try {
      await addToCartAPI(productVariantId, qty);
      
      // 장바구니 데이터 새로고침
      await refreshCart();
    } catch (err: any) {
      setError(err.message || '장바구니에 상품을 추가하는데 실패했습니다.');
      throw err;
    }
  }, [refreshCart]);

  // 수량 업데이트
  const updateItemQuantity = useCallback(async (cartProductId: number, qty: number) => {
    try {
      await updateQuantity(cartProductId, qty);
      await refreshCart();
    } catch (err: any) {
      setError(err.message || '수량을 업데이트하는데 실패했습니다.');
      throw err;
    }
  }, [refreshCart]);

  // 프론트엔드 선택 상태 업데이트
  const updateItemSelection = useCallback((cartProductId: number, isSelected: boolean) => {
    setItems(prev => 
      prev.map(item => 
        item.cartProductId === cartProductId 
          ? { ...item, isSelected }
          : item
      )
    );
  }, []);

  // 프론트엔드 전체 선택/해제
  const updateAllItemsSelection = useCallback((isSelected: boolean) => {
    setItems(prev => 
      prev.map(item => ({ ...item, isSelected }))
    );
  }, []);

  // 상품 삭제
  const removeItem = useCallback(async (cartProductId: number) => {
    try {
      await deleteCartProduct(cartProductId);
      await refreshCart();
    } catch (err: any) {
      setError(err.message || '상품을 삭제하는데 실패했습니다.');
      throw err;
    }
  }, [refreshCart]);

  // 선택된 상품 삭제
  const removeSelectedItems = useCallback(async () => {
    try {
      // 선택된 아이템의 ID 수집
      const selectedIds = items
        .filter(item => item.isSelected)
        .map(item => item.cartProductId);
      
      if (selectedIds.length === 0) {
        return; // 선택된 아이템이 없으면 종료
      }
      
      await deleteSelectedCartProducts(selectedIds);
      await refreshCart();
    } catch (err: any) {
      setError(err.message || '선택된 상품을 삭제하는데 실패했습니다.');
      throw err;
    }
  }, [items, refreshCart]);

  // 게스트 장바구니 병합
  const mergeGuestCartAction = useCallback(async () => {
    try {
      await mergeGuestCart();
      await refreshCart();
    } catch (err: any) {
      setError(err.message || '게스트 장바구니를 병합하는데 실패했습니다.');
      throw err;
    }
  }, [refreshCart]);

  const value: CartContextValue = {
    items,
    summary,
    recommendedProducts,
    cartId,
    guestToken,
    loading,
    error,
    addToCart,
    updateItemQuantity,
    updateItemSelection,
    updateAllItemsSelection,
    removeItem,
    removeSelectedItems,
    refreshCart,
    mergeGuestCart: mergeGuestCartAction
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};