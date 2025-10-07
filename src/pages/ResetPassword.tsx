import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { requestPasswordReset, confirmPasswordReset } from '../lib/auth';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // States for request step (no token)
  const [email, setEmail] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // States for confirm step (with token)
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Error and success modals
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (errorOpen) {
          setErrorOpen(false);
        }
        if (successOpen) {
          setSuccessOpen(false);
          if (confirmSuccess) {
            navigate('/login');
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [errorOpen, successOpen, confirmSuccess, navigate]);

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestLoading(true);
    setErrorMsg('');

    try {
      const res = await requestPasswordReset(email);
      setRequestSuccess(true);
      setSuccessMsg(res.message || '비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.');
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err?.message || '비밀번호 재설정 요청에 실패했습니다.';
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setRequestLoading(false);
    }
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmLoading(true);
    setErrorMsg('');

    if (newPassword.length < 8) {
      setErrorMsg('비밀번호는 8자 이상이어야 합니다.');
      setErrorOpen(true);
      setConfirmLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('비밀번호가 일치하지 않습니다.');
      setErrorOpen(true);
      setConfirmLoading(false);
      return;
    }

    try {
      const res = await confirmPasswordReset(token!, newPassword);
      setConfirmSuccess(true);
      setSuccessMsg(res.message || '비밀번호가 변경되었습니다. 로그인해주세요.');
      setSuccessOpen(true);
    } catch (err: any) {
      const msg = err?.message || '비밀번호 변경에 실패했습니다.';
      setErrorMsg(msg);
      setErrorOpen(true);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    if (confirmSuccess) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-900 text-center mb-6">
          {token ? '새 비밀번호 설정' : '비밀번호 재설정'}
        </h1>

        {!token ? (
          // Step 1: Request password reset (no token)
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-gray-700 mb-1">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={requestSuccess}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:bg-gray-100"
                placeholder="you@example.com"
              />
            </div>

            {!requestSuccess && (
              <button
                type="submit"
                disabled={requestLoading}
                className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${
                  requestLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                }`}
              >
                {requestLoading ? '전송 중...' : '비밀번호 재설정 링크 받기'}
              </button>
            )}
          </form>
        ) : (
          // Step 2: Confirm password reset (with token)
          <form onSubmit={handleConfirmSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-brand-gray-700 mb-1">
                새 비밀번호
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={confirmSuccess}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-gray-700 mb-1">
                새 비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={confirmSuccess}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>

            {!confirmSuccess && (
              <button
                type="submit"
                disabled={confirmLoading}
                className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${
                  confirmLoading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'
                }`}
              >
                {confirmLoading ? '변경 중...' : '비밀번호 변경'}
              </button>
            )}
          </form>
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

export default ResetPassword;
