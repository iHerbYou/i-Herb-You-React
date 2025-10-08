import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAllBrands, getProductsByBrand, type BrandResponse, type BrandProductResponse } from '../lib/brands';
import ProductCard from '../components/ProductCard';

const BrandProducts: React.FC = () => {
  const { brandId: brandIdParam } = useParams<{ brandId: string }>();

  const [products, setProducts] = useState<BrandProductResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<BrandResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const brandId = parseInt(brandIdParam || '0', 10);

  // 브랜드 목록 로드
  useEffect(() => {
    getAllBrands()
      .then((brandsData) => {
        setBrands(brandsData);
      })
      .catch(() => {
        setBrands([]);
      });
  }, []);

  // 선택된 브랜드 찾기 및 상품 로드
  useEffect(() => {
    if (!brandId || isNaN(brandId) || brandId <= 0) {
      setSelectedBrand(null);
      setProducts([]);
      setLoading(false);
      return;
    }

    // 브랜드 목록이 아직 로드되지 않았으면 대기
    if (brands.length === 0) {
      return;
    }

    // 브랜드 ID로 브랜드 찾기
    const foundBrand = brands.find(brand => brand.id === brandId);

    if (!foundBrand) {
      setSelectedBrand(null);
      setProducts([]);
      setLoading(false);
      return;
    }

    setSelectedBrand(foundBrand);
    setLoading(true);

    // 해당 브랜드의 상품들 로드
    getProductsByBrand(foundBrand.id)
      .then((brandProducts) => {
        setProducts(brandProducts);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [brandId, brands]);

  if (!brandId || isNaN(brandId) || brandId <= 0) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-brand-gray-600">유효하지 않은 브랜드 ID입니다.</p>
        </div>
      </div>
    );
  }

  if (!selectedBrand) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-brand-gray-600">브랜드를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브랜드 헤더 */}
        <div className="mb-6">
          <nav className="text-sm text-brand-gray-600 mb-3">
            <Link to="/" className="hover:text-brand-pink">홈</Link>
            <span className="mx-2 text-brand-gray-400">&gt;</span>
            <span className="text-brand-gray-900">브랜드</span>
            <span className="mx-2 text-brand-gray-400">&gt;</span>
            <span className="text-brand-gray-900">{selectedBrand.name}</span>
          </nav>
          
          <h1 className="text-3xl font-bold text-brand-gray-900 mb-2">
            {selectedBrand.name} 제품
          </h1>
          {!loading && (
            <p className="text-sm text-brand-gray-600">
              총 {products.length.toLocaleString()}개의 상품
            </p>
          )}
        </div>


        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-brand-gray-600">상품을 불러오는 중...</p>
          </div>
        )}

        {/* 상품이 없을 때 */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-gray-900 font-medium mb-2">
              {selectedBrand.name} 브랜드의 상품을 찾을 수 없습니다.
            </p>
            <p className="text-sm text-brand-gray-600 mb-6">
              다른 브랜드의 상품을 확인해보세요.
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-2 bg-brand-pink text-brand-gray-900 rounded-md hover:bg-brand-pink/80 transition-colors"
            >
              홈으로 가기
            </Link>
          </div>
        )}

        {/* 상품 목록 */}
        {!loading && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    category: selectedBrand.name,
                    rating: product.rating,
                    reviewCount: product.reviewCount,
                    image: product.thumbnailUrl || '/images/placeholder.jpg',
                  }}
                  productVariantId={product.productVariantId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrandProducts;
