import { get, post } from './api';

// ==================== Types ====================

export interface ReviewProduct {
  id: number;
  rating: number;
  text: string;
  nickname: string;
  createdAt: string;
}

export interface ReviewSummary {
  totalCount: number;
  average: number;
}

export interface ReviewCreateRequest {
  productId: number;
  rating: number; // 1-5
  text: string; // 최소 5글자, 최대 1000글자
}

export interface ReviewReportRequest {
  reviewId: number;
  reasonCodeId: number; // 1-6
}

export interface ReviewReportProduct {
  id: number;
  reviewId: number;
  userId: number;
  reasonCodeId: number;
  createdAt: string;
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
 * 리뷰 목록 조회 (public)
 */
export async function fetchReviews(
  productId: number,
  params: {
    page?: number;
    size?: number;
    sort?: string;
  } = {}
): Promise<PageResponse<ReviewProduct>> {
  const searchParams = new URLSearchParams({
    productId: String(productId),
    page: String(params.page ?? 0),
    size: String(params.size ?? 10),
    sort: params.sort ?? 'createdAt,desc',
  });

  const url = `/api/reviews?${searchParams.toString()}`;
  
  try {
    const result = await get<PageResponse<ReviewProduct>>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Review] Failed to fetch reviews:', error);
    throw error;
  }
}

/**
 * 리뷰 통계 조회 (public)
 */
export async function fetchReviewSummary(productId: number): Promise<ReviewSummary> {
  const url = `/api/reviews/summary?productId=${productId}`;
  try {
    const result = await get<ReviewSummary>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Review] Failed to fetch summary:', error);
    throw error;
  }
}

/**
 * 리뷰 작성
 */
export async function createReview(data: ReviewCreateRequest): Promise<ReviewProduct> {
  return post<ReviewProduct>('/api/reviews', data);
}

/**
 * 리뷰 신고
 */
export async function reportReview(data: ReviewReportRequest): Promise<ReviewReportProduct> {
  return post<ReviewReportProduct>('/api/review-reports', data);
}
