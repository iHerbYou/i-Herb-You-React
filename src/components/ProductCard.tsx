import React from 'react';
import type { Product } from '../data/products';
import { useToast } from '../contexts/ToastContext';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { showToast } = useToast();
  const { addToCart } = useCart();

  const handleWishlist = () => {
    showToast({
      message: '위시리스트에 담겼습니다!',
      actionLabel: '위시리스트 보러 가기',
      onAction: () => { window.location.href = '/wishlist'; },
    });
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    addToCart(product, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Product Image */}
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        <Link to={`/p/${product.id}`} className="absolute inset-0">
          <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {product.isBest && (
            <span className="bg-brand-red text-white text-xs px-2 py-1 rounded font-bold">BEST</span>
          )}
          {product.isExclusive && (
            <span className="bg-brand-blue text-white text-xs px-2 py-1 rounded font-bold">단독구매상품</span>
          )}
          {product.isPremium && (
            <span className="bg-brand-yellow text-white text-xs px-2 py-1 rounded font-bold">프리미엄</span>
          )}
        </div>

        {/* Action Buttons - Overlay on image */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
          <div className="flex space-x-2 pointer-events-auto">
            <button onClick={handleWishlist} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
            <button onClick={handleAddToCart} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.5l1.5 9.75A2.25 2.25 0 007.5 15.75h7.5a2.25 2.25 0 002.25-1.875l1.125-6.75H6.375" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-brand-gray-500 font-medium">{product.category}</span>
        </div>
        
        <h3 className="text-sm font-medium text-brand-gray-900 mb-2 line-clamp-2 leading-tight">
          <Link to={`/p/${product.id}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        
        <div className="flex items-center justify-between mb-1">
          <span className="text-lg font-bold text-brand-gray-900">
            {product.price.toLocaleString()}원
          </span>
        </div>
        {(product.rating !== undefined || product.reviewCount !== undefined) && (
          <div className="flex items-center mb-3 text-sm">
            <div className="flex text-yellow-400 mr-2">
              {Array.from({ length: 5 }).map((_, i) => {
                const rating = Math.round(((product.rating ?? 0) * 2)) / 2;
                const filled = rating >= i + 1;
                const half = !filled && rating > i && rating < i + 1;
                const starId = `star-${(product as any).id ?? 'p'}-${i}`;
                return (
                  <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill={filled ? 'currentColor' : (half ? `url(#${starId})` : 'none')} stroke="currentColor" aria-hidden>
                    {half && (
                      <defs>
                        <linearGradient id={starId} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="50%" stopColor="currentColor" />
                          <stop offset="50%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    )}
                    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.953L10 0l2.951 5.957 6.561.953-4.756 4.635 1.122 6.545z" />
                  </svg>
                );
              })}
            </div>
            <span className="text-brand-gray-600">({product.reviewCount ?? 0})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;