import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const useCart = (): CartContextValue => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const [open, setOpen] = useState(false);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((it) => it.product.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { product, quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { product, quantity }];
    });
    const item = { product, quantity };
    setLastAdded(item);
    setOpen(true);
    window.setTimeout(() => setOpen(false), 2500);
  };

  const value = useMemo(() => ({ items, addToCart }), [items]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {/* Cart popup */}
      <div className={`fixed left-1/2 -translate-x-1/2 bottom-0 w-full max-w-md px-4 pb-4 transition-transform ${open ? 'translate-y-0' : 'translate-y-24'}`}>
        {lastAdded && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="flex items-center p-3">
              <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                <img src={lastAdded.product.image} alt={lastAdded.product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-gray-900 truncate">장바구니에 담았습니다</p>
                <p className="text-xs text-brand-gray-700 truncate">{lastAdded.product.name}</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="닫기" className="ml-3 text-gray-500 hover:text-gray-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </CartContext.Provider>
  );
};