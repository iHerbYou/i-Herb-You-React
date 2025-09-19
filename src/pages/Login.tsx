import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement submit
    alert(`로그인 시도: ${email}`);
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-900 text-center mb-6">로그인</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-gray-700 mb-1">이메일</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-brand-gray-700 mb-1">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full bg-brand-pink text-brand-gray-900 py-2.5 rounded-md text-sm font-medium hover:bg-brand-pink/80 transition-colors">로그인</button>
        </form>

        {/* Divider */}
        <div className="mt-6 flex items-center">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400">또는 간편 로그인</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Social Sign-In */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 py-2.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <span className="font-extrabold text-[#4285F4]">G</span>
            Google로 로그인
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-[#FEE500] text-[#191919] py-2.5 rounded-md text-sm font-medium hover:brightness-95 transition-colors"
          >
            <span className="font-extrabold">K</span>
            카카오로 로그인
          </button>
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 bg-[#03C75A] text-white py-2.5 rounded-md text-sm font-medium hover:opacity-90 transition-colors"
          >
            <span className="font-extrabold">N</span>
            네이버로 로그인
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-sm">
          <Link to="/signup" className="text-brand-gray-700 hover:text-brand-pink">회원가입</Link>
          <Link to="/find-email" className="text-brand-gray-700 hover:text-brand-pink">이메일 찾기</Link>
          <Link to="/reset-password" className="text-brand-gray-700 hover:text-brand-pink">비밀번호 재설정</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;