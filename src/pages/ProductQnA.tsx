import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { products as allProducts } from '../data/products';

interface QAItem {
  id: number;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  answer?: { body: string; createdAt: string };
}

const mockQAs: QAItem[] = [
  { id: 1, title: '복용 시간은 언제가 좋나요?', body: '아침 공복에 먹어도 되나요?', author: '건강러버', createdAt: '2025-09-18', answer: { body: '식후 30분 이내 복용을 권장드립니다.', createdAt: '2025-09-19' } },
  { id: 2, title: '임산부도 섭취 가능한가요?', body: '성분에 카페인이 포함되어 있나요?', author: '예비맘', createdAt: '2025-09-16' },
];

const ProductQnA: React.FC = () => {
  const { id } = useParams();
  const product = useMemo(() => allProducts.find(p => String(p.id) === id), [id]);

  if (!product) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <p className="text-brand-gray-700">존재하지 않는 상품입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="text-sm text-brand-gray-600 mb-4">
          <Link to="/" className="hover:text-brand-pink">홈</Link>
          <span className="mx-2 text-brand-gray-400">&gt;</span>
          <Link to={`/p/${product.id}`} className="hover:text-brand-pink">{product.name}</Link>
          <span className="mx-2 text-brand-gray-400">&gt;</span>
          <span className="text-brand-gray-900">질문 & 답변</span>
        </nav>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-brand-gray-900">질문 & 답변</h1>
          <Link to={`/p/${product.id}#qa`} className="text-sm text-brand-green hover:text-brand-darkGreen">상품 상세로 돌아가기</Link>
        </div>

        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm text-brand-gray-700">정렬</label>
          <select className="border border-gray-300 rounded-md px-2 py-1 text-sm">
            <option>최신순</option>
          </select>
        </div>

        <div className="space-y-3">
          {mockQAs.map(q => (
            <div key={q.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-brand-gray-900">{q.title}</p>
                  <p className="text-sm text-brand-gray-700 mt-1 whitespace-pre-wrap">{q.body}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-brand-gray-500">
                    <div className="w-5 h-5 rounded-full bg-brand-gray-200 flex items-center justify-center text-[10px] text-brand-gray-700">
                      {q.author.slice(0,1).toUpperCase()}
                    </div>
                    <span>{q.author}</span>
                    <span>·</span>
                    <span>{q.createdAt}</span>
                  </div>
                </div>
              </div>
              {q.answer && (
                <div className="mt-3 rounded-md bg-brand-gray-100 p-3 text-sm">
                  <p className="text-brand-gray-900 font-medium mb-1">답변</p>
                  <p className="text-brand-gray-700 whitespace-pre-wrap">{q.answer.body}</p>
                  <p className="text-xs text-brand-gray-500 mt-1">{q.answer.createdAt}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductQnA;