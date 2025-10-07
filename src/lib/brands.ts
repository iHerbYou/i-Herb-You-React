import { get } from './api';

export type BrandResponse = {
  id: number;
  name: string;
  productCount: number;
  thumbnailUrl: string | null;
};

export type BrandProductResponse = {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviewCount: number;
  thumbnailUrl: string;
};

// 브랜드 전체 조회
export async function getAllBrands(): Promise<BrandResponse[]> {
  return await get<BrandResponse[]>('/api/catalog/brands', { auth: false });
}

// 특정 브랜드 상품 조회
export async function getProductsByBrand(brandId: number): Promise<BrandProductResponse[]> {
  return await get<BrandProductResponse[]>(`/api/catalog/brands/${brandId}/products`, { auth: false });
}
