import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../lib/api';

const Signup: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [agreeAll, setAgreeAll] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [termsHtml, setTermsHtml] = useState('');
  const [privacyHtml, setPrivacyHtml] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string>('');

  const navigate = useNavigate();

  const fetchHtml = async (path: string): Promise<string> => {
    try {
      const res = await fetch(path, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        const looksLikeAppShell = text.includes('<div id="root"') || text.includes('/@vite/client');
        if (looksLikeAppShell) return '';
        return text;
      }
    } catch {}
    return '';
  };

  const openTerms = async () => {
    setIsTermsOpen(true);
    if (!termsHtml) {
      const html = await fetchHtml('/policies/terms.html');
      if (html) setTermsHtml(html);
    }
  };

  const openPrivacy = async () => {
    setIsPrivacyOpen(true);
    if (!privacyHtml) {
      const html = await fetchHtml('/policies/privacy.html');
      if (html) setPrivacyHtml(html);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8 || password.length > 20) {
      setError('비밀번호는 8~20자여야 합니다.');
      return;
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('서비스 이용약관과 개인정보 처리방침에 동의해 주세요.');
      return;
    }
    try {
      setSubmitting(true);
      const payload: { name: string; email: string; password: string; phoneNumber?: string } = { name, email, password };
      if (phoneNumber.trim()) payload.phoneNumber = phoneNumber.trim();
      const res = await post<{ email: string; message: string }>(
        '/api/users/signup',
        payload,
        { credentials: 'include' }
      );
      try {
        window.sessionStorage.setItem('prefillEmail', email);
      } catch {}
      setSuccessMsg(res?.message || '회원가입이 완료되었습니다.');
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : '회원가입 중 오류가 발생했습니다.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const canEnable =
    !!name.trim() &&
    !!email.trim() &&
    password.length >= 8 &&
    confirm.length >= 8 &&
    agreeTerms &&
    agreePrivacy &&
    !submitting;

  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 11); // keep up to 11 digits
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 7) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    }
    setPhoneNumber(formatted);
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-900 text-center mb-6">회원가입</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-gray-700 mb-1">이름</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="홍길동"
            />
          </div>
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
            <label htmlFor="password" className="block text-sm font-medium text-brand-gray-700 mb-1">비밀번호 (8~20자)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={20}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-brand-gray-700 mb-1">비밀번호 확인</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              maxLength={20}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-brand-gray-700 mb-1">휴대폰 번호 (선택)</label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              maxLength={13}
              pattern="^010-\d{4}-\d{4}$"
              title="010-1234-5678 형식으로 입력하세요"
              placeholder="010-1234-5678"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
            />
          </div>
                    {/* Agreements */}
                    <div className="mt-2 space-y-2">
            <label className="flex items-start gap-2 text-sm text-brand-gray-700">
              <input
                type="checkbox"
                checked={agreeAll}
                onChange={(e) => {
                  const v = e.target.checked;
                  setAgreeAll(v);
                  setAgreeTerms(v);
                  setAgreePrivacy(v);
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand-lightGreen"
              />
              <span className="font-medium">전체 동의</span>
            </label>

            <label className="flex items-start gap-2 text-sm text-brand-gray-700">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  const v = e.target.checked;
                  setAgreeTerms(v);
                  setAgreeAll(v && agreePrivacy);
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand-lightGreen"
              />
              <span>
                (필수) <button type="button" onClick={openTerms} className="underline underline-offset-2 hover:text-brand-pink">서비스 이용약관</button>에 동의합니다.
              </span>
            </label>

            <label className="flex items-start gap-2 text-sm text-brand-gray-700">
              <input
                type="checkbox"
                checked={agreePrivacy}
                onChange={(e) => {
                  const v = e.target.checked;
                  setAgreePrivacy(v);
                  setAgreeAll(v && agreeTerms);
                }}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-brand-lightGreen"
              />
              <span>
                (필수) <button type="button" onClick={openPrivacy} className="underline underline-offset-2 hover:text-brand-pink">개인정보 처리방침</button>에 동의합니다.
              </span>
            </label>
          </div>
          
          {/* Terms Modal */}
          {isTermsOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
              <div className="bg-white w-full max-w-3xl rounded-2xl border shadow-lg mx-auto">
                <div className="flex items-center justify-between px-5 py-3 border-b">
                  <h2 className="text-lg font-bold text-brand-gray-900">아이허브유 서비스 이용약관</h2>
                  <button aria-label="닫기" onClick={() => setIsTermsOpen(false)} className="text-brand-gray-700 hover:text-brand-pink">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-5 text-sm text-brand-gray-800">
                  {termsHtml ? (
                    <iframe title="terms" srcDoc={termsHtml} className="w-full h-[60vh] border rounded-md"></iframe>
                  ) : (
                    <div className="max-h-[70vh] overflow-y-auto">
                      <p className="mb-3">요약: 서비스 제공·변경, 회원의 의무, 결제/환불, 이용제한, 면책 등을 규정합니다.</p>
                      <p className="text-brand-gray-600">전체 내용은 곧 제공될 정책 문서(HTML)로 대체됩니다.</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 px-5 py-3 border-t">
                  <button onClick={() => setIsTermsOpen(false)} className="px-4 py-2 rounded-md text-sm border text-brand-gray-700 hover:bg-gray-50">닫기</button>
                  <button onClick={() => { setAgreeTerms(true); setAgreeAll(true && agreePrivacy); setIsTermsOpen(false); }} className="px-4 py-2 rounded-md text-sm bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80">동의하고 닫기</button>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Modal */}
          {isPrivacyOpen && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
              <div className="bg-white w-full max-w-3xl rounded-2xl border shadow-lg mx-auto">
                <div className="flex items-center justify-between px-5 py-3 border-b">
                  <h2 className="text-lg font-bold text-brand-gray-900">아이허브유 개인정보 처리방침</h2>
                  <button aria-label="닫기" onClick={() => setIsPrivacyOpen(false)} className="text-brand-gray-700 hover:text-brand-pink">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="p-5 text-sm text-brand-gray-800">
                  {privacyHtml ? (
                    <iframe title="privacy" srcDoc={privacyHtml} className="w-full h-[60vh] border rounded-md"></iframe>
                  ) : (
                    <div className="max-h-[70vh] overflow-y-auto">
                      <p className="mb-3">요약: 수집 항목·이용 목적·보관 기간·제3자 제공/위탁·권리·보안조치 등을 안내합니다.</p>
                      <p className="text-brand-gray-600">전체 내용은 곧 제공될 정책 문서(HTML)로 대체됩니다.</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2 px-5 py-3 border-t">
                  <button onClick={() => setIsPrivacyOpen(false)} className="px-4 py-2 rounded-md text-sm border text-brand-gray-700 hover:bg-gray-50">닫기</button>
                  <button onClick={() => { setAgreePrivacy(true); setAgreeAll(true && agreeTerms); setIsPrivacyOpen(false); }} className="px-4 py-2 rounded-md text-sm bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80">동의하고 닫기</button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={!canEnable}
            className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${
              canEnable
                ? 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link to="/login" className="text-brand-gray-700 hover:text-brand-pink underline">이미 계정이 있으신가요? 로그인</Link>
        </div>
      </div>

      {/* Success Modal */}
      {successOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4" role="dialog" aria-modal="true">
          <div className="bg-white w-full max-w-md rounded-2xl border shadow-lg mx-auto overflow-hidden">
            <div className="px-6 py-5 border-b flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
              </div>
              <h2 className="text-base font-semibold text-brand-gray-900">회원가입 완료</h2>
            </div>
            <div className="px-6 py-5 text-sm text-brand-gray-800">
              <p>{successMsg}</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => { setSuccessOpen(false); navigate('/login'); }}
                className="px-4 py-2 rounded-md text-sm bg-brand-green text-white hover:bg-brand-darkGreen"
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

export default Signup;