import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-124px)] bg-transparent sm:bg-brand-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-transparent sm:bg-white rounded-none sm:rounded-2xl shadow-none sm:shadow-md p-8 sm:p-12 text-center">
        <div className="mx-auto mb-6">
          {/* Cute Plant/Face SVG */}
          <svg className="mx-auto w-24 h-24 text-brand-green" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="48" fill="#F1FFF6" />
            <path d="M60 20c10 8 16 20 16 26 0 6-5 8-9 5-3-2-5-5-7-9-2 4-4 7-7 9-4 3-9 1-9-5 0-6 6-18 16-26Z" fill="#4CAF50"/>
            <circle cx="45" cy="62" r="4" fill="#1F2937"/>
            <circle cx="75" cy="62" r="4" fill="#1F2937"/>
            <path d="M48 78c6 6 18 6 24 0" stroke="#1F2937" strokeWidth="3" strokeLinecap="round"/>
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-gray-900 mb-2">페이지를 찾을 수 없어요</h1>
        <p className="text-brand-gray-600 mb-6">요청하신 페이지가 사라졌거나, 주소가 잘못되었을 수 있어요.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 bg-brand-pink text-brand-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-pink/80 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            메인으로 가기
          </Link>
        </div>
        <p className="mt-6 text-xs text-brand-gray-500">Error code: 404</p>
      </div>
    </div>
  );
};

export default NotFound;