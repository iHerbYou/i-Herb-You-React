import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const OrderFail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const errorCode = searchParams.get('code');
  const errorMessage = searchParams.get('message');

  return (
    <div className="min-h-[calc(100vh-124px)] flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-brand-gray-900 mb-2">결제 실패</h1>
          <p className="text-brand-gray-600 mb-2">
            {errorMessage || '결제 중 오류가 발생했습니다.'}
          </p>
          {errorCode && (
            <p className="text-sm text-brand-gray-500 mb-6">
              오류 코드: {errorCode}
            </p>
          )}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cart')}
              className="w-full bg-brand-pink text-white py-3 rounded-md hover:bg-brand-pink/90 transition-colors"
            >
              장바구니로 돌아가기
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-brand-gray-700 py-3 rounded-md hover:bg-gray-50 transition-colors"
            >
              홈으로 가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFail;

