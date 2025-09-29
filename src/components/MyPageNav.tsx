import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems: Array<{ to: string; label: string; icon: React.ReactNode }> = [
  {
    to: '/account',
    label: '내 계정',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14c-3.314 0-6 2.239-6 5h12c0-2.761-2.686-5-6-5zM12 12a4 4 0 100-8 4 4 0 000 8z" />
      </svg>
    ),
  },
  {
    to: '/orders',
    label: '주문 내역',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17h6M9 13h6M9 9h6M5 21h14a2 2 0 002-2V7l-4-4H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    to: '/wishlist',
    label: '위시리스트',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    to: '/reviews',
    label: '구매 후기',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927a1 1 0 011.902 0l1.09 3.36a1 1 0 00.95.69h3.534c.969 0 1.371 1.24.588 1.81l-2.86 2.079a1 1 0 00-.364 1.118l1.09 3.36c.3.922-.755 1.688-1.54 1.118l-2.86-2.08a1 1 0 00-1.175 0l-2.86 2.08c-.784.57-1.84-.196-1.54-1.118l1.09-3.36a1 1 0 00-.364-1.118L2.787 8.787c-.783-.57-.38-1.81.588-1.81H6.91a1 1 0 00.95-.69l1.19-3.36z" />
      </svg>
    ),
  },
];

const MyPageNav: React.FC = () => {
  const { pathname } = useLocation();
  return (
    <nav className="bg-white rounded-2xl shadow-md border p-4 h-full flex flex-col">
      <h2 className="text-base font-semibold text-brand-gray-900 mb-3">마이페이지</h2>
      <div className="flex md:flex-col gap-2">
        {navItems.map((n) => {
          const active = pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`px-3 py-2 rounded-md text-sm text-left border transition-colors flex items-center justify-between gap-2 ${
                active
                  ? 'bg-brand-green text-white border-brand-green'
                  : 'bg-white text-brand-gray-800 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="flex-1">{n.label}</span>
              <span className="opacity-80">{n.icon}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MyPageNav;

