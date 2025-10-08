import React, { useState, useEffect } from 'react';
import { createReview, type ReviewCreateRequest } from '../lib/reviews';
import { useToast } from '../contexts/ToastContext';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: () => void;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setText('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      showToast({ message: '별점을 선택해주세요.' });
      return;
    }

    if (text.trim().length < 5) {
      showToast({ message: '리뷰는 최소 5글자 이상 작성해주세요.' });
      return;
    }

    if (text.trim().length > 1000) {
      showToast({ message: '리뷰는 최대 1000글자까지 작성 가능합니다.' });
      return;
    }

    setSubmitting(true);

    try {
      const request: ReviewCreateRequest = {
        productId,
        rating,
        text: text.trim(),
      };

      await createReview(request);
      showToast({ message: '리뷰가 등록되었습니다.' });
      onSuccess();
      onClose();
    } catch (error) {
      showToast({ message: '리뷰 등록에 실패했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">구매후기 작성하기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                별점 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="text-4xl focus:outline-none transition-colors"
                  >
                    <span
                      className={
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
                <span className="ml-3 text-lg text-gray-700">
                  {rating > 0 ? `${rating}점` : ''}
                </span>
              </div>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <label htmlFor="reviewText" className="block text-sm font-medium text-gray-700 mb-2">
                리뷰 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reviewText"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                placeholder="상품에 대한 리뷰를 작성해주세요 (최소 5자 이상)"
                maxLength={1000}
              />
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">최소 5글자 / 최대 1000글자</span>
                <span className={text.length < 5 ? 'text-red-500' : 'text-gray-500'}>
                  {text.length} / 1000
                </span>
              </div>
            </div>

            {/* Info Note */}
            <div className="mb-6 p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                💡 실제 구매하신 상품에 대한 솔직한 후기를 남겨주세요. 타인의 권리를 침해하거나 부적절한 내용은 관리자에 의해 삭제될 수 있습니다.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0 || text.trim().length < 5}
                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '등록 중...' : '제출하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WriteReviewModal;
