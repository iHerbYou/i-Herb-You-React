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

// List API
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
  return await get<PageResponseDto<ProductListDto>>(`/api/catalog/products?${query.toString()}`);
}

// Detail API
export async function fetchProductDetail(id: number): Promise<ProductDetailDto> {
  return await get<ProductDetailDto>(`/api/catalog/products/${id}`);
}

// Home sections
export async function fetchBestsellers(params?: { categoryId?: number; size?: number }): Promise<ProductListDto[]> {
  const query = new URLSearchParams();
  if (params?.categoryId != null) query.set('categoryId', String(params.categoryId));
  if (params?.size != null) query.set('size', String(params.size));
  const qs = query.toString();
  return await get<ProductListDto[]>(`/api/catalog/products/bestsellers${qs ? `?${qs}` : ''}`);
}

export async function fetchNewProducts(params?: { size?: number }): Promise<ProductListDto[]> {
  const query = new URLSearchParams();
  if (params?.size != null) query.set('size', String(params.size));
  const qs = query.toString();
  return await get<ProductListDto[]>(`/api/catalog/products/new${qs ? `?${qs}` : ''}`);
}

export async function fetchTopRated(params?: { size?: number }): Promise<ProductListDto[]> {
  const query = new URLSearchParams();
  if (params?.size != null) query.set('size', String(params.size));
  const qs = query.toString();
  return await get<ProductListDto[]>(`/api/catalog/products/top-rated${qs ? `?${qs}` : ''}`);
}

