import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategoryTreeSync, getCategoryTree } from '../lib/catalog';
import type { TopCategory, MidCategory } from '../data/categories';
import { logout as authLogout } from '../lib/auth';
import { getSuggestions, type SuggestionResponse } from '../lib/search';
import { getSearchHistory, addSearchHistory, removeSearchHistory, type SearchHistoryItem } from '../lib/searchHistory';
import { getAllBrands, type BrandResponse } from '../lib/brands';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);
  const [catalog, setCatalog] = useState<TopCategory[]>(() => getCategoryTreeSync());
  
  // 브랜드 관련 state
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  
  // 검색 관련 state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionResponse | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const searchTimeoutRef = useRef<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const hasAuthCookie = () => {
    try {
      if (typeof document === 'undefined') return false;
      return /(?:^|; )ihy_access_token=/.test(document.cookie);
    } catch { return false; }
  };
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    try {
      const hasSession = typeof window !== 'undefined' && !!window.sessionStorage.getItem('auth');
      return hasSession || hasAuthCookie();
    } catch {
      return false;
    }
  });
  const [logoutSuccessOpen, setLogoutSuccessOpen] = useState(false);
  const [logoutMsg, setLogoutMsg] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    // warm and update catalog
    getCategoryTree().then(setCatalog).catch(() => {});
    
    // 브랜드 목록 로드
    getAllBrands().then(setBrands).catch(() => setBrands([]));

    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('hideTopBannerUntil') : null;
      const until = raw ? parseInt(raw, 10) : 0;
      if (!Number.isNaN(until) && until > Date.now()) {
        setShowTopBanner(false);
      }
    } catch {
      // ignore storage errors
    }

    // 검색 히스토리 로드
    setSearchHistory(getSearchHistory());
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      try {
        const raw = window.sessionStorage.getItem('auth');
        setIsAuthed(!!raw || hasAuthCookie());
      } catch {
        setIsAuthed(hasAuthCookie());
      }
    };
    const onAuthChange = () => syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('auth:change', onAuthChange as EventListener);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('auth:change', onAuthChange as EventListener);
    };
  }, []);

  // Close logout success modal with Enter key
  useEffect(() => {
    if (!logoutSuccessOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setLogoutSuccessOpen(false);
        navigate('/');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [logoutSuccessOpen, navigate]);

  const handleHideBannerForToday = () => {
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('hideTopBannerUntil', String(endOfDay.getTime()));
      }
    } catch {
      // ignore storage errors
    }
    setShowTopBanner(false);
  };

  const handleLogout = async () => {
    await authLogout();
    setIsAuthed(false);
    setLogoutMsg('로그아웃이 완료되었습니다.');
    setLogoutSuccessOpen(true);
  };

  // 검색 관련 함수
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // 자동완성 요청 (디바운스)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim().length >= 2) {
      searchTimeoutRef.current = window.setTimeout(() => {
        getSuggestions(value.trim())
          .then(setSuggestions)
          .catch(() => setSuggestions(null));
      }, 300);
    } else {
      setSuggestions(null);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addSearchHistory(searchQuery.trim());
      setSearchHistory(getSearchHistory());
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchFocused(false);
      setSuggestions(null);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (type: 'category' | 'product', id: number) => {
    if (type === 'category') {
      addSearchHistory(searchQuery.trim());
      setSearchHistory(getSearchHistory());
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate(`/p/${id}`);
    }
    setSearchFocused(false);
    setSuggestions(null);
    setSearchQuery('');
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    addSearchHistory(query);
    setSearchHistory(getSearchHistory());
    navigate(`/search?query=${encodeURIComponent(query)}`);
    setSearchFocused(false);
    setSuggestions(null);
  };

  const handleHistoryRemove = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeSearchHistory(query);
    setSearchHistory(getSearchHistory());
  };

  // 검색창 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
    <header className="bg-white shadow-sm border-b">
      {/* Top Banner */}
      {showTopBanner && (
        <div className="bg-brand-pink/20 text-brand-gray-900 text-center py-3 text-sm relative">
          <Link to="/event/coupon" className="font-medium hover:text-brand-green transition-colors">첫 쇼핑을 지원하는 3,000원 할인 회원가입 쿠폰</Link>
          <button
            onClick={handleHideBannerForToday}
            aria-label="오늘 하루 보지 않기"
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-xs hover:text-brand-gray-700 flex items-center justify-center"
          >
            <span className="hidden sm:inline underline">오늘 하루 보지 않기</span>
            <svg className="inline sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-3xl font-bold text-brand-green">
              <Link to="/">iHerbYou</Link>
            </h1>
          </div>

          {/* Desktop Navigation with Categories (lg+) */}
          <nav className="hidden lg:flex space-x-6">
            {catalog.map((top: TopCategory) => (
              <div
                key={top.name}
                className="relative group"
              >
                <button onClick={() => navigate(`/c/${top.id}`)} className="relative inline-flex items-center h-20 px-2 text-brand-gray-800 font-medium after:content-[''] after:block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-brand-pink after:w-full after:scale-x-0 group-hover:after:scale-x-100 after:origin-right group-hover:after:origin-left after:transition after:duration-500">
                  <span>{top.name}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Mid-level dropdown */}
                <div className="absolute top-full left-0 w-[720px] bg-white shadow-lg rounded-md border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity before:content-[''] before:absolute before:inset-x-0 before:-top-2 before:h-2">
                  <div className="grid grid-cols-3 gap-4 p-4 max-h-[60vh] overflow-y-auto">
                    {top.children.map((mid: MidCategory) => (
                      <div key={mid.name}>
                        <div onClick={()=>navigate(`/c/${top.id}/${mid.id}`)} className="text-sm font-semibold text-gray-900 hover:text-brand-pink cursor-pointer transition-colors mb-2">{mid.name}</div>
                        {mid.items && (
                          <ul className="space-y-1">
                            {mid.items.map((s) => (
                              <li key={s.name}>
                                <button onClick={()=>navigate(`/c/${top.id}/${mid.id}/${s.id}`)} className="block text-left w-full text-sm text-gray-700 hover:text-brand-pink">{s.name}</button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* 브랜드 메뉴 */}
            <div className="relative group">
              <button className="relative inline-flex items-center h-20 px-2 text-brand-gray-800 font-medium after:content-[''] after:block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-brand-pink after:w-full after:scale-x-0 group-hover:after:scale-x-100 after:origin-right group-hover:after:origin-left after:transition after:duration-500">
                <span>브랜드</span>
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* 브랜드 드롭다운 */}
              <div className="absolute top-full left-0 w-[400px] bg-white shadow-lg rounded-md border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity before:content-[''] before:absolute before:inset-x-0 before:-top-2 before:h-2">
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {brands.filter(brand => brand.productCount > 0).map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => navigate(`/brands/${brand.id}`)}
                        className="text-left p-0 text-sm text-gray-700 hover:text-brand-pink transition-colors"
                      >
                        <span className="font-medium">{brand.name}</span>
                        <span className="text-xs text-gray-500 ml-1">({brand.productCount})</span>
                      </button>
                    ))}
                  </div>
                  {brands.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">브랜드를 불러오는 중...</p>
                  )}
                  {brands.length > 0 && brands.filter(brand => brand.productCount > 0).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">상품이 있는 브랜드가 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center mx-4">
            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearchSubmit}>
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="검색어를 입력하세요"
                  className="w-64 lg:w-80 border border-gray-300 rounded-full pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink"
                />
              </form>

              {/* 드롭다운 (자동완성 또는 최근 검색어) */}
              {searchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {/* 자동완성 결과가 있을 때 */}
                  {suggestions && (suggestions.categories.length > 0 || suggestions.products.length > 0) ? (
                    <>
                      {/* 카테고리 섹션 */}
                      {suggestions.categories.length > 0 && (
                        <div className="p-3 border-b">
                          <h3 className="text-xs font-semibold text-brand-gray-600 mb-2">카테고리</h3>
                          <ul className="space-y-1">
                            {suggestions.categories.map((cat) => (
                              <li key={cat.id}>
                                <button
                                  onClick={() => handleSuggestionClick('category', cat.id)}
                                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-brand-gray-50 rounded transition-colors"
                                >
                                  <span className="text-brand-gray-700">{cat.path}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 상품 섹션 */}
                      {suggestions.products.length > 0 && (
                        <div className="p-3">
                          <h3 className="text-xs font-semibold text-brand-gray-600 mb-2">상품</h3>
                          <ul className="space-y-1">
                            {suggestions.products.map((product) => (
                              <li key={product.id}>
                                <button
                                  onClick={() => handleSuggestionClick('product', product.id)}
                                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-brand-gray-50 rounded transition-colors"
                                >
                                  <div className="text-brand-gray-900">{product.name}</div>
                                  <div className="text-xs text-brand-gray-500">{product.brandName}</div>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    /* 최근 검색어 표시 */
                    searchHistory.length > 0 && (
                      <div className="p-3">
                        <h3 className="text-xs font-semibold text-brand-gray-600 mb-2">최근 검색어</h3>
                        <ul className="space-y-1">
                          {searchHistory.map((item) => (
                            <li key={item.timestamp}>
                              <button
                                onClick={() => handleHistoryClick(item.query)}
                                className="w-full text-left px-2 py-1.5 text-sm hover:bg-brand-gray-50 rounded transition-colors flex items-center justify-between group"
                              >
                                <span className="text-brand-gray-900">{item.query}</span>
                                <button
                                  onClick={(e) => handleHistoryRemove(item.query, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                  aria-label="검색어 삭제"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* User Actions (lg+) */}
          <div className="hidden lg:flex items-center space-x-6">
            {!isAuthed ? (
              <Link to="/login" className="text-brand-gray-700 hover:text-brand-pink text-sm font-medium">로그인</Link>
            ) : (
              <button onClick={handleLogout} className="text-brand-gray-700 hover:text-brand-pink text-sm font-medium">로그아웃</button>
            )}
            <button aria-label="장바구니" className="relative text-brand-gray-700 hover:text-brand-pink">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.5l1.5 9.75A2.25 2.25 0 007.5 15.75h7.5a2.25 2.25 0 002.25-1.875l1.125-6.75H6.375" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border border-white">0</span>
            </button>
            {isAuthed && (
              <div className="relative group">
                <button 
                  onClick={() => navigate('/account')}
                  className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-darkGreen"
                >
                  마이페이지
                </button>
                <div className="absolute top-full right-0 mt-2 w-52 bg-white shadow-lg rounded-md border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-2">
                    <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">내 계정</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">주문 내역</Link>
                    <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">위시리스트</Link>
                    <Link to="/reviews" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">구매후기</Link>
                    <div className="px-2 pt-1">
                      <button onClick={handleLogout} className="w-full px-3 py-2 rounded-md text-sm font-medium bg-white text-brand-green border border-brand-green hover:bg-brand-green/10">로그아웃</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button (visible below lg) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-green-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation (visible below lg) */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              {catalog.map((top: TopCategory) => (
                <button
                  key={top.id}
                  onClick={() => { setIsMenuOpen(false); navigate(`/c/${top.id}`); }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-green-600"
                >
                  {top.name}
                </button>
              ))}
              
              {/* 모바일 브랜드 메뉴 */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  브랜드
                </div>
                <div className="grid grid-cols-2 gap-1 px-3">
                  {brands.filter(brand => brand.productCount > 0).slice(0, 8).map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => { setIsMenuOpen(false); navigate(`/brands/${brand.id}`); }}
                      className="block w-full text-left px-2 py-1.5 text-sm text-gray-700 hover:text-brand-green hover:bg-brand-gray-50 rounded"
                    >
                      <span className="font-medium">{brand.name}</span>
                      <span className="text-xs text-gray-500 ml-1">({brand.productCount})</span>
                    </button>
                  ))}
                </div>
                {brands.filter(brand => brand.productCount > 0).length > 8 && (
                  <div className="px-3 mt-2">
                    <button
                      onClick={() => { setIsMenuOpen(false); navigate('/brands'); }}
                      className="text-sm text-brand-green hover:text-brand-darkGreen font-medium"
                    >
                      모든 브랜드 보기 ({brands.filter(brand => brand.productCount > 0).length}개)
                    </button>
                  </div>
                )}
                {brands.length > 0 && brands.filter(brand => brand.productCount > 0).length === 0 && (
                  <div className="px-3 mt-2">
                    <p className="text-sm text-gray-500 text-center py-2">상품이 있는 브랜드가 없습니다.</p>
                  </div>
                )}
              </div>

              {!isAuthed ? (
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-green-600">로그인</Link>
              ) : (
                <button 
                  onClick={() => { setIsMenuOpen(false); navigate('/account'); }} 
                  className="block w-full text-left px-3 py-2 text-brand-green hover:text-brand-darkGreen font-medium"
                >
                  마이페이지
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    {logoutSuccessOpen && (
      <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
        <div className="bg-white w-full max-w-md rounded-2xl border shadow-lg mx-auto overflow-hidden">
          <div className="px-6 py-5 border-b flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2l1.6 3.7L15 7.2l-3.4 1.5L10 12l-1.6-3.3L5 7.2l3.4-1.5L10 2z"/>
              </svg>
              <svg className="absolute -bottom-1 -left-1 w-3 h-3 text-pink-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 2l1.2 2.8L14 6l-2.8 1.2L10 10 8.8 7.2 6 6l2.8-1.2L10 2z"/>
              </svg>
            </div>
            <h2 className="text-base font-semibold text-brand-gray-900">로그아웃 완료 <span aria-hidden="true">✨</span></h2>
          </div>
          <div className="px-6 py-5 text-sm text-brand-gray-800">
            <p>{logoutMsg || '로그아웃이 완료되었습니다.'}</p>
          </div>
          <div className="px-6 py-4 border-t flex justify-end">
            <button
              onClick={() => { setLogoutSuccessOpen(false); navigate('/'); }}
              className="px-4 py-2 rounded-md text-sm bg-brand-green text-white hover:bg-brand-darkGreen"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;