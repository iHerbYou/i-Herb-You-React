import React, { useState, useEffect } from 'react';
import { createQuestion, type QnaQuestionCreateRequest } from '../lib/qna';
import { useToast } from '../contexts/ToastContext';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  onSuccess: () => void;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setContent('');
      setAgreePrivacy(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      showToast({ message: '제목을 입력해주세요.' });
      return;
    }

    if (!content.trim()) {
      showToast({ message: '내용을 입력해주세요.' });
      return;
    }

    if (!agreePrivacy) {
      showToast({ message: '개인정보 수집 동의가 필요합니다.' });
      return;
    }

    setSubmitting(true);

    try {
      const request: QnaQuestionCreateRequest = {
        productId,
        title: title.trim(),
        content: content.trim(),
      };

      await createQuestion(request);
      showToast({ message: '질문이 등록되었습니다.' });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create question:', error);
      showToast({ message: '질문 등록에 실패했습니다.' });
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
            <h2 className="text-2xl font-bold text-gray-900">질문하기</h2>
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
            {/* Title */}
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="제목을 입력해주세요"
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none"
                placeholder="질문 내용을 입력해주세요"
                maxLength={1000}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {content.length} / 1000
              </div>
            </div>

            {/* Privacy Agreement */}
            <div className="mb-6">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  개인정보 수집 및 이용에 동의합니다. <span className="text-red-500">*</span>
                </span>
              </label>
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
                disabled={submitting || !title.trim() || !content.trim() || !agreePrivacy}
                className="flex-1 px-6 py-3 bg-brand-primary text-white rounded-md hover:bg-brand-primaryDark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                제출하기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AskQuestionModal;
