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

// 브랜드 캐시
let cachedBrands: BrandResponse[] | null = null;
let brandsPromise: Promise<BrandResponse[]> | null = null;

// 브랜드 전체 조회 (캐싱 적용)
export async function getAllBrands(): Promise<BrandResponse[]> {
  // 이미 캐시된 데이터가 있으면 반환
  if (cachedBrands !== null) {
    return cachedBrands;
  }

  // 이미 요청 중인 Promise가 있으면 기다림
  if (brandsPromise !== null) {
    return brandsPromise;
  }

  // 새로운 요청 시작
  brandsPromise = get<BrandResponse[]>('/api/catalog/brands', { auth: false })
    .then((brands) => {
      cachedBrands = brands;
      brandsPromise = null;
      return brands;
    })
    .catch((error) => {
      brandsPromise = null;
      throw error;
    });

  return brandsPromise;
}

// 브랜드 캐시 초기화 (필요시 사용)
export function clearBrandsCache(): void {
  cachedBrands = null;
  brandsPromise = null;
}

// 특정 브랜드 상품 조회
export async function getProductsByBrand(brandId: number): Promise<BrandProductResponse[]> {
  return await get<BrandProductResponse[]>(`/api/catalog/brands/${brandId}/products`, { auth: false });
}
