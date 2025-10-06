import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchReviews, fetchReviewSummary, type ReviewProduct, type ReviewSummary } from '../lib/reviews';
import { isLoggedIn } from '../lib/auth';
import { useToast } from '../contexts/ToastContext';
import WriteReviewModal from './WriteReviewModal';
import ReportReviewModal from './ReportReviewModal';

interface ProductReviewSectionProps {
  productId: number;
  onSummaryLoad?: (summary: ReviewSummary) => void;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

function renderStars(rating: number, size: 'sm' | 'lg' = 'sm') {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  const roundedRating = Math.round(rating * 10) / 10; // 소수점 한자리로 반올림
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercentage = Math.max(0, Math.min(1, roundedRating - starIndex + 1)) * 100;
        const starId = `star-${size}-${starIndex}-${roundedRating}`;
        
        return (
          <svg
            key={starIndex}
            className={sizeClass}
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id={starId}>
                <stop offset={`${fillPercentage}%`} stopColor="#FBBF24" />
                <stop offset={`${fillPercentage}%`} stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill={`url(#${starId})`}
            />
          </svg>
        );
      })}
    </div>
  );
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId, onSummaryLoad }) => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewProduct[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [reportReviewId, setReportReviewId] = useState<number | null>(null);

  const { showToast } = useToast();
  const userLoggedIn = isLoggedIn();

  const handleViewAll = () => {
    navigate(`/products/${productId}/reviews`);
  };

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await fetchReviews(productId, {
        page,
        size: 10,
        sort: 'createdAt,desc',
      });
      setReviews(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
      showToast({ message: '리뷰 목록을 불러오는 데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await fetchReviewSummary(productId);
      setSummary(data);
      // Call parent callback if provided
      if (onSummaryLoad) {
        onSummaryLoad(data);
      }
    } catch (error) {
      console.error('Failed to fetch review summary:', error);
    }
  };

  useEffect(() => {
    loadReviews();
    loadSummary();
  }, [productId, page]);

  return (
    <div className="py-8 border-t border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">고객 구매후기</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={handleViewAll}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:text-brand-green transition-colors"
          >
            구매후기 전체보기
          </button>
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
        <div className="mb-8 p-6 bg-gray-50 rounded-lg flex items-center gap-8">
          <div className="text-center">
            <div className="text-5xl font-bold text-brand-primary mb-2">
              {summary.average.toFixed(1)}
            </div>
            {renderStars(summary.average, 'lg')}
          </div>
          <div className="border-l border-gray-300 pl-8">
            <p className="text-gray-600">
              총 <span className="font-semibold text-gray-900">{summary.totalCount}개</span>의 리뷰
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">로딩 중...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          아직 등록된 리뷰가 없습니다.
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-6">
              {/* Review Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  {renderStars(review.rating)}
                  <span className="text-sm text-gray-500">
                    {review.nickname} · {formatDate(review.createdAt)}
                  </span>
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

              {/* Review Text */}
              <p className="text-gray-700 whitespace-pre-wrap">{review.text}</p>
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

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        productId={productId}
        onSuccess={() => {
          setPage(0);
          loadReviews();
          loadSummary();
        }}
      />

      {/* Report Review Modal */}
      {reportReviewId !== null && (
        <ReportReviewModal
          isOpen={true}
          onClose={() => setReportReviewId(null)}
          reviewId={reportReviewId}
          onSuccess={() => {
            // No need to reload, just close
          }}
        />
      )}
    </div>
  );
};

export default ProductReviewSection;
