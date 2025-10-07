import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as authLogin } from '../lib/auth';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const prefill = window.sessionStorage.getItem('prefillEmail');
      if (prefill) {
        setEmail(prefill);
        window.sessionStorage.removeItem('prefillEmail');
      }
    } catch {}
  }, []);

  // Close success modal with Enter key
  useEffect(() => {
    if (!successOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setSuccessOpen(false);
        navigate('/');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [successOpen, navigate]);

  // Close error modal with Enter key
  useEffect(() => {
    if (!errorOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setErrorOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [errorOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await authLogin(email, password);
      setSuccessMsg(res.message || '로그인에 성공했습니다.');
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.';
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setSubmitting(false);
    }
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
          <button type="submit" disabled={submitting} className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${submitting ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'}`}>로그인</button>
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
      {successOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-2xl border shadow-lg mx-auto overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                </div>
                {/* Sparkles for a cute feel */}
                <svg className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2l1.6 3.7L15 7.2l-3.4 1.5L10 12l-1.6-3.3L5 7.2l3.4-1.5L10 2z"/>
                </svg>
                <svg className="absolute -bottom-1 -left-1 w-3 h-3 text-pink-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path d="M10 2l1.2 2.8L14 6l-2.8 1.2L10 10 8.8 7.2 6 6l2.8-1.2L10 2z"/>
                </svg>
              </div>
              <h2 className="text-base font-semibold text-brand-gray-900">로그인 완료 <span aria-hidden="true">✨</span></h2>
            </div>
            <div className="px-6 py-5 text-sm text-brand-gray-800">
              <p>{successMsg}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => { setSuccessOpen(false); navigate('/'); }}
                className="px-4 py-2 rounded-md text-sm bg-brand-green text-white hover:bg-brand-darkGreen"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Modal */}
      {errorOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-2xl border shadow-lg mx-auto overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </div>
              </div>
              <h2 className="text-base font-semibold text-brand-gray-900">로그인 실패</h2>
            </div>
            <div className="px-6 py-5 text-sm text-brand-gray-800">
              <p>{errorMsg}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => setErrorOpen(false)}
                className="px-4 py-2 rounded-md text-sm bg-brand-primary text-white hover:bg-brand-gray-600"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;