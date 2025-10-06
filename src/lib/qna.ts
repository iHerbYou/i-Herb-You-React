import { get, post, del } from './api';

// ==================== Types ====================

export interface QnaAnswerProduct {
  id: number;
  userEmail: string;
  content: string;
  createdAt: string; // ISO format
}

export interface QnaQuestionProduct {
  id: number;
  productId: number;
  userId: number;
  userEmail: string;
  title: string;
  content: string;
  createdAt: string;
  answers: QnaAnswerProduct[] | null;
  answerCount: number;
}

export interface QnaQuestionCreateRequest {
  productId: number;
  title: string;
  content: string;
}

export interface QnaAnswerCreateRequest {
  questionId: number;
  content: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-based
}

// ==================== API Functions ====================

/**
 * 질문 목록 조회
 */
export async function fetchQuestions(
  productId: number,
  params: {
    page?: number;
    size?: number;
    sort?: string;
    statusValue?: number;
  } = {}
): Promise<PageResponse<QnaQuestionProduct>> {
  const searchParams = new URLSearchParams({
    productId: String(productId),
    page: String(params.page ?? 0),
    size: String(params.size ?? 10),
    sort: params.sort ?? 'createdAt,desc',
  });

  if (params.statusValue !== undefined) {
    searchParams.append('statusValue', String(params.statusValue));
  }

  const url = `/api/qna?${searchParams.toString()}`;
  
  try {
    const result = await get<PageResponse<QnaQuestionProduct>>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[QnA] Failed to fetch questions:', error);
    throw error;
  }
}

/**
 * 질문 등록
 */
export async function createQuestion(
  data: QnaQuestionCreateRequest
): Promise<QnaQuestionProduct> {
  return post<QnaQuestionProduct>('/api/qna', data);
}

/**
 * 질문 삭제
 */
export async function deleteQuestion(questionId: number): Promise<void> {
  return del<void>(`/api/qna/${questionId}`);
}

/**
 * 답변 등록
 */
export async function createAnswer(
  data: QnaAnswerCreateRequest
): Promise<QnaAnswerProduct> {
  return post<QnaAnswerProduct>('/api/qna/answers', data);
}

/**
 * 답변 삭제
 */
export async function deleteAnswer(answerId: number): Promise<void> {
  return del<void>(`/api/qna/answers/${answerId}`);
}
