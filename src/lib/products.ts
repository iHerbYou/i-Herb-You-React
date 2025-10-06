import { get } from './api';

// Shared DTO shapes to mirror backend
export interface ProductListDto {
  id: number;
  name: string;
  brandName: string;
  thumbnailUrl: string;
  minPrice: number;
  avgRating: number;
  reviewCount: number;
  sales: number;
  soldOut: boolean;
}

export interface SortStateDto { empty: boolean; sorted: boolean; unsorted: boolean }
export interface PageableDto {
  offset: number;
  sort: SortStateDto;
  paged: boolean;
  pageNumber: number; // zero-based on backend Page object
  pageSize: number;
  unpaged: boolean;
}

export interface PageResponseDto<T> {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: T[];
  number: number; // zero-based page index
  sort: SortStateDto;
  pageable: PageableDto;
  numberOfElements: number;
  empty: boolean;
}

export interface ProductDetailDto {
  id: number;
  name: string;
  brandId: number;
  brandName: string;
  categories: string[];
  avgRating: number;
  reviewCount: number;
  code: string;
  expirationDate?: number;
  saleStartDate?: string;
  images: Array<{ url: string; isPrimary: boolean }>; // backend field is isPrimary
  variants: Array<{
    id: number;
    variantName: string;
    listPrice: number;
    salePrice: number;
    stock: number;
    soldOut: boolean;
    upcCode: string;
    restockEta?: string;
    restockSubscriptionEnabled?: boolean;
  }>;
  description?: string;
  instruction?: string;
  ingredients?: string;
  cautions?: string;
  disclaimer?: string;
  nutritionFacts?: string;
  pillSize?: string;
}

// List API (public)
export async function fetchProductList(params: {
  page?: number; // 1-based
  size?: number;
  excludeSoldOut?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
  sort?: 'sales' | 'rating' | 'reviews' | 'price' | 'id';
  direction?: 'asc' | 'desc';
}): Promise<PageResponseDto<ProductListDto>> {
  const query = new URLSearchParams();
  if (params.page != null) query.set('page', String(params.page));
  if (params.size != null) query.set('size', String(params.size));
  if (params.excludeSoldOut != null) query.set('excludeSoldOut', String(params.excludeSoldOut));
  if (params.minPrice != null) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice != null) query.set('maxPrice', String(params.maxPrice));
  if (params.categoryId != null) query.set('categoryId', String(params.categoryId));
  if (params.sort) query.set('sort', params.sort);
  if (params.direction) query.set('direction', params.direction);
  
  const url = `/api/catalog/products?${query.toString()}`;
  
  try {
    const result = await get<PageResponseDto<ProductListDto>>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Product] Failed to fetch product list:', error);
    throw error;
  }
}

// Detail API (public)
export async function fetchProductDetail(id: number): Promise<ProductDetailDto> {
  const url = `/api/catalog/products/${id}`;
  try {
    const result = await get<ProductDetailDto>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Product] Failed to fetch product detail:', error);
    throw error;
  }
}

// Home sections (public)
export async function fetchBestsellers(params?: { categoryId?: number; size?: number }): Promise<ProductListDto[]> {
  const query = new URLSearchParams();
  if (params?.categoryId != null) query.set('categoryId', String(params.categoryId));
  if (params?.size != null) query.set('size', String(params.size));
  const qs = query.toString();
  const url = `/api/catalog/products/bestsellers${qs ? `?${qs}` : ''}`;
  
  try {
    const result = await get<ProductListDto[]>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Product] Failed to fetch bestsellers:', error);
    throw error;
  }
}

export async function fetchNewProducts(params?: { size?: number }): Promise<ProductListDto[]> {
  const query = new URLSearchParams();
  if (params?.size != null) query.set('size', String(params.size));
  const qs = query.toString();
  const url = `/api/catalog/products/new${qs ? `?${qs}` : ''}`;
  
  try {
    const result = await get<ProductListDto[]>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Product] Failed to fetch new products:', error);
    throw error;
  }
}

export async function fetchTopRated(params?: { size?: number }): Promise<ProductListDto[]> {
  const query = new URLSearchParams();
  if (params?.size != null) query.set('size', String(params.size));
  const qs = query.toString();
  const url = `/api/catalog/products/top-rated${qs ? `?${qs}` : ''}`;
  
  try {
    const result = await get<ProductListDto[]>(url, { auth: false });
    return result;
  } catch (error) {
    console.error('[Product] Failed to fetch top-rated:', error);
    throw error;
  }
}

