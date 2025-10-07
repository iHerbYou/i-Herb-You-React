import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail, resendVerificationEmail } from '../lib/auth';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // For resend functionality
  const [showResendForm, setShowResendForm] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Success modal
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Error modal
  const [errorOpen, setErrorOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (errorOpen) {
          setErrorOpen(false);
        }
        if (successOpen) {
          setSuccessOpen(false);
          if (verified) {
            navigate('/login');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [errorOpen, successOpen, verified, navigate]);

  const handleVerify = async () => {
    if (!token) {
      setErrorMsg('유효하지 않은 인증 링크입니다.');
      setErrorOpen(true);
      return;
    }

    setVerifying(true);
    setErrorMsg('');

    try {
      const res = await verifyEmail(token);
      setVerified(true);
      setSuccessMsg(res.message || '이메일 인증이 완료되었습니다. 로그인해주세요.');
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err?.message || '이메일 인증에 실패했습니다.';
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resendEmail.trim()) {
      setErrorMsg('이메일을 입력해주세요.');
      setErrorOpen(true);
      return;
    }

    setResending(true);
    setErrorMsg('');

    try {
      const res = await resendVerificationEmail(resendEmail);
      setResendSuccess(true);
      setSuccessMsg(res.message || '인증 이메일이 재발송 되었습니다.');
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err?.message || '이메일 재발송에 실패했습니다.';
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setResending(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    if (verified) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12">
        <div className="text-center mb-6">
          {/* Email Icon */}
          <div className="mx-auto w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-brand-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-900 mb-2">이메일 인증</h1>
          <p className="text-sm text-brand-gray-600">
            {verified 
              ? '이메일 인증이 완료되었습니다.' 
              : '아래 버튼을 눌러 이메일 인증을 완료해주세요.'}
          </p>
        </div>

        {!verified && !showResendForm && (
          <div className="space-y-4">
            <button
              onClick={handleVerify}
              disabled={verifying || !token}
              className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${
                verifying || !token
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
              }`}
            >
              {verifying ? '인증 중...' : '이메일 인증하기'}
            </button>

            <div className="text-center">
              <p className="text-sm text-brand-gray-600 mb-2">인증 이메일을 받지 못하셨나요?</p>
              <button
                onClick={() => setShowResendForm(true)}
                className="text-sm text-brand-green hover:text-brand-darkGreen font-medium"
              >
                인증 이메일 재발송
              </button>
            </div>
          </div>
        )}

        {showResendForm && !verified && (
          <div className="space-y-4">
            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <label htmlFor="resendEmail" className="block text-sm font-medium text-brand-gray-700 mb-1">
                  이메일 주소
                </label>
                <input
                  id="resendEmail"
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  disabled={resendSuccess}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:bg-gray-100"
                  placeholder="you@example.com"
                />
              </div>

              {!resendSuccess && (
                <button
                  type="submit"
                  disabled={resending}
                  className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${
                    resending
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                  }`}
                >
                  {resending ? '재발송 중...' : '인증 이메일 재발송'}
                </button>
              )}
            </form>

            <button
              onClick={() => setShowResendForm(false)}
              className="w-full py-2.5 rounded-md text-sm font-medium border border-gray-300 text-brand-gray-700 hover:bg-gray-50 transition-colors"
            >
              뒤로 가기
            </button>
          </div>
        )}

        {/* 홈으로 가기 버튼 */}
        <button
          onClick={() => navigate('/')}
          className="w-full mt-6 inline-flex items-center justify-center gap-2 border border-brand-green text-brand-green px-6 py-2.5 rounded-md text-sm font-semibold bg-brand-green/10 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          메인으로 가기
        </button>

        {/* Error Modal */}
        {errorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setErrorOpen(false)}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2 text-brand-gray-900">오류</h2>
              <p className="text-sm text-brand-gray-700 mb-4">{errorMsg}</p>
              <button
                onClick={() => setErrorOpen(false)}
                className="w-full bg-brand-primary text-white py-2 rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {successOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleSuccessClose}>
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold mb-2 text-brand-gray-900">완료</h2>
              <p className="text-sm text-brand-gray-700 mb-4">{successMsg}</p>
              <button
                onClick={handleSuccessClose}
                className="w-full bg-brand-primary text-white py-2 rounded-md hover:bg-brand-primary/90 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

