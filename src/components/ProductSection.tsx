import React, { useState } from 'react';
import ProductCard from './ProductCard';
import type { Product } from '../data/products';

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  categories?: string[];
}

const ProductSection: React.FC<ProductSectionProps> = ({ 
  title, 
  subtitle, 
  products, 
  categories = [] 
}) => {
  const [activeCategory, setActiveCategory] = useState('전체');

  const filteredProducts = activeCategory === '전체' 
    ? products 
    : products.filter(product => {
        if (activeCategory === '베스트') return product.isBest;
        if (activeCategory === '단독상품') return product.isExclusive;
        if (activeCategory === '프리미엄') return product.isPremium;
        return product.category === activeCategory;
      });

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-brand-gray-900 mb-4">{title}</h2>
          {subtitle && (
            <p className="text-brand-gray-600 text-lg">{subtitle}</p>
          )}
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-brand-gray-100 rounded-lg p-1 whitespace-nowrap overflow-x-auto sm:overflow-visible w-full sm:w-auto max-w-full sm:max-w-none scrollbar-hide">
              <button
                onClick={() => setActiveCategory('전체')}
                className={`w-full sm:px-8 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeCategory === '전체'
                    ? 'bg-white text-brand-gray-900 shadow-sm'
                    : 'text-brand-gray-600 hover:text-brand-gray-900'
                }`}
              >
                전체
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full sm:px-8 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    activeCategory === category
                      ? 'bg-white text-brand-gray-900 shadow-sm'
                      : 'text-brand-gray-600 hover:text-brand-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;