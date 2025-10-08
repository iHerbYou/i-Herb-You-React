import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchQuestions, deleteQuestion, type QnaQuestionProduct } from '../lib/qna';
import { isLoggedIn } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';
import AskQuestionModal from './AskQuestionModal';

interface ProductQnASectionProps {
  productId: number;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function maskNickname(input: string): string {
  const local = input.includes('@') ? input.split('@')[0] : input;
  if (local.length <= 4) return local + "**";
  return local.slice(0, 4) + '*'.repeat(local.length - 4);
}

const ProductQnASection: React.FC<ProductQnASectionProps> = ({ productId }) => {
  const [questions, setQuestions] = useState<QnaQuestionProduct[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt,desc');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useToast();
  const userLoggedIn = isLoggedIn();

  const getAuth = () => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem('auth') : null;
      if (!raw) return { nickname: 'guest', email: '', role: 'user', loggedIn: false } as const;
      const parsed = JSON.parse(raw);
      return { 
        nickname: parsed?.nickname ?? 'guest', 
        email: parsed?.email ?? '', 
        role: parsed?.role ?? 'user', 
        loggedIn: true 
      } as const;
    } catch {
      return { nickname: 'guest', email: '', role: 'user', loggedIn: false } as const;
    }
  };

  const canDeleteQuestion = (authorEmail: string) => {
    const { email, role } = getAuth();
    return role === 'admin' || email === authorEmail;
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetchQuestions(productId, {
        page,
        size: 10,
        sort: sortBy,
      });
      setQuestions(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      showToast({ message: '질문 목록을 불러오는 데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuestions();
  }, [productId, page, sortBy]);

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('정말 이 질문을 삭제하시겠습니까?')) return;

    try {
      await deleteQuestion(questionId);
      showToast({ message: '질문이 삭제되었습니다.' });
      loadQuestions();
    } catch (error) {
      showToast({ message: '질문 삭제에 실패했습니다.' });
    }
  };

  const toggleAnswers = (questionId: number) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleViewAll = () => {
    navigate(`/products/${productId}/qna`);
  };

  return (
    <div className="py-8 border-t border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">질문 & 답변</h2>
        <div className="flex items-center gap-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(0);
            }}
            className="pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:border-transparent appearance-none bg-white cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23374151' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
            }}
            aria-label="정렬 기준 선택"
          >
            <option value="createdAt,desc">최신순</option>
            <option value="createdAt,asc">오래된 순</option>
          </select>

          {/* Ask Question Button */}
          {userLoggedIn && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors"
            >
              질문하기
            </button>
          )}
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          아직 등록된 질문이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-6">
              {/* Question Header */}
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{question.title}</h3>
                {canDeleteQuestion(question.userEmail) && (
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* Question Content */}
              <p className="text-gray-700 mb-3 whitespace-pre-wrap">{question.content}</p>

              {/* Question Meta */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <span>작성자: {maskNickname(question.userEmail)}</span>
                <span>{formatDate(question.createdAt)}</span>
              </div>

              {/* Answer Count & Toggle */}
              {question.answerCount > 0 && (
                <div>
                  <button
                    onClick={() => toggleAnswers(question.id)}
                    className="flex items-center gap-2 text-brand-primary hover:text-brand-primaryDark font-medium"
                  >
                    <span>답변 {question.answerCount}개</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        expandedQuestions.has(question.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Answers */}
                  {expandedQuestions.has(question.id) && question.answers && (
                    <div className="mt-4 space-y-3 pl-6 border-l-4 border-brand-primary">
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="bg-gray-50 p-4 rounded-md">
                          <p className="text-gray-700 mb-2 whitespace-pre-wrap">{answer.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>작성자: {maskNickname(answer.userEmail)}</span>
                            <span>{formatDate(answer.createdAt)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <span className="px-4 py-2 text-gray-700">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      )}

      {/* View All Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleViewAll}
          className="px-8 py-3 border border-brand-primary text-brand-primary rounded-md hover:text-brand-green transition-colors"
        >
          질문&답변 전체보기
        </button>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productId={productId}
        onSuccess={() => {
          setPage(0);
          loadQuestions();
        }}
      />
    </div>
  );
};

export default ProductQnASection;
