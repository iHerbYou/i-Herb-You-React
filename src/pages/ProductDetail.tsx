import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { products as allProducts, type Product } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';

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

function maskNickname(input: string): string {
  const local = input.includes('@') ? input.split('@')[0] : input;
  if (local.length <= 4) return local;
  return local.slice(0, 4) + '*'.repeat(local.length - 4);
}

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const product: Product | undefined = useMemo(() => allProducts.find(p => String(p.id) === id), [id]);

  const brandName = useMemo(() => {
    if (!product) return '';
    const first = product.name.split(' ')[0];
    return first.length >= 2 ? first : 'iHerbYou';
  }, [product]);

  const images = useMemo(() => {
    if (!product) return [] as string[];
    return [product.image, product.image, product.image].slice(0, 3);
  }, [product]);

  // Stock (mock)
  const stock = useMemo(() => {
    if (!product) return 0;
    const rc = product.reviewCount ?? 0;
    const s = (rc % 12) + 1;
    return s;
  }, [product]);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [askOpen, setAskOpen] = useState(false);
  const [qas, setQas] = useState<QAItem[]>(mockQAs);
  const [reviews, setReviews] = useState<ReviewItem[]>(mockReviews);
  const [writeOpen, setWriteOpen] = useState(false);

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

  const canDeleteQA = (author: string) => {
    const { nickname, role } = getAuth();
    return role === 'admin' || nickname === author;
  };

  const handleDeleteQA = (qaId: number) => {
    setQas(prev => prev.filter(q => q.id !== qaId));
    showToast({ message: '삭제되었습니다.' });
  };

  const handleWishlist = () => {
    const { loggedIn } = getAuth();
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    showToast({ message: '위시리스트에 추가되었습니다', actionLabel: '위시리스트 보기', onAction: () => (window.location.href = '/wishlist') });
  };

  const [cartModalOpen, setCartModalOpen] = useState(false);
  const closeCartModal = () => setCartModalOpen(false);

  const totalPrice = useMemo(() => (product ? product.price * qty : 0), [product, qty]);
  const freeShipping = totalPrice >= 50000;

  const addToCartAndShow = () => {
    if (!product) return;
    addToCart(product, qty);
    setCartModalOpen(true);
  };

  const frequentlyBought = useMemo(() => {
    if (!product) return [] as Product[];
    return allProducts
      .filter(p => p.id !== product.id && p.category === product.category)
      .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <p className="text-brand-gray-700">존재하지 않는 상품입니다.</p>
      </div>
    );
  }

  const rating = product.rating ?? 0;

  const prevImage = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setActiveImg((i) => (i + 1) % images.length);

  const { loggedIn, role } = getAuth();
  const isAdmin = role === 'admin';

  const [reportOpen, setReportOpen] = useState<null | { reviewId: number }>(null);

  const handleReportClick = (reviewId: number) => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    setReportOpen({ reviewId });
  };

  const handleAdminDeleteReview = (reviewId: number, author: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    try {
      const key = `warnings:${author}`;
      const raw = window.sessionStorage.getItem(key);
      const count = raw ? parseInt(raw, 10) || 0 : 0;
      window.sessionStorage.setItem(key, String(count + 1));
    } catch {}
    showToast({ message: '리뷰가 삭제되었습니다.' });
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-brand-gray-600 mb-3">
          <Link to="/" className="hover:text-brand-pink">홈</Link>
          <span className="mx-2 text-brand-gray-400">&gt;</span>
          <Link to={`/c/${encodeURIComponent(product.category)}`} className="hover:text-brand-pink">{product.category}</Link>
          <span className="mx-2 text-brand-gray-400">&gt;</span>
          <span className="text-brand-gray-900">{product.name}</span>
        </nav>

        {/* Top section: gallery + summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div>
            <div className="relative w-full pt-[100%] bg-gray-100 rounded-xl overflow-hidden">
              <img src={images[activeImg]} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />

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
                  <img src={src} alt={`${product.name}-${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm text-brand-gray-700 mb-2">
              <span>브랜드:</span>
              <Link to={`/brands/${encodeURIComponent(brandName.toLowerCase())}`} className="text-brand-pink hover:text-brand-pink/80">{brandName}</Link>
              <span className="mx-1 text-brand-gray-300">|</span>
              <span>제조사:</span>
              <Link to={`/brands/${encodeURIComponent(brandName.toLowerCase())}`} className="text-brand-pink hover:text-brand-pink/80">{brandName}</Link>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5" viewBox="0 0 20 20" fill={i + 1 <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor">
                    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.953L10 0l2.951 5.957 6.561.953-4.756 4.635 1.122 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-brand-gray-600">({product.reviewCount ?? 0} 리뷰)</span>
            </div>

            <div className="text-2xl font-bold text-brand-gray-900 mb-3">{priceFormatted(product.price)}</div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-brand-gray-700">수량</span>
                <div className="inline-flex items-center border border-gray-300 rounded-md overflow-hidden">
                  <button onClick={()=>setQty(Math.max(1, qty-1))} className="px-3 py-1 text-brand-gray-700 hover:bg-gray-50">-</button>
                  <span className="px-4 text-brand-gray-900">{qty}</span>
                  <button onClick={()=>setQty(Math.min(MAX_QTY, qty+1))} className="px-3 py-1 text-brand-gray-700 hover:bg-gray-50">+</button>
                </div>
                <span className="text-xs text-brand-gray-500">(최대 {MAX_QTY}개)</span>
              </div>
              {stock <= 5 && (
                <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">재고 {stock}개 남음</span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-4">
              <button onClick={addToCartAndShow} className="px-5 py-2 rounded-md bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80 font-semibold">장바구니에 추가</button>
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
              <div>소비기한: 2026-12-31</div>
              <div>상품코드: PD-{product.id.toString().padStart(5, '0')}</div>
              <div>UPC코드: 880{product.id.toString().padStart(6, '0')}</div>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Q&A / Reviews */}
        <div className="mt-10">
          <div className="flex gap-4 border-b">
            <a href="#desc" className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-pink">상품 정보</a>
            <a href="#qa" className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-pink">질문 & 답변</a>
            <a href="#reviews" className="px-3 py-2 text-sm text-brand-gray-700 hover:text-brand-pink">구매후기</a>
          </div>

          {/* Description */}
          <section id="desc" className="py-6">
            <h2 className="text-lg font-semibold text-brand-gray-900 mb-3">상세 설명</h2>
            <p className="text-sm text-brand-gray-700 mb-4">엄선된 성분으로 구성된 건강 보조 제품입니다. 균형 잡힌 영양 공급에 도움을 줄 수 있습니다.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-brand-gray-700">
              <div>
                <h3 className="font-semibold mb-1">사용법</h3>
                <p>하루 1~2회, 1회 1정 식후 섭취를 권장합니다.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">성분 정보</h3>
                <p>비타민C, 비오틴, 히알루론산 등</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">주의사항</h3>
                <p>특이 체질, 알레르기 체질인 경우 성분을 확인하세요.</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">영양 성분</h3>
                <p>1회(1정)당 비타민C 1000mg 외</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">무게/부피</h3>
                <p>500g / 350ml</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">판매 시작일</h3>
                <p>2025-01-01</p>
              </div>
            </div>
          </section>

          {/* Q&A */}
          <section id="qa" className="py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-brand-gray-900">질문 & 답변</h2>
              <div className="flex items-center gap-2">
                <Link to={`/p/${product.id}/qna`} className="text-sm text-brand-gray-700 hover:text-brand-pink">질문&답변 전체보기</Link>
                <button onClick={()=>setAskOpen(true)} className="px-4 py-2 rounded-md text-sm bg-brand-green text-white hover:bg-brand-darkGreen">질문하기</button>
              </div>
            </div>
            <div className="mb-3 flex items-center gap-2">
              <label className="text-sm text-brand-gray-700">정렬</label>
              <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
                <option>최신순</option>
              </select>
            </div>
            <div className="space-y-3">
              {qas.map(q => (
                <div key={q.id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-brand-gray-900">{q.title}</p>
                      <p className="text-sm text-brand-gray-700 mt-1 whitespace-pre-wrap">{q.body}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-brand-gray-500">
                        <div className="w-5 h-5 rounded-full bg-brand-gray-200 flex items-center justify-center text-[10px] text-brand-gray-700">
                          {maskNickname(q.author).slice(0,1).toUpperCase()}
                        </div>
                        <span>{maskNickname(q.author)}</span>
                        <span>·</span>
                        <span>{q.createdAt}</span>
                      </div>
                    </div>
                    {canDeleteQA(q.author) && (
                      <button onClick={()=>handleDeleteQA(q.id)} className="text-xs text-brand-gray-500 hover:text-red-500">삭제</button>
                    )}
                  </div>
                  {q.answer && (
                    <div className="mt-3 rounded-md bg-brand-gray-100 p-3 text-sm">
                      <p className="text-brand-gray-900 font-medium mb-1">답변</p>
                      <p className="text-brand-gray-700 whitespace-pre-wrap">{q.answer.body}</p>
                      <p className="text-xs text-brand-gray-500 mt-1">{q.answer.createdAt}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section id="reviews" className="py-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-brand-gray-900">구매후기</h2>
              <button onClick={()=>{ if(!loggedIn){ navigate('/login'); } else { setWriteOpen(true);} }} className="px-4 py-2 rounded-md text-sm bg-brand-green text-white hover:bg-brand-darkGreen">구매후기 작성하기</button>
            </div>
            <div className="mb-4 flex items-center gap-4">
              <div className="text-2xl font-bold text-brand-gray-900">{(product.rating ?? 0).toFixed(1)}</div>
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5" viewBox="0 0 20 20" fill={i + 1 <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor">
                    <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.953L10 0l2.951 5.957 6.561.953-4.756 4.635 1.122 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-brand-gray-600">({product.reviewCount ?? 0}개 리뷰)</span>
            </div>
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex text-yellow-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className="w-4 h-4" viewBox="0 0 20 20" fill={i + 1 <= r.rating ? 'currentColor' : 'none'} stroke="currentColor">
                            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.953L10 0l2.951 5.957 6.561.953-4.756 4.635 1.122 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-xs text-brand-gray-600 truncate">{r.createdAt} · {maskNickname(r.author)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin && (
                        <button onClick={()=>handleAdminDeleteReview(r.id, r.author)} className="text-xs text-brand-gray-600 hover:text-red-500">삭제</button>
                      )}
                      <button onClick={()=>handleReportClick(r.id)} className="text-xs text-brand-gray-600 hover:text-red-500">신고하기</button>
                    </div>
                  </div>
                  <p className="text-sm text-brand-gray-800 whitespace-pre-wrap">{r.text}</p>
                  {r.images && r.images.length > 0 && (
                    <div className="mt-2 flex gap-2">
                      {r.images.map((src, i) => (
                        <img key={i} src={src} alt="review" className="w-16 h-16 rounded-md object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
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
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-brand-gray-900 font-medium truncate">{product.name}</p>
                  <p className="text-sm text-brand-gray-700">{priceFormatted(product.price)} × {qty}</p>
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