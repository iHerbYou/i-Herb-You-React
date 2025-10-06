import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchReviews, fetchReviewSummary, type ReviewProduct, type ReviewSummary } from '../lib/reviews';
import { isLoggedIn } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';
import WriteReviewModal from '../components/WriteReviewModal';
import ReportReviewModal from '../components/ReportReviewModal';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function renderStars(rating: number, size: 'sm' | 'lg' = 'sm') {
  const sizeClass = size === 'lg' ? 'text-3xl' : 'text-base';
  return (
    <div className={`flex items-center ${sizeClass}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
          ★
        </span>
      ))}
    </div>
  );
}

const ProductReviews: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : null;
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewProduct[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<number | null>(null);

  const userLoggedIn = isLoggedIn();

  const loadReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await fetchReviews(productId, {
        page,
        size: 10,
        sort: 'createdAt,desc',
      });
      setReviews(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load reviews:', error);
      showToast({ message: '리뷰를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const loadReviewSummary = async () => {
    if (!productId) return;
    try {
      const summaryData = await fetchReviewSummary(productId);
      setSummary(summaryData);
    } catch (error) {
      console.error('Failed to load review summary:', error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, productId]);

  useEffect(() => {
    loadReviewSummary();
  }, [productId]);

  const handleReviewSubmitted = () => {
    setPage(0);
    loadReviews();
    loadReviewSummary();
  };

  const handleReportSubmitted = () => {
    showToast({ message: '신고가 접수되었습니다.' });
  };

  if (!productId) {
    return (
      <div className="min-h-[calc(100vh-124px)] flex items-center justify-center">
        <p className="text-gray-700">잘못된 접근입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-124px)] bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-brand-primary">홈</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <Link to={`/products/${productId}`} className="hover:text-brand-primary">상품 상세</Link>
          <span className="mx-2 text-gray-400">&gt;</span>
          <span className="text-gray-900">고객 구매후기</span>
        </nav>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">고객 구매후기</h1>
            <p className="text-gray-600 mt-2">총 {totalElements}개의 리뷰</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Write Review Button */}
            {userLoggedIn && (
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors"
              >
                구매후기 작성하기
              </button>
            )}
          </div>
        </div>

        {/* Review Summary */}
        {summary && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-gray-900">{summary.average.toFixed(1)}</div>
                {renderStars(Math.round(summary.average), 'lg')}
              </div>
              <div className="text-gray-600">
                <p className="text-lg">총 {summary.totalCount}개의 리뷰</p>
              </div>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">로딩 중...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">아직 등록된 리뷰가 없습니다.</p>
            {userLoggedIn && (
              <button
                onClick={() => setIsWriteModalOpen(true)}
                className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark transition-colors"
              >
                첫 리뷰 작성하기
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    {renderStars(review.rating)}
                    <p className="text-sm text-gray-600 mt-2">
                      {review.nickname} · {formatDate(review.createdAt)}
                    </p>
                  </div>
                  {userLoggedIn && (
                    <button
                      onClick={() => setReportReviewId(review.id)}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      신고하기
                    </button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{review.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              처음
            </button>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              이전
            </button>
            
            {/* Page numbers with ellipsis */}
            {(() => {
              const pages = [];
              const maxVisiblePages = 5; // Show up to 5 page numbers
              
              let startPage = Math.max(0, page - 2);
              let endPage = Math.min(totalPages - 1, page + 2);
              
              // Adjust if we're near the start
              if (page < 2) {
                endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
              }
              
              // Adjust if we're near the end
              if (page > totalPages - 3) {
                startPage = Math.max(0, totalPages - maxVisiblePages);
              }
              
              // Show first page and ellipsis if needed
              if (startPage > 0) {
                pages.push(
                  <button
                    key={0}
                    onClick={() => setPage(0)}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    1
                  </button>
                );
                if (startPage > 1) {
                  pages.push(<span key="ellipsis-start" className="px-2">...</span>);
                }
              }
              
              // Show page numbers
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 border rounded-md font-medium transition-colors ${
                      page === i
                        ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }
              
              // Show ellipsis and last page if needed
              if (endPage < totalPages - 1) {
                if (endPage < totalPages - 2) {
                  pages.push(<span key="ellipsis-end" className="px-2">...</span>);
                }
                pages.push(
                  <button
                    key={totalPages - 1}
                    onClick={() => setPage(totalPages - 1)}
                    className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {totalPages}
                  </button>
                );
              }
              
              return pages;
            })()}
            
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              다음
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page === totalPages - 1}
              className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              마지막
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {isWriteModalOpen && (
        <WriteReviewModal
          isOpen={isWriteModalOpen}
          productId={productId}
          onClose={() => setIsWriteModalOpen(false)}
          onSuccess={handleReviewSubmitted}
        />
      )}
      {reportReviewId && (
        <ReportReviewModal
          isOpen={true}
          reviewId={reportReviewId}
          onClose={() => setReportReviewId(null)}
          onSuccess={handleReportSubmitted}
        />
      )}
    </div>
  );
};

export default ProductReviews;
