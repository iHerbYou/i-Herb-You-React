import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCategoryTreeSync, getCategoryTree } from '../lib/catalog';
import type { TopCategory, MidCategory, SmallCategory } from '../data/categories';
import type { Product } from '../data/products';
import ProductCard from '../components/ProductCard';
import { fetchProductList, type PageResponseDto, type ProductListDto } from '../lib/products';

const PAGE_SIZE = 24; // 4 x 6

interface PriceRange { label: string; min: number; max: number }
const PRICE_RANGES: PriceRange[] = [
  { label: '0 ~ 10,000', min: 0, max: 10000 },
  { label: '10,000 ~ 20,000', min: 10000, max: 20000 },
  { label: '20,000 ~ 30,000', min: 20000, max: 30000 },
  { label: '30,000 ~ 50,000', min: 30000, max: 50000 },
  { label: '50,000+' , min: 50000, max: Number.MAX_SAFE_INTEGER },
];

type SortKey = 'sales' | 'rating' | 'reviews' | 'priceDesc' | 'priceAsc';

// Use DTOs from lib/products

const CategoryList: React.FC = () => {
  const params = useParams();
  const navigate = useNavigate();
  const topId = params.topId ? Number(params.topId) : undefined;
  const midId = params.midId ? Number(params.midId) : undefined;
  const subId = params.subId ? Number(params.subId) : undefined;

  const [catalog, setCatalog] = useState<TopCategory[]>(() => getCategoryTreeSync());
  const topNode = useMemo<TopCategory | undefined>(() => catalog.find(t => t.id === topId), [catalog, topId]);
  const midNode = useMemo<MidCategory | undefined>(() => topNode?.children.find(m => m.id === midId), [topNode, midId]);
  const subNode = useMemo<SmallCategory | undefined>(() => midNode?.items?.find(s => s.id === subId), [midNode, subId]);

  React.useEffect(() => {
    getCategoryTree().then(setCatalog).catch(() => {});
  }, []);

  const [sortKey, setSortKey] = useState<SortKey>('sales');
  const [excludeSoldOut, setExcludeSoldOut] = useState<boolean>(true);
  const [priceSelection, setPriceSelection] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const [listPage, setListPage] = useState<PageResponseDto<ProductListDto>>({
    totalPages: 0,
    totalElements: 0,
    first: true,
    last: true,
    size: PAGE_SIZE,
    content: [],
    number: 0,
    sort: { empty: true, sorted: false, unsorted: true },
    pageable: { offset: 0, sort: { empty: true, sorted: false, unsorted: true }, paged: true, pageNumber: 0, pageSize: PAGE_SIZE, unpaged: false },
    numberOfElements: 0,
    empty: true,
  });

  const totalPages = Math.max(1, listPage.totalPages || 1);

  const goPage = (n: number) => { setPage(Math.min(Math.max(1, n), totalPages)); window.scrollTo(0, 0); };

  React.useEffect(() => {
    // compute API params
    const range = priceSelection ? PRICE_RANGES.find(r => r.label === priceSelection) : undefined;
    const minPrice = range?.min;
    const maxPrice = range?.max && range.max !== Number.MAX_SAFE_INTEGER ? range.max : undefined;
    const categoryId = subId ?? midId ?? topId;
    const sort = sortKey === 'priceAsc' || sortKey === 'priceDesc' ? 'price' : (sortKey === 'sales' ? 'sales' : (sortKey === 'rating' ? 'rating' : 'reviews'));
    const direction = sortKey === 'priceAsc' ? 'asc' : 'desc';

    fetchProductList({ page, size: PAGE_SIZE, excludeSoldOut, minPrice, maxPrice, categoryId, sort: sort as any, direction })
      .then(setListPage)
      .catch(() => {
        setListPage({
          totalPages: 0,
          totalElements: 0,
          first: true,
          last: true,
          size: PAGE_SIZE,
          content: [],
          number: 0,
          sort: { empty: true, sorted: false, unsorted: true },
          pageable: { offset: 0, sort: { empty: true, sorted: false, unsorted: true }, paged: true, pageNumber: 0, pageSize: PAGE_SIZE, unpaged: false },
          numberOfElements: 0,
          empty: true,
        });
      });
  }, [page, PAGE_SIZE, excludeSoldOut, priceSelection, subId, midId, topId, sortKey, topNode]);

  // onAddToCart prop을 제거하고 ProductCard에서 직접 API 호출하도록 함

  const subcategoryButtons = useMemo(() => {
    if (midNode && midNode.items) return midNode.items.map(s => s.name);
    if (topNode) return topNode.children.map(m => m.name);
    return [] as string[];
  }, [topNode, midNode]);

  const handleClickSub = (name: string) => {
    if (midNode && midNode.items) {
      const found = midNode.items.find(s => s.name === name);
      if (found) navigate(`/c/${topNode!.id}/${midNode.id}/${found.id}`);
      return;
    }
    if (topNode) {
      const foundMid = topNode.children.find(m => m.name === name);
      if (foundMid) navigate(`/c/${topNode.id}/${foundMid.id}`);
    }
  };

  const pageTitle = subNode?.name ?? midNode?.name ?? topNode?.name ?? '전체 상품';

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-brand-gray-600 mb-3">
          <Link to="/" className="hover:text-brand-pink">홈</Link>
          {topNode && (
            <>
              <span className="mx-2 text-brand-gray-400">&gt;</span>
              <Link to={`/c/${topNode.id}`} className="hover:text-brand-pink">{topNode.name}</Link>
            </>
          )}
          {midNode && (
            <>
              <span className="mx-2 text-brand-gray-400">&gt;</span>
              <Link to={`/c/${topNode!.id}/${midNode.id}`} className="hover:text-brand-pink">{midNode.name}</Link>
            </>
          )}
          {subNode && (
            <>
              <span className="mx-2 text-brand-gray-400">&gt;</span>
              <span className="text-brand-gray-900 font-semibold">{subNode.name}</span>
            </>
          )}
        </nav>

        {/* Header row: title */}
        <div className="flex items-end justify-between mb-4">
          <h1 className="text-2xl font-bold text-brand-gray-900">{pageTitle}</h1>
        </div>

        {/* Subcategory buttons */}
        {subcategoryButtons.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {subcategoryButtons.map(name => {
              const isSelected = (subNode?.name === name);
              return (
                <button
                  key={name}
                  onClick={() => handleClickSub(name)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    isSelected
                      ? 'bg-brand-green text-white border-brand-darkGreen'
                      : 'bg-gray-100 text-brand-gray-900 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        )}

        {/* Controls row: sort + price (left), excludeSoldOut (right) */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-gray-700">정렬</label>
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e)=>{ setSortKey(e.target.value as SortKey); setPage(1); }}
                  className="appearance-none border border-gray-300 rounded-md bg-white pl-2 pr-10 py-1 text-sm"
                >
                  <option value="sales">판매량 순</option>
                  <option value="rating">높은 평점</option>
                  <option value="reviews">리뷰 많은 순</option>
                  <option value="priceDesc">가격 높은 순</option>
                  <option value="priceAsc">가격 낮은 순</option>
                </select>
                <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-brand-gray-700">가격</label>
              <div className="relative">
                <select
                  value={priceSelection}
                  onChange={(e)=>{ setPriceSelection(e.target.value); setPage(1); }}
                  className="appearance-none border border-gray-300 rounded-md bg-white pl-2 pr-8 py-1 text-sm"
                >
                  <option value="">전체</option>
                  {PRICE_RANGES.map(r => (
                    <option key={r.label} value={r.label}>{r.label}</option>
                  ))}
                </select>
                <svg className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-brand-gray-700 ml-auto">
            <input type="checkbox" checked={excludeSoldOut} onChange={(e)=>{ setExcludeSoldOut(e.target.checked); setPage(1); }} />
            품절 상품 제외
          </label>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {listPage.content.map(item => {
            const cardProduct: Product = {
              id: item.id,
              name: item.name,
              price: item.minPrice,
              category: topNode?.name ?? '기타',
              image: item.thumbnailUrl,
              rating: item.avgRating,
              reviewCount: item.reviewCount,
            } as Product;
            return (
              <ProductCard key={item.id} product={cardProduct} productVariantId={item.productVariantId} />
            );
          })}
          {listPage.content.length === 0 && (
            <div className="col-span-full text-center text-brand-gray-600 py-10">조건에 맞는 상품이 없습니다.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button onClick={()=>goPage(page-1)} disabled={page===1} className={`px-3 py-1.5 rounded border ${page===1 ? 'text-gray-300 border-gray-200' : 'text-brand-gray-700 border-gray-300 hover:bg-gray-50'}`}>이전</button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1;
              return (
                <button key={n} onClick={()=>goPage(n)} className={`px-3 py-1.5 rounded border ${page===n ? 'bg-brand-pink border-brand-pink text-brand-gray-900' : 'text-brand-gray-700 border-gray-300 hover:bg-gray-50'}`}>{n}</button>
              );
            })}
            <button onClick={()=>goPage(page+1)} disabled={page===totalPages} className={`px-3 py-1.5 rounded border ${page===totalPages ? 'text-gray-300 border-gray-200' : 'text-brand-gray-700 border-gray-300 hover:bg-gray-50'}`}>다음</button>
          </div>
        )}
      </div>

    </div>
  );
};

export default CategoryList;