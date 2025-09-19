import React from 'react';
import { Link } from 'react-router-dom';
import eventImg from '../assets/images/new-customer-event.png';

const EventCoupon: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-gray-900 mb-4">첫 쇼핑 지원 쿠폰 안내</h1>

        <Link to="/signup" className="inline-block">
          <img
            src={eventImg}
            alt="신규 고객 이벤트"
            className="mx-auto w-full max-w-xs sm:max-w-xs rounded-xl shadow-sm mb-6 hover:opacity-95 transition"
          />
        </Link>

        <p className="text-brand-gray-700 mb-6 mx-auto">
          신규 회원님께 드리는 3,000원 할인 쿠폰입니다. 
          <br />
          회원가입 후 첫 주문 시 사용 가능합니다.
        </p>

        <ul className="list-disc pl-5 text-brand-gray-700 space-y-2 mb-8 max-w-xs mx-auto text-left">
          <li>발급 대상: 신규 가입 회원</li>
          <li>쿠폰 금액: 3,000원</li>
          <li>사용 기한: 발급일로부터 7일</li>
          <li>적용 대상: 일부 상품 제외될 수 있음</li>
        </ul>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 bg-brand-pink text-brand-gray-900 px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-pink/80 shadow-sm transition-colors"
          >
            회원가입 하러 가기
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 border border-brand-pink text-brand-pink px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-pink/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            메인으로
          </Link>
        </div>
      </section>
    </div>
  );
};

export default EventCoupon;

