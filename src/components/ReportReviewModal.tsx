import React, { useState, useEffect } from 'react';
import { reportReview, type ReviewReportRequest } from '../lib/reviews';
import { useToast } from '../contexts/ToastContext';

interface ReportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  reviewId: number;
  onSuccess: () => void;
}

const REPORT_REASONS = [
  { id: 1, label: '이 콘텐츠에는 비속어가 포함되어 있습니다.' },
  { id: 2, label: '이 콘텐츠에 부적절한 미디어가 있습니다.' },
  { id: 3, label: '이 콘텐츠는 수준이 낮거나 스팸입니다.' },
  { id: 4, label: '이 콘텐츠에는 의학적 조언이 포함되어 있습니다.' },
  { id: 5, label: '이 콘텐츠에는 리워드 코드 또는 할인코드가 포함되어 있습니다.' },
  { id: 6, label: '기타 - 여기에 이유를 써주세요.' },
];

const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  isOpen,
  onClose,
  reviewId,
  onSuccess,
}) => {
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [otherReason, setOtherReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedReasonId(null);
      setOtherReason('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedReasonId === null) {
      showToast({ message: '신고 사유를 선택해주세요.' });
      return;
    }

    if (selectedReasonId === 6 && !otherReason.trim()) {
      showToast({ message: '기타 사유를 작성해주세요.' });
      return;
    }

    setSubmitting(true);

    try {
      const request: ReviewReportRequest = {
        reviewId,
        reasonCodeId: selectedReasonId,
      };

      await reportReview(request);
      showToast({ message: '신고가 접수되었습니다.' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to report review:', error);
      showToast({ message: '신고 접수에 실패했습니다.' });
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">신고하기</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              aria-label="닫기"
            >
              ×
            </button>
          </div>

          {/* Description */}
          <p className="text-gray-600 mb-6">
            이 콘텐츠가 부적절하다고 판단되어 삭제되어야 한다고 생각되면 아래 내용을 확인하여 알려주세요.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Report Reasons */}
            <div className="mb-6 space-y-3">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason.id}
                  className="flex items-start cursor-pointer p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={reason.id}
                    checked={selectedReasonId === reason.id}
                    onChange={() => setSelectedReasonId(reason.id)}
                    className="mt-1 h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                  />
                  <span className="ml-3 text-gray-700">{reason.label}</span>
                </label>
              ))}
            </div>

            {/* Other Reason Text */}
            {selectedReasonId === 6 && (
              <div className="mb-6">
                <label htmlFor="otherReason" className="block text-sm font-medium text-gray-700 mb-2">
                  기타 사유 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="otherReason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                  placeholder="신고 사유를 자세히 작성해주세요"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500 mt-1">
                  {otherReason.length} / 500
                </div>
              </div>
            )}

            {/* Info */}
            <div className="mb-6 p-4 bg-yellow-50 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ 허위 신고 시 제재를 받을 수 있습니다. 신중하게 신고해주세요.
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
                disabled={
                  submitting ||
                  selectedReasonId === null ||
                  (selectedReasonId === 6 && !otherReason.trim())
                }
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '신고 중...' : '신고하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportReviewModal;
