import React from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: number;
    name: string;
    imageUrl: string;
    price: number;
    brandName: string;
  };
  quantity?: number;
}

const AddToCartModal: React.FC<AddToCartModalProps> = ({ 
  isOpen, 
  onClose, 
  product, 
  quantity = 1 
}) => {
  const { items } = useCart();

  if (!isOpen || !product) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold text-brand-gray-900">장바구니에 담았습니다</h3>
        </div>
        <div className="p-5">
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 mr-4 flex-shrink-0">
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-brand-gray-900 line-clamp-2 mb-1">
                {product.name}
              </h4>
              <p className="text-xs text-brand-gray-500 mb-2">{product.brandName}</p>
              <p className="text-sm text-brand-gray-700">
                수량: {quantity}개
              </p>
            </div>
          </div>

          <div className="bg-brand-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-gray-600">장바구니 상품</span>
              <span className="text-brand-gray-900 font-medium">
                총 {items.length}개
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-brand-gray-600">금액</span>
              <span className="text-brand-gray-900 font-medium">
                {(product.price * quantity).toLocaleString()}원
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }} 
              className="px-4 py-2 text-sm rounded-md border text-brand-gray-700 hover:bg-gray-50"
            >
              닫기
            </button>
            <Link 
              to="/cart"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2 text-sm rounded-md bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80"
            >
              장바구니 보기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  // Portal을 사용해서 body에 직접 렌더링
  return createPortal(modalContent, document.body);
};

export default AddToCartModal;
