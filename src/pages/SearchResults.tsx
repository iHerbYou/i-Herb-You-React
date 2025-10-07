import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { searchProducts, type ProductListDto } from '../lib/search';
import { getSearchHistory, removeSearchHistory, type SearchHistoryItem } from '../lib/searchHistory';
import ProductCard from '../components/ProductCard';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'sales';

  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    searchProducts(query, page, 20, sort)
      .then((result) => {
        setProducts(result.content);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages);
      })
      .catch((error) => {
        console.error('Search failed:', error);
        setProducts([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [query, page, sort]);

  useEffect(() => {
    // 검색 히스토리 로드
    setSearchHistory(getSearchHistory());
  }, [query]); // query가 변경될 때마다 히스토리 새로고침

  const handleSortChange = (newSort: string) => {
    setSearchParams({ query, page: '1', sort: newSort });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ query, page: String(newPage), sort });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHistoryClick = (historyQuery: string) => {
    setSearchParams({ query: historyQuery, page: '1', sort });
  };

  const handleHistoryRemove = (historyQuery: string) => {
    removeSearchHistory(historyQuery);
    setSearchHistory(getSearchHistory());
  };

  if (!query) {
    return (
      <div className="min-h-[calc(100vh-124px)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <p className="text-center text-brand-gray-600">검색어를 입력해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 결과 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">
            '{query}' 검색 결과
          </h1>
          {!loading && (
            <p className="text-sm text-brand-gray-600">
              총 {totalElements.toLocaleString()}개의 상품
            </p>
          )}
        </div>

        {/* 최근 검색어 */}
        {searchHistory.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-sm font-semibold text-brand-gray-700 mb-3">최근 검색어</h2>
            <div className="flex flex-wrap gap-2">
              {searchHistory.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => handleHistoryClick(item.query)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-full text-sm text-brand-gray-700 hover:bg-brand-gray-50 hover:border-brand-pink transition-colors"
                >
                  <span>{item.query}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHistoryRemove(item.query);
                    }}
                    className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                    aria-label="검색어 삭제"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 정렬 옵션 */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => handleSortChange('sales')}
              className={`text-sm ${
                sort === 'sales'
                  ? 'text-brand-green font-semibold'
                  : 'text-brand-gray-600 hover:text-brand-gray-900'
              }`}
            >
              판매순
            </button>
            <button
              onClick={() => handleSortChange('recent')}
              className={`text-sm ${
                sort === 'recent'
                  ? 'text-brand-green font-semibold'
                  : 'text-brand-gray-600 hover:text-brand-gray-900'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => handleSortChange('lowPrice')}
              className={`text-sm ${
                sort === 'lowPrice'
                  ? 'text-brand-green font-semibold'
                  : 'text-brand-gray-600 hover:text-brand-gray-900'
              }`}
            >
              낮은가격순
            </button>
            <button
              onClick={() => handleSortChange('highPrice')}
              className={`text-sm ${
                sort === 'highPrice'
                  ? 'text-brand-green font-semibold'
                  : 'text-brand-gray-600 hover:text-brand-gray-900'
              }`}
            >
              높은가격순
            </button>
            <button
              onClick={() => handleSortChange('rating')}
              className={`text-sm ${
                sort === 'rating'
                  ? 'text-brand-green font-semibold'
                  : 'text-brand-gray-600 hover:text-brand-gray-900'
              }`}
            >
              평점순
            </button>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-brand-gray-600">검색 중...</p>
          </div>
        )}

        {/* 검색 결과 없음 */}
        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-gray-900 font-medium mb-2">
              '{query}'에 대한 검색 결과가 없습니다.
            </p>
            <p className="text-sm text-brand-gray-600 mb-6">
              다른 검색어를 입력하거나 철자를 확인해주세요.
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
                    price: product.minPrice,
                    category: product.brandName,
                    rating: product.avgRating,
                    reviewCount: product.reviewCount,
                    image: product.thumbnailUrl || '/images/placeholder.jpg',
                  }}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages >= 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {/* 처음 */}
                {totalPages > 1 && (
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    처음
                  </button>
                )}

                {/* 이전 */}
                {totalPages > 1 && (
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    이전
                  </button>
                )}

                {/* 페이지 번호 */}
                {totalPages > 1 ? (
                  Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          page === pageNum
                            ? 'bg-brand-green text-white border-brand-green'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })
                ) : (
                  /* 1페이지만 있을 때 현재 페이지 표시 */
                  <button
                    className="px-3 py-1 text-sm border rounded bg-brand-green text-white border-brand-green"
                  >
                    1
                  </button>
                )}

                {/* 다음 */}
                {totalPages > 1 && (
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    다음
                  </button>
                )}

                {/* 마지막 */}
                {totalPages > 1 && (
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    마지막
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults;

