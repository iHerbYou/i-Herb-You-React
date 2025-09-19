import React, { useState } from 'react';

const FindEmail: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Backend 예정: /api/auth/find-email
      await new Promise((r) => setTimeout(r, 600));
      setResult('example@iherbyou.com');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12">
        <h1 className="text-xl sm:text-2xl font-bold text-brand-gray-900 text-center mb-6">이메일 찾기</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-gray-700 mb-1">이름</label>
            <input id="name" type="text" value={name} onChange={(e)=>setName(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" placeholder="홍길동" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-brand-gray-700 mb-1">휴대폰 번호</label>
            <input id="phone" type="tel" value={phone} onChange={(e)=>setPhone(e.target.value)} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink" placeholder="010-0000-0000" />
          </div>
          <button type="submit" disabled={isLoading} className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors ${isLoading? 'bg-gray-200 text-gray-400 cursor-not-allowed':'bg-brand-pink text-brand-gray-900 hover:bg-brand-pink/80'}`}>{isLoading? '조회 중...':'이메일 찾기'}</button>
        </form>

        {result && (
          <div className="mt-6 text-center text-sm">
            <p className="text-brand-gray-700">찾은 이메일: <span className="font-semibold">{result}</span></p>
            <a href="/login" className="inline-block mt-3 text-brand-pink hover:text-brand-pink/80">로그인하러 가기</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindEmail;

