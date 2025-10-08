import React from 'react';
import BannerCarousel from '../components/BannerCarousel';
import ProductSection from '../components/ProductSection';
import { fetchBestsellers, fetchNewProducts, fetchTopRated, type ProductListDto } from '../lib/products';
import { getCategoryTreeSync } from '../lib/catalog';

const Home: React.FC = () => {
  // API 데이터만 사용
  const [bestApi, setBestApi] = React.useState<ProductListDto[]>([]);
  const [newApi, setNewApi] = React.useState<ProductListDto[]>([]);
  const [topApi, setTopApi] = React.useState<ProductListDto[]>([]);
  const [bestTab, setBestTab] = React.useState<string>('전체');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // initial loads
    Promise.all([
      fetchBestsellers({ size: 8 }),
      fetchNewProducts({ size: 8 }),
      fetchTopRated({ size: 8 })
    ])
      .then(([best, newProds, top]) => {
        setBestApi(best);
        setNewApi(newProds);
        setTopApi(top);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  // Map tab label → categoryId using the current catalog
  const resolveCategoryId = (label: string): number | undefined => {
    if (label === '전체') return undefined;
    const top = getCategoryTreeSync().find(t => t.name === label);
    return top?.id;
  };

  const handleBestTabChange = (label: string) => {
    setBestTab(label);
    const categoryId = resolveCategoryId(label);
    fetchBestsellers({ size: 8, categoryId })
      .then(setBestApi)
      .catch(() => setBestApi([]));
  };

  return (
    <>
      <BannerCarousel />

      {!loading && (
        <>
          <ProductSection
            title="베스트셀러"
            subtitle="아이허브유의 Top 인기상품을 만나보세요"
            products={bestApi.map(i => ({ id: i.id, name: i.name, price: i.minPrice, category: '기타', image: i.thumbnailUrl, rating: i.avgRating, reviewCount: i.reviewCount, productVariantId: i.productVariantId })) as any}
            categories={['영양제', '스포츠', '뷰티']}
            activeCategory={bestTab}
            onCategoryChange={handleBestTabChange}
          />

          <ProductSection
            title="최근 출시된 상품"
            subtitle="아이허브유의 신상품을 가장 먼저 만나보세요"
            products={newApi.map(i => ({ id: i.id, name: i.name, price: i.minPrice, category: '기타', image: i.thumbnailUrl, rating: i.avgRating, reviewCount: i.reviewCount, productVariantId: i.productVariantId })) as any}
          />

          <ProductSection
            title="별점 높은 상품"
            subtitle="고객 만족도가 높은 인기 제품을 만나보세요"
            products={topApi.map(i => ({ id: i.id, name: i.name, price: i.minPrice, category: '기타', image: i.thumbnailUrl, rating: i.avgRating, reviewCount: i.reviewCount, productVariantId: i.productVariantId })) as any}
          />
        </>
      )}

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

