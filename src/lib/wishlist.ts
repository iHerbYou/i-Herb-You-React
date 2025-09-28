import type { Product } from '../data/products';
import { get, post, del } from './api';

const KEY = 'wishlist:v1';
const MAX_ITEMS = 20;

export type WishlistItem = Pick<Product, 'id' | 'name' | 'image'> & {
  price?: number;
  addedAt: number;
};

function read(): WishlistItem[] {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(KEY, JSON.stringify(items));
    }
  } catch {}
}

export function getWishlist(): WishlistItem[] {
  return read();
}

export function isInWishlist(productId: number): boolean {
  return read().some(i => i.id === productId);
}

export function addToWishlist(product: Product): { added: boolean; reason?: 'exists' | 'capacity' } {
  const items = read();
  if (items.some(i => i.id === product.id)) {
    return { added: false, reason: 'exists' };
  }
  if (items.length >= MAX_ITEMS) {
    return { added: false, reason: 'capacity' };
  }
  const toSave: WishlistItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    addedAt: Date.now(),
  };
  const next = [...items, toSave];
  write(next);
  return { added: true };
}

export function removeFromWishlist(productId: number) {
  const next = read().filter(i => i.id !== productId);
  write(next);
}

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
};

export type DeleteItemsRequest = { userId: number; itemIds: number[] };
export type DeleteItemsResponse = { deletedCount: number; message: string };

export async function apiFetchWishlist(userId: number): Promise<WishlistItemResponse[]> {
  const res = await get<WishlistPageResponse>(`/api/wishlist?userId=${encodeURIComponent(String(userId))}`, { credentials: 'include' });
  return Array.isArray(res.items) ? res.items : [];
}

export async function apiAddWishlist(userId: number, productId: number): Promise<AddWishlistItemResponse> {
  return await post<AddWishlistItemResponse>(`/api/wishlist?userId=${encodeURIComponent(String(userId))}&productId=${encodeURIComponent(String(productId))}`, undefined, { credentials: 'include' });
}

export async function apiDeleteWishlistItems(userId: number, itemIds: number[]): Promise<DeleteItemsResponse> {
  const body: DeleteItemsRequest = { userId, itemIds };
  return await del<DeleteItemsResponse>(`/api/wishlist/items`, { credentials: 'include', body });
}

export function getCurrentUserId(): number | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem('auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const id = parsed?.id ?? parsed?.userId;
    if (typeof id === 'number') return id;
    if (typeof id === 'string' && id.trim() !== '' && !isNaN(Number(id))) return Number(id);
    return null;
  } catch {
    return null;
  }
}

