import React from 'react';
import BannerCarousel from '../components/BannerCarousel';
import ProductSection from '../components/ProductSection';
import { products } from '../data/products';

const Home: React.FC = () => {
  const dietProducts = products.filter(product => 
    product.name.includes('다이어트') || 
    product.name.includes('쉐이크') || 
    product.name.includes('수분')
  );

  // Ensure Bestsellers include some Beauty items while capping at 8
  const beautyForBest = products.filter(p => p.category === '뷰티').slice(0, 2);
  const othersForBest = products.filter(p => p.category !== '뷰티').slice(0, 6);
  const bestSellerProducts = [...beautyForBest, ...othersForBest].slice(0, 8);

  return (
    <>
      <BannerCarousel />

      <ProductSection
        title="베스트셀러"
        subtitle="아이허브유의 Top 인기상품을 만나보세요"
        products={bestSellerProducts}
        categories={['영양제', '스포츠', '뷰티']}
      />

      <ProductSection
        title="최근 출시된 상품"
        subtitle="아이허브유의 신상품을 가장 먼저 만나보세요"
        products={dietProducts}
      />

      <ProductSection
        title="별점 높은 상품"
        subtitle="고객 만족도가 높은 인기 제품을 만나보세요"
        products={dietProducts}
      />

      <section className="py-16 bg-brand-pinkSoft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-brand-gray-900 mb-4">건강한 선택</h2>
          <p className="text-brand-gray-600 mb-8 max-w-2xl mx-auto text-lg">
            엄선된 재료로 만든 건강식품으로 당신의 건강을 책임져 드립니다. 지금 바로 경험해보세요!
          </p>
          <button className="bg-brand-pink text-brand-gray-900 px-8 py-3 rounded-md hover:bg-brand-pink/80 transition-colors font-medium">
            자세히 보기
          </button>
        </div>
      </section>

      <section className="py-16 bg-brand-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-gray-900 mb-4">OFFLINE SHOP</h2>
            <p className="text-brand-gray-600 mb-8 max-w-2xl mx-auto text-lg">
              매장에서는 고객 여러분을 따뜻하게 맞이하고<br />
              기프트 구매를 위한 맞춤형 컨설팅을 제공해드립니다.
            </p>
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-sm">
              <p className="text-sm text-brand-gray-600 mb-2">운영시간 : 평일 09:00-18:00</p>
              <p className="text-sm text-brand-gray-900 mb-4">서울특별시 강남구 강남대로 364</p>
              {/* <button className="text-brand-green text-sm font-medium hover:text-brand-darkGreen">
                VIEW MORE
              </button> */}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

