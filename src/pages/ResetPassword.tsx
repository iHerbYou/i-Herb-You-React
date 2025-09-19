import React, { useState } from 'react';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const handleSendCode = (e: React.MouseEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage('이메일을 입력해 주세요.');
      return;
    }
    setMessage('인증코드를 이메일로 보냈습니다. (시뮬레이션)');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email) return setMessage('이메일을 입력해 주세요.');
    if (!code) return setMessage('인증코드를 입력해 주세요.');
    if (newPassword.length < 8) return setMessage('비밀번호는 8자 이상이어야 합니다.');
    if (newPassword !== confirmPassword) return setMessage('비밀번호가 일치하지 않습니다.');

    setMessage('비밀번호가 재설정되었습니다. 이제 로그인해 주세요. (시뮬레이션)');
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-900 text-center mb-6">비밀번호 재설정</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-brand-gray-700 mb-1">이메일</label>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
                placeholder="you@example.com"
              />
              <button
                onClick={handleSendCode}
                className="whitespace-nowrap px-3 py-2 text-sm font-medium border border-brand-pink text-brand-pink rounded-md hover:bg-brand-pink/10"
              >
                인증코드 보내기
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="code" className="block text-sm font-medium text-brand-gray-700 mb-1">인증코드</label>
            <input
              id="code"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="6자리 숫자 코드를 입력하세요"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-brand-gray-700 mb-1">새 비밀번호</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-brand-gray-700 mb-1">새 비밀번호 확인</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-pink text-brand-gray-900 py-2.5 rounded-md text-sm font-medium hover:bg-brand-pink/80 transition-colors"
          >
            비밀번호 재설정
          </button>
        </form>

        {message && (
          <div className="mt-6 p-3 rounded-md text-sm bg-brand-pinkSoft text-brand-gray-900">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;