import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllBrands, type BrandResponse } from '../lib/brands';

const AllBrands: React.FC = () => {
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBrands()
      .then((brandsData) => {
        setBrands(brandsData);
      })
      .catch((error) => {
        console.error('Failed to load brands:', error);
        setBrands([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브레드크럼 */}
        <nav className="text-sm text-brand-gray-600 mb-6">
          <Link to="/" className="hover:text-brand-pink">홈</Link>
          <span className="mx-2 text-brand-gray-400">&gt;</span>
          <span className="text-brand-gray-900">브랜드</span>
        </nav>

        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">
            모든 브랜드
          </h1>
          <p className="text-sm text-brand-gray-600">
            {loading ? '브랜드를 불러오는 중...' : `총 ${brands.length}개의 브랜드`}
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-brand-gray-600">브랜드를 불러오는 중...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brand-gray-900 font-medium mb-2">
              브랜드를 찾을 수 없습니다.
            </p>
            <p className="text-sm text-brand-gray-600 mb-6">
              잠시 후 다시 시도해주세요.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-brand-pink text-brand-gray-900 rounded-md hover:bg-brand-pink/80 transition-colors"
            >
              홈으로 가기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/brands/${brand.id}`}
                className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-brand-pink hover:shadow-md transition-all duration-200"
              >
                <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                  {brand.thumbnailUrl ? (
                    <img
                      src={brand.thumbnailUrl}
                      alt={brand.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-pink/20 to-brand-green/20">
                      <span className="text-2xl font-bold text-brand-gray-600">
                        {brand.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-brand-gray-900 mb-1 group-hover:text-brand-pink transition-colors">
                  {brand.name}
                </h3>
                <p className="text-sm text-brand-gray-600">
                  {brand.productCount}개 상품
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBrands;
