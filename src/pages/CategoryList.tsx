import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCategoryTreeSync, getCategoryTree } from '../lib/catalog';
import type { TopCategory, MidCategory, SmallCategory } from '../data/categories';
import { products as allProducts, type Product } from '../data/products';
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

  const [listPage, setListPage] = useState<PageResponseDto<ProductListDto>>(() => {
    // initial fallback from local data for fast first paint
    const base = topNode?.name ? allProducts.filter(p => p.category === topNode.name) : allProducts;
    const items = base.slice(0, PAGE_SIZE).map((p) => ({
      id: p.id,
      name: p.name,
      brandName: (p.name.split(' ')[0] || 'iHerbYou'),
      thumbnailUrl: p.image,
      minPrice: p.price,
      avgRating: p.rating ?? 0,
      reviewCount: p.reviewCount ?? 0,
      sales: p.reviewCount ?? 0,
      soldOut: false,
    }));
    return {
      totalPages: 1,
      totalElements: items.length,
      first: true,
      last: true,
      size: PAGE_SIZE,
      content: items,
      number: 0,
      sort: { empty: true, sorted: false, unsorted: true },
      pageable: { offset: 0, sort: { empty: true, sorted: false, unsorted: true }, paged: true, pageNumber: 0, pageSize: PAGE_SIZE, unpaged: false },
      numberOfElements: items.length,
      empty: items.length === 0,
    } as PageResponseDto<ProductListDto>;
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
        // fallback to local mock filtering
        let list: Product[] = topNode?.name ? allProducts.filter(p => p.category === topNode.name) : allProducts;
        if (range) list = list.filter(p => p.price >= range.min && (maxPrice ? p.price < maxPrice : true));
        if (excludeSoldOut) {
          // no-op in mock
        }
        const bySales = (p: Product) => (p.reviewCount ?? 0);
        const byRating = (p: Product) => (p.rating ?? 0);
        const byReviews = (p: Product) => (p.reviewCount ?? 0);
        list = [...list].sort((a, b) => {
          switch (sortKey) {
            case 'sales': return bySales(b) - bySales(a);
            case 'rating': return byRating(b) - byRating(a);
            case 'reviews': return byReviews(b) - byReviews(a);
            case 'priceDesc': return b.price - a.price;
            case 'priceAsc': return a.price - b.price;
            default: return 0;
          }
        });

        const total = list.length;
        const totalPagesLocal = Math.max(1, Math.ceil(total / PAGE_SIZE));
        const offsetLocal = (page - 1) * PAGE_SIZE;
        const slice = list.slice(offsetLocal, offsetLocal + PAGE_SIZE);
        const items = slice.map((p) => ({
          id: p.id,
          name: p.name,
          brandName: (p.name.split(' ')[0] || 'iHerbYou'),
          thumbnailUrl: p.image,
          minPrice: p.price,
          avgRating: p.rating ?? 0,
          reviewCount: p.reviewCount ?? 0,
          sales: p.reviewCount ?? 0,
          soldOut: false,
        }));
        setListPage({
          totalPages: totalPagesLocal,
          totalElements: total,
          first: page === 1,
          last: page === totalPagesLocal,
          size: PAGE_SIZE,
          content: items,
          number: page - 1,
          sort: { empty: false, sorted: true, unsorted: false },
          pageable: { offset: offsetLocal, sort: { empty: false, sorted: true, unsorted: false }, paged: true, pageNumber: page - 1, pageSize: PAGE_SIZE, unpaged: false },
          numberOfElements: items.length,
          empty: items.length === 0,
        });
      });
  }, [page, PAGE_SIZE, excludeSoldOut, priceSelection, subId, midId, topId, sortKey, topNode]);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);

  const handleAddToCart = (product: Product) => {
    setAddedProduct(product);
    setModalOpen(true);
  };

  const currentProducts: Product[] = useMemo(() => {
    return (listPage.content || []).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.minPrice,
      category: topNode?.name ?? '기타',
      image: item.thumbnailUrl,
      rating: item.avgRating,
      reviewCount: item.reviewCount,
    } as Product));
  }, [listPage, topNode]);

  const frequentlyBought = useMemo(() => {
    if (!addedProduct) return [] as Product[];
    return currentProducts
      .filter(p => p.id !== addedProduct.id)
      .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      .slice(0, 4);
  }, [addedProduct, currentProducts]);

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
              <ProductCard key={item.id} product={cardProduct} onAddToCart={handleAddToCart} />
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

      {/* Add-to-Cart Modal */}
      {modalOpen && addedProduct && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={()=>setModalOpen(false)} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold text-brand-gray-900">장바구니에 담았습니다</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                  <img src={addedProduct.image} alt={addedProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-brand-gray-900 font-medium truncate">{addedProduct.name}</p>
                  <p className="text-sm text-brand-gray-700">{addedProduct.price.toLocaleString()}원</p>
                </div>
              </div>

              {frequentlyBought.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-semibold text-brand-gray-900 mb-2">함께 많이 주문하는 조합</p>
                  <div className="grid grid-cols-2 gap-3">
                    {frequentlyBought.map(p => (
                      <div key={p.id} className="flex items-center gap-3 border rounded-lg p-2">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-brand-gray-900 truncate">{p.name}</p>
                          <p className="text-[11px] text-brand-gray-600">{p.price.toLocaleString()}원</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <button onClick={()=>setModalOpen(false)} className="px-4 py-2 text-sm rounded-md border text-brand-gray-700 hover:bg-gray-50">계속 쇼핑하기</button>
                <Link to="/cart" className="px-4 py-2 text-sm rounded-md bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80">장바구니 보기</Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;