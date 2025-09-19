import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categories } from '../data/categories';
import type { TopCategory, MidCategory } from '../data/categories';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('hideTopBannerUntil') : null;
      const until = raw ? parseInt(raw, 10) : 0;
      if (!Number.isNaN(until) && until > Date.now()) {
        setShowTopBanner(false);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

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

  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('auth');
      }
    } catch {}
    navigate('/login');
  };

  return (
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

          {/* Desktop Navigation with Categories */}
          <nav className="hidden md:flex space-x-6">
            {categories.map((top: TopCategory) => (
              <div
                key={top.name}
                className="relative group"
              >
                <button className="relative inline-flex items-center h-20 px-2 text-brand-gray-800 font-medium after:content-[''] after:block after:absolute after:bottom-0 after:left-0 after:h-[2px] after:bg-brand-pink after:w-full after:scale-x-0 group-hover:after:scale-x-100 after:origin-right group-hover:after:origin-left after:transition after:duration-500">
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
                        <div className="text-sm font-semibold text-gray-900 hover:text-brand-pink cursor-pointer transition-colors mb-2">{mid.name}</div>
                        {mid.items && (
                          <ul className="space-y-1">
                            {mid.items.map((s) => (
                              <li key={s.name}>
                                <a href="#" className="block text-sm text-gray-700 hover:text-brand-pink">{s.name}</a>
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
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center mx-4">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
              </svg>
              <input
                type="text"
                placeholder="검색어를 입력하세요"
                className="w-64 lg:w-80 border border-gray-300 rounded-full pl-9 pr-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-pink"
              />
            </div>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/login" className="text-brand-gray-700 hover:text-brand-pink text-sm font-medium">로그인</Link>
            <button aria-label="장바구니" className="relative text-brand-gray-700 hover:text-brand-pink">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 3h1.5l1.5 9.75A2.25 2.25 0 007.5 15.75h7.5a2.25 2.25 0 002.25-1.875l1.125-6.75H6.375" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.5 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 18.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              </svg>
              <span className="absolute -top-1 -right-1 bg-brand-red text-white text-[10px] min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border border-white">0</span>
            </button>
            <div className="relative group">
              <button className="bg-brand-green text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-darkGreen">
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
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-green-600">영양제</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-green-600">스포츠</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-green-600">뷰티</a>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-gray-700 hover:text-green-600">로그인</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;