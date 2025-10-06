import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products as allProducts, type Product as LegacyProduct } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { getCategoryTreeSync } from '../lib/catalog';
import { fetchProductDetail, type ProductDetailDto } from '../lib/products';
import { apiAddWishlist } from '../lib/wishlist';
import ProductQnASection from '../components/ProductQnASection';
import ProductReviewSection from '../components/ProductReviewSection';

const MAX_QTY = 7;

interface QAItem {
  id: number;
  title: string;
  body: string;
  author: string; // email or nickname
  createdAt: string;
  answer?: { body: string; createdAt: string };
}

interface ReviewItem {
  id: number;
  rating: number;
  author: string; // email or nickname
  createdAt: string;
  text: string;
  images?: string[];
}

const mockQAs: QAItem[] = [
  { id: 1, title: '복용 시간은 언제가 좋나요?', body: '아침 공복에 먹어도 되나요?', author: 'healthlover@example.com', createdAt: '2025-09-18', answer: { body: '식후 30분 이내 복용을 권장드립니다.', createdAt: '2025-09-19' } },
  { id: 2, title: '임산부도 섭취 가능한가요?', body: '성분에 카페인이 포함되어 있나요?', author: 'expectingmom@example.com', createdAt: '2025-09-16' },
];

const mockReviews: ReviewItem[] = [
  { id: 1, rating: 5, author: 'wellness1234@example.com', createdAt: '2025-09-10', text: '효과 좋아요. 재구매 의사 있습니다!', images: [] },
  { id: 2, rating: 4, author: 'fituser5678@example.com', createdAt: '2025-09-08', text: '포장 깔끔하고 배송 빨랐어요.' },
  { id: 3, rating: 3, author: 'user90@example.com', createdAt: '2025-09-05', text: '무난합니다.' },
];


type BackendImage = { url: string; isPrimary: boolean };
type BackendVariant = ProductDetailDto['variants'][number];
type BackendProduct = ProductDetailDto;

const ProductDetail: React.FC = () => {
  // ============ ALL HOOKS MUST BE AT THE TOP ============
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  // All useState hooks
  const [detail, setDetail] = useState<BackendProduct | undefined>(undefined);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [askOpen, setAskOpen] = useState(false);
  const [qas, setQas] = useState<QAItem[]>(mockQAs);
  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [writeOpen, setWriteOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState<null | { reviewId: number }>(null);
  const [reviewSummary, setReviewSummary] = useState<{ average: number; totalCount: number } | null>(null);

  // useEffect hook
  React.useEffect(() => {
    // Reset selectedVariantId when changing products
    setSelectedVariantId(null);
    
    const legacy: LegacyProduct | undefined = allProducts.find(p => String(p.id) === id);
    if (legacy) {
      const img: BackendImage = { url: legacy.image, isPrimary: true };
      const variant: BackendVariant = {
        id: legacy.id,
        variantName: '기본 옵션',
        listPrice: legacy.price,
        salePrice: legacy.price,
        stock: (legacy.reviewCount ?? 0) % 12 + 1,
        soldOut: false,
        upcCode: `880${legacy.id?.toString().padStart(6, '0')}`,
      } as BackendVariant;
      const detailData = {
        id: legacy.id,
        name: legacy.name,
        brandId: 0,
        brandName: legacy.name.split(' ')[0] || 'iHerbYou',
        categories: [legacy.category],
        avgRating: legacy.rating ?? 0,
        reviewCount: legacy.reviewCount ?? 0,
        code: `PD-${legacy.id.toString().padStart(5, '0')}`,
        expirationDate: Date.now() + 1000 * 60 * 60 * 24 * 450,
        saleStartDate: '2025-01-01',
        images: [img],
        variants: [variant],
        description: '엄선된 성분으로 구성된 건강 보조 제품입니다. 균형 잡힌 영양 공급에 도움을 줄 수 있습니다.',
        instruction: '하루 1~2회, 1회 1정 식후 섭취를 권장합니다.',
        ingredients: '비타민C, 비오틴, 히알루론산 등',
        cautions: '특이 체질, 알레르기 체질인 경우 성분을 확인하세요.',
        disclaimer: '본 정보는 의약품이 아닌 건강기능식품 관련 안내입니다.',
        nutritionFacts: '1회(1정)당 비타민C 1000mg 외',
        pillSize: '10x5x5mm',
      };
      setDetail(detailData);
      // Auto-select first variant
      setSelectedVariantId(variant.id);
    }
    
    // Then fetch from backend and replace
    const numId = Number(id);
    
    if (!Number.isNaN(numId)) {
      fetchProductDetail(numId)
        .then((dto) => {
          // Normalize image primary field name (backend uses isPrimary)
          const normalized: BackendProduct = {
            ...dto,
            images: (dto.images || []).map((i: any) => ({ url: i.url, isPrimary: i.isPrimary ?? (i.primary ?? i.is_primary) ?? false })),
          } as BackendProduct;
          setDetail(normalized);
          // Auto-select first variant from API data
          if (normalized.variants && normalized.variants.length > 0) {
            setSelectedVariantId(normalized.variants[0].id);
          }
        })
        .catch((error) => {
          console.error('[ProductDetail] API fetch failed:', error);
          // keep fallback
        });
    }
  }, [id]);

  const brandName = detail?.brandName ?? '';

  const images = useMemo(() => {
    if (!detail) return [] as string[];
    const sorted = [...detail.images].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary));
    return sorted.map(i => i.url);
  }, [detail]);

  const selectedVariant: BackendVariant | undefined = detail?.variants?.find(v => v.id === selectedVariantId);
  const stock = selectedVariant?.stock ?? 0;
  
  // Calculate max quantity based on stock (max 7 or stock, whichever is smaller)
  const maxQty = Math.min(MAX_QTY, stock);

  // Reset quantity when variant changes or when maxQty changes
  React.useEffect(() => {
    if (selectedVariant) {
      if (maxQty === 0) {
        setQty(0);
      } else if (qty > maxQty || qty === 0) {
        setQty(Math.max(1, maxQty));
      }
    }
  }, [selectedVariantId, maxQty, selectedVariant, qty]);

  const priceFormatted = (p: number) => p.toLocaleString() + '원';

  const copyShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast({ message: '링크가 복사되었습니다.' });
    } catch {
      showToast({ message: '링크 복사에 실패했습니다.' });
    }
  };

  const getAuth = () => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('auth') : null;
      if (!raw) return { nickname: 'guest', role: 'user', loggedIn: false } as const;
      const parsed = JSON.parse(raw);
      return { nickname: parsed?.nickname ?? 'guest', role: parsed?.role ?? 'user', loggedIn: true } as const;
    } catch {
      return { nickname: 'guest', role: 'user', loggedIn: false } as const;
    }
  };

  const handleWishlist = async () => {
    const { loggedIn } = getAuth();
    if (!loggedIn) {
      navigate('/login');
      return;
    }

    if (!detail) return;

    try {
      await apiAddWishlist(detail.id);
      showToast({ 
        message: '위시리스트에 추가되었습니다', 
        actionLabel: '위시리스트 보기', 
        onAction: () => (window.location.href = '/wishlist') 
      });
    } catch (error: any) {
      console.error('Failed to add to wishlist:', error);
      if (error.message && error.message.includes('이미')) {
        showToast({ message: '이미 위시리스트에 있는 상품입니다.' });
      } else {
        showToast({ message: '위시리스트 추가에 실패했습니다.' });
      }
    }
  };

  const closeCartModal = () => setCartModalOpen(false);

  const displayPrice = useMemo(() => {
    if (!selectedVariant) return 0;
    return selectedVariant.salePrice > 0 ? selectedVariant.salePrice : selectedVariant.listPrice;
  }, [selectedVariant]);

  const totalPrice = useMemo(() => displayPrice * qty, [displayPrice, qty]);
  const freeShipping = totalPrice >= 50000;

  const addToCartAndShow = () => {
    if (!detail || !selectedVariant) return;
    const cartItem: LegacyProduct = {
      id: detail.id,
      name: detail.name,
      price: displayPrice,
      category: detail.categories[0] || '기타',
      image: images[0] || '',
      rating: detail.avgRating,
      reviewCount: detail.reviewCount,
    } as LegacyProduct;
    addToCart(cartItem, qty);
    setCartModalOpen(true);
  };

  const frequentlyBought = useMemo(() => {
    if (!detail) return [] as LegacyProduct[];
    return allProducts
      .filter(p => p.id !== detail.id && p.category === (detail.categories[0] || ''))
      .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      .slice(0, 4);
  }, [detail]);

  // Use review summary if available, otherwise fallback to detail
  const rating = reviewSummary ? Math.round(reviewSummary.average * 10) / 10 : (detail?.avgRating ?? 0);
  const reviewCount = reviewSummary ? reviewSummary.totalCount : (detail?.reviewCount ?? 0);

  const prevImage = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImg((i) => (i + 1) % images.length);

  if (!detail) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <p className="text-brand-gray-700">존재하지 않는 상품입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-brand-gray-600 mb-3">
          <Link to="/" className="hover:text-brand-pink">홈</Link>
          {detail.categories.map((categoryName, index) => {
            const categoryTree = getCategoryTreeSync();
            let categoryUrl = '#';
            
            // Find the category in the tree structure
            for (const top of categoryTree) {
              if (top.name === categoryName) {
                categoryUrl = `/c/${top.id}`;
                break;
              }
              for (const mid of top.children) {
                if (mid.name === categoryName) {
                  categoryUrl = `/c/${top.id}/${mid.id}`;
                  break;
                }
                if (mid.items) {
                  for (const small of mid.items) {
                    if (small.name === categoryName) {
                      categoryUrl = `/c/${top.id}/${mid.id}/${small.id}`;
                      break;
                    }
                  }
                }
              }
            }
            
            return (
              <React.Fragment key={index}>
                <span className="mx-2 text-brand-gray-400">&gt;</span>
                <Link to={categoryUrl} className="hover:text-brand-pink">{categoryName}</Link>
              </React.Fragment>
            );
          })}
          <span className="mx-2 text-brand-gray-400">&gt;</span>
          <span className="text-brand-gray-900">{detail.name}</span>
        </nav>

        {/* Top section: gallery + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="relative w-full pt-[100%] bg-gray-100 rounded-xl overflow-hidden">
              <img src={images[activeImg]} alt={detail.name} className="absolute inset-0 w-full h-full object-cover" />

              {/* Prev / Next Arrows */}
              {images.length > 1 && (
                <>
                  <button aria-label="이전 이미지" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button aria-label="다음 이미지" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/40 text-white flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border ${activeImg === i ? 'border-brand-pink' : 'border-gray-200'}`}>
                  <img src={src} alt={`${detail.name}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">{detail.name}</h1>
            <div className="flex items-center gap-2 text-sm text-brand-gray-700 mb-2">
              <span>브랜드:</span>
              <Link to={`/brands/${encodeURIComponent(brandName.toLowerCase())}`} className="text-brand-pink hover:text-brand-pink/80">{brandName}</Link>
              <span className="mx-1 text-brand-gray-300">|</span>
              <span>제조사:</span>
              <Link to={`/brands/${encodeURIComponent(brandName.toLowerCase())}`} className="text-brand-pink hover:text-brand-pink/80">{brandName}</Link>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => {
                  const fillPercentage = Math.min(Math.max(rating - i, 0), 1) * 100;
                  
                  return (
                    <svg key={i} className="w-5 h-5 relative" viewBox="0 0 20 20">
                      <defs>
                        <linearGradient id={`star-gradient-${i}`}>
                          <stop offset={`${fillPercentage}%`} stopColor="currentColor" />
                          <stop offset={`${fillPercentage}%`} stopColor="transparent" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.953L10 0l2.951 5.957 6.561.953-4.756 4.635 1.122 6.545z" 
                        fill={fillPercentage > 0 ? `url(#star-gradient-${i})` : 'none'}
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </svg>
                  );
                })}
              </div>
              <span className="text-sm text-brand-gray-600">{rating.toFixed(1)} ({reviewCount} 리뷰)</span>
            </div>

            <div className="text-2xl font-bold text-brand-gray-900 mb-3">
              {selectedVariant && selectedVariant.salePrice > 0 && selectedVariant.salePrice < selectedVariant.listPrice && (
                <span className="mr-2 text-base line-through text-brand-gray-500">{priceFormatted(selectedVariant.listPrice)}</span>
              )}
              {priceFormatted(displayPrice)}
            </div>

            {/* Variant Selection */}
            {detail.variants && detail.variants.length > 1 && (
              <div className="mb-4">
                <label className="text-sm text-brand-gray-700 mb-2 block">옵션 선택</label>
                <div className="flex gap-2 overflow-x-auto">
                  {detail.variants.map((variant) => {
                    const isSelected = selectedVariantId === variant.id;
                    const variantPrice = variant.salePrice > 0 ? variant.salePrice : variant.listPrice;
                    const hasDiscount = variant.salePrice > 0 && variant.salePrice < variant.listPrice;
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        disabled={variant.soldOut}
                        className={`
                          relative px-4 py-3 rounded-lg border border-solid text-left transition-all whitespace-nowrap flex-shrink-0
                          ${isSelected 
                            ? 'border-brand-pink bg-brand-pink/5' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                          ${variant.soldOut 
                            ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                            : 'cursor-pointer'
                          }
                        `}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-brand-gray-900">{variant.variantName}</span>
                            {isSelected && (
                              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-brand-pink text-white text-[10px]">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {hasDiscount && (
                              <span className="text-xs text-brand-gray-400 line-through">
                                {priceFormatted(variant.listPrice)}
                              </span>
                            )}
                            <span className={`text-sm font-semibold ${hasDiscount ? 'text-brand-pink' : 'text-brand-gray-900'}`}>
                              {priceFormatted(variantPrice)}
                            </span>
                          </div>
                          <div>
                            {variant.soldOut ? (
                              <span className="text-xs text-red-500 font-medium">품절</span>
                            ) : (
                              <span className="text-xs text-brand-gray-500">
                                재고 {variant.stock}개
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-gray-700">수량</span>
                <div className={`inline-flex items-center border border-gray-300 rounded-md overflow-hidden ${stock === 0 ? 'opacity-50' : ''}`}>
                  <button onClick={()=>setQty(Math.max(1, qty-1))} disabled={stock === 0} className="px-3 py-1 text-brand-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                  <span className="px-4 text-brand-gray-900">{stock === 0 ? 0 : qty}</span>
                  <button onClick={()=>setQty(Math.min(maxQty, qty+1))} disabled={stock === 0} className="px-3 py-1 text-brand-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                </div>
                <span className="text-xs text-brand-gray-500">(최대 {maxQty}개)</span>
              </div>
              {stock <= 5 && stock > 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">재고 {stock}개 남음</span>
              )}
              {stock === 0 && (
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-300">품절</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button 
                onClick={addToCartAndShow} 
                disabled={stock === 0}
                className={`px-5 py-2 rounded-md font-semibold transition-colors ${
                  stock === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                }`}
              >
                장바구니에 추가
              </button>
              <button onClick={handleWishlist} className="px-5 py-2 rounded-md bg-gray-100 border border-gray-200 text-brand-gray-700 hover:bg-gray-200 inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                위시리스트
              </button>
              <button onClick={copyShare} className="px-5 py-2 rounded-md bg-gray-100 border border-gray-200 text-brand-gray-700 hover:bg-gray-200 inline-flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.172 13.828a4 4 0 005.656 0l3-3a4 4 0 10-5.656-5.656l-1.5 1.5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5" />
                </svg>
                링크 복사
              </button>
            </div>

              <div className="text-sm text-brand-gray-700 space-y-1">
                <div>
                  소비기한: {(() => {
                    const ts = detail.expirationDate ?? 0;
                    const ms = ts > 0 && ts < 1e11 ? ts * 1000 : ts;
                    return ts ? new Date(ms).toISOString().slice(0,10) : '-';
                  })()}
                </div>
                <div>상품코드: {detail.code}</div>
                <div>UPC코드: {selectedVariant?.upcCode ?? '-'}</div>
              </div>
          </div>
        </div>

        {/* Tabs: Description / Q&A / Reviews */}
        <div className="mt-10">
          <div className="flex gap-4 border-b sticky top-0 bg-white z-10">
            <a 
              href="#desc" 
              className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-pink transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('desc')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              상품 정보
            </a>
            <a 
              href="#qa" 
              className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-pink transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('qa')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              질문 & 답변
            </a>
            <a 
              href="#reviews" 
              className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-pink transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              구매후기
            </a>
          </div>

          {/* Description */}
          <section id="desc" className="py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">상세 설명</h2>
            {detail.description && (
              <p className="text-md text-brand-gray-700 mb-4 whitespace-pre-wrap">{detail.description}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-brand-gray-700">
              {detail.instruction && (
                <div>
                  <h3 className="font-semibold mb-1">사용법</h3>
                  <p className="whitespace-pre-wrap">{detail.instruction}</p>
                </div>
              )}
              {detail.ingredients && (
                <div>
                  <h3 className="font-semibold mb-1">성분 정보</h3>
                  <p className="whitespace-pre-wrap">{detail.ingredients}</p>
                </div>
              )}
              {detail.cautions && (
                <div>
                  <h3 className="font-semibold mb-1">주의사항</h3>
                  <p className="whitespace-pre-wrap">{detail.cautions}</p>
                </div>
              )}
              {detail.nutritionFacts && (
                <div>
                  <h3 className="font-semibold mb-1">영양 성분</h3>
                  <p className="whitespace-pre-wrap">{detail.nutritionFacts}</p>
                </div>
              )}
              {detail.pillSize && (
                <div>
                  <h3 className="font-semibold mb-1">알약 크기</h3>
                  <p>{detail.pillSize}</p>
                </div>
              )}
              {detail.saleStartDate && (
                <div>
                  <h3 className="font-semibold mb-1">판매 시작일</h3>
                  <p>{new Date(detail.saleStartDate).toLocaleDateString('ko-KR')}</p>
                </div>
              )}
              {detail.disclaimer && (
                <div className="sm:col-span-2">
                  <h3 className="font-semibold mb-1">고지사항</h3>
                  <p className="whitespace-pre-wrap text-xs text-brand-gray-600">{detail.disclaimer}</p>
                </div>
              )}
            </div>
          </section>

          {/* Q&A Section */}
          <section id="qa">
            <ProductQnASection productId={detail.id} />
          </section>

          {/* Reviews Section */}
        <section id="reviews">
          <ProductReviewSection 
            productId={detail.id} 
            onSummaryLoad={(summary) => setReviewSummary(summary)}
          />
        </section>
        </div>
      </div>

      {/* Cart Modal */}
      {cartModalOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={closeCartModal} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xl bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-5 border-b">
              <h3 className="text-lg font-semibold text-brand-gray-900">장바구니에 담았습니다</h3>
            </div>
            <div className="p-5">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden mr-3">
                  <img src={images[0]} alt={detail.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-brand-gray-900 font-medium truncate">{detail.name}</p>
                  <p className="text-sm text-brand-gray-700">{priceFormatted(displayPrice)} × {qty}</p>
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

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-brand-gray-700">합계</span>
                <span className="text-brand-gray-900 font-semibold">{totalPrice.toLocaleString()}원</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-4">
                <span className="text-brand-gray-600">무료 배송 기준 (50,000원 이상)</span>
                <span className={freeShipping ? 'text-brand-green font-semibold' : 'text-brand-gray-600'}>
                  {freeShipping ? '무료 배송 적용' : `${(50000 - totalPrice).toLocaleString()}원 남음`}
                </span>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button onClick={closeCartModal} className="px-4 py-2 text-sm rounded-md border text-brand-gray-700 hover:bg-gray-50">취소</button>
                <Link to="/cart" className="px-4 py-2 text-sm rounded-md bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80">장바구니 보기</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      <AskQuestionModal
        open={askOpen}
        onClose={() => setAskOpen(false)}
        onSubmit={(data) => {
          const { nickname } = getAuth();
          const newItem: QAItem = {
            id: Math.max(0, ...qas.map(q => q.id)) + 1,
            title: data.title,
            body: data.body,
            author: nickname,
            createdAt: new Date().toISOString().slice(0,10),
          };
          setQas(prev => [newItem, ...prev]);
          showToast({ message: '질문이 등록되었습니다.' });
          setAskOpen(false);
        }}
      />

      {/* Write Review Modal */}
      <WriteReviewModal
        open={writeOpen}
        onClose={()=>setWriteOpen(false)}
        onSubmit={({ rating: r, text, images }) => {
          const { nickname } = getAuth();
          const newReview: ReviewItem = {
            id: Math.max(0, ...reviews.map(rv => rv.id)) + 1,
            rating: r,
            author: nickname,
            createdAt: new Date().toISOString().slice(0,10),
            text,
            images: images?.filter(Boolean) ?? [],
          };
          setReviews(prev => [newReview, ...prev]);
          setWriteOpen(false);
          showToast({ message: '리뷰가 등록되었습니다.' });
        }}
      />

      {/* Report Review Modal */}
      <ReportReviewModal
        open={!!reportOpen}
        onClose={()=>setReportOpen(null)}
        onSubmit={(_data) => {
          if (!reportOpen) return;
          const target = reviews.find(r => r.id === reportOpen.reviewId);
          if (!target) return;
          try {
            const key = `warnings:${target.author}`;
            const raw = window.sessionStorage.getItem(key);
            const count = raw ? parseInt(raw, 10) || 0 : 0;
            window.sessionStorage.setItem(key, String(count + 1));
          } catch {}
          showToast({ message: '신고가 접수되었습니다.' });
          setReportOpen(null);
        }}
      />
    </div>
  );
};

const AskQuestionModal: React.FC<{ open: boolean; onClose: () => void; onSubmit: (data: { title: string; body: string }) => void }> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [agree, setAgree] = useState(false);

  if (!open) {
    return (
      <div className="hidden" />
    );
  }

  const canSubmit = title.trim().length > 0 && body.trim().length >= 5 && agree;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-gray-900">문의하기</h3>
          <button onClick={onClose} className="text-brand-gray-500 hover:text-brand-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <div>
            <label className="block text-brand-gray-700 mb-1">제목</label>
            <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <div>
            <label className="block text-brand-gray-700 mb-1">내용</label>
            <textarea value={body} onChange={(e)=>setBody(e.target.value)} rows={5} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          </div>
          <label className="inline-flex items-center gap-2 text-brand-gray-700">
            <input type="checkbox" checked={agree} onChange={(e)=>setAgree(e.target.checked)} /> 
            동의합니다
            <a href="/policies/qna.html" target="_blank" rel="noreferrer" className="text-brand-green hover:text-brand-darkGreen underline-offset-2 hover:underline">(Q&A 이용약관)</a>
          </label>
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border text-brand-gray-700 hover:bg-gray-50">취소</button>
          <button onClick={()=>canSubmit && onSubmit({ title, body })} disabled={!canSubmit} className={`px-4 py-2 text-sm rounded-md ${canSubmit ? 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>제출하기</button>
        </div>
      </div>
    </div>
  );
};

const WriteReviewModal: React.FC<{ open: boolean; onClose: () => void; onSubmit: (data: { rating: number; text: string; images?: string[] }) => void }> = ({ open, onClose, onSubmit }) => {
  const [rating, setRating] = useState<number>(5);
  const [text, setText] = useState<string>('');

  if (!open) return <div className="hidden" />;

  const len = text.length;
  const tooShort = len < 5;
  const tooLong = len > 1000;
  const canSubmit = !tooShort && !tooLong && rating >= 1 && rating <= 5;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold text-brand-gray-900">구매후기 작성</h3>
          <button onClick={onClose} className="text-brand-gray-500 hover:text-brand-gray-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-5 space-y-4 text-sm">
          <div>
            <label className="block text-brand-gray-700 mb-1">별점</label>
            <div className="flex items-center gap-1 text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={()=>setRating(i+1)} aria-label={`${i+1}점`} className="focus:outline-none">
                  <svg className="w-6 h-6" viewBox="0 0 20 20" fill={i + 1 <= rating ? 'currentColor' : 'none'} stroke="currentColor">
                    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.953L10 0l2.951 5.957 6.561.953-4.756 4.635 1.122 6.545z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-brand-gray-700 mb-1">리뷰 내용</label>
            <textarea value={text} onChange={(e)=>setText(e.target.value)} rows={6} placeholder="최소 5글자, 최대 1000글자" className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${tooShort || tooLong ? 'border-red-300 focus:ring-red-200' : 'border-gray-300 focus:ring-brand-pink'}`} />
            <div className={`mt-1 text-xs ${tooShort || tooLong ? 'text-red-600' : 'text-brand-gray-500'}`}>{len} / 1000</div>
          </div>

          <div>
            <label className="block text-brand-gray-700 mb-1">이미지 (최대 3장)</label>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-xs text-brand-gray-500 bg-gray-50">No Image</div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border text-brand-gray-700 hover:bg-gray-50">취소</button>
          <button onClick={()=>canSubmit && onSubmit({ rating, text, images: [] })} disabled={!canSubmit} className={`px-4 py-2 text-sm rounded-md ${canSubmit ? 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>등록하기</button>
        </div>
      </div>
    </div>
  );
};

const ReportReviewModal: React.FC<{ open: boolean; onClose: () => void; onSubmit: (data: { reason: string; other?: string }) => void }> = ({ open, onClose, onSubmit }) => {
  const [reason, setReason] = useState<string>('비속어');
  const [other, setOther] = useState<string>('');

  if (!open) return <div className="hidden" />;

  const isOther = reason === '기타';
  const canSubmit = !isOther || (isOther && other.trim().length > 0);

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-5 border-b">
          <h3 className="text-lg font-semibold text-brand-gray-900">신고하기</h3>
          <p className="text-xs text-brand-gray-600 mt-1">이 콘텐츠가 부적절하다고 판단되면 아래 사유를 선택해 알려주세요.</p>
        </div>
        <div className="p-5 space-y-3 text-sm">
          <label className="flex items-start gap-2"><input type="radio" name="report" checked={reason==='비속어'} onChange={()=>setReason('비속어')} /> <span>이 콘텐츠에는 비속어가 포함되어 있습니다.</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="report" checked={reason==='부적절한 미디어'} onChange={()=>setReason('부적절한 미디어')} /> <span>이 콘텐츠에 부적절한 미디어가 있습니다.</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="report" checked={reason==='스팸/저품질'} onChange={()=>setReason('스팸/저품질')} /> <span>이 콘텐츠는 수준이 낮거나 스팸입니다.</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="report" checked={reason==='의학적 조언'} onChange={()=>setReason('의학적 조언')} /> <span>이 콘텐츠에는 의학적 조언이 포함되어 있습니다.</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="report" checked={reason==='리워드/할인코드'} onChange={()=>setReason('리워드/할인코드')} /> <span>이 콘텐츠에는 리워드 코드 또는 할인코드가 포함되어 있습니다.</span></label>
          <label className="flex items-start gap-2"><input type="radio" name="report" checked={isOther} onChange={()=>setReason('기타')} /> <span>기타 - 여기에 이유를 써주세요.</span></label>
          {isOther && (
            <textarea value={other} onChange={(e)=>setOther(e.target.value)} rows={3} placeholder="기타 사유를 입력하세요" className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-pink" />
          )}
        </div>
        <div className="p-5 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md border text-brand-gray-700 hover:bg-gray-50">취소</button>
          <button onClick={()=>canSubmit && onSubmit({ reason, other: isOther ? other : undefined })} disabled={!canSubmit} className={`px-4 py-2 text-sm rounded-md ${canSubmit ? 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>제출하기</button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;