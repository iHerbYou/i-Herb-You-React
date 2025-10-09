import { get, post, del } from './api';

// -----------------------------
// Backend API DTOs and helpers
// -----------------------------
export type WishlistItemResponse = {
  itemId: number;
  productId: number;
  productName: string;
  thumbnailUrl: string;
  createdAt: string;
};

export type WishlistPageResponse = {
  items: WishlistItemResponse[];
  count: number;
};

export type AddWishlistItemResponse = {
  itemId: number | null;
  duplicated: boolean;
  message: string;
};

export type DeleteItemsRequest = { itemIds: number[] };
export type DeleteItemsResponse = { deletedCount: number; message: string };

// 공유된 위시리스트 응답 DTO
export interface SharedWishlistResponse {
  shareId: string;
  readonly: boolean;
  createdAt: string;
  expiresAt: string;
  wishlist: {
    items: Array<{
      itemId: number;
      productId: number;
      productName: string;
      thumbnailUrl: string;
      createdAt: string;
    }>;
    count: number;
  };
}

// 위시리스트 공유 생성 응답 DTO
export interface ShareWishlistResponse {
  shareId: string;
  shortUrl: string;
  expiresAt: string;
}

export async function apiFetchWishlist(): Promise<WishlistItemResponse[]> {
  const res = await get<WishlistPageResponse>('/api/wishlist');
  return Array.isArray(res.items) ? res.items : [];
}

export async function apiAddWishlist(productId: number): Promise<AddWishlistItemResponse> {
  return await post<AddWishlistItemResponse>(`/api/wishlist?productId=${encodeURIComponent(String(productId))}`);
}

export async function apiDeleteWishlistItems(itemIds: number[]): Promise<DeleteItemsResponse> {
  const body: DeleteItemsRequest = { itemIds };
  return await del<DeleteItemsResponse>('/api/wishlist/items', body);
}

// 위시리스트 공유 생성
export async function apiCreateWishlistShare(): Promise<ShareWishlistResponse> {
  return await post<ShareWishlistResponse>('/api/wishlist/share');
}

// 공유된 위시리스트 조회 (public)
export async function apiGetSharedWishlist(shareId: string): Promise<SharedWishlistResponse> {
  return await get<SharedWishlistResponse>(`/api/wishlist/share/${shareId}`, { auth: false });
}