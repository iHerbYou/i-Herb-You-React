import { get } from './api';

export type ProductListDto = {
  id: number;
  name: string;
  brandName: string;
  thumbnailUrl: string | null;
  minPrice: number;
  avgRating: number;
  reviewCount: number;
  sales: number;
  soldOut: boolean;
  productVariantId: number;  // 기본 variant ID
};

export type SearchResultPage = {
  content: ProductListDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
};

export type SuggestionCategory = {
  id: number;
  name: string;
  path: string;
};

export type SuggestionProduct = {
  id: number;
  name: string;
  brandName: string;
};

export type SuggestionResponse = {
  categories: SuggestionCategory[];
  products: SuggestionProduct[];
  redirectCategoryId: number | null;
};

export async function searchProducts(
  query: string,
  page: number = 1,
  size: number = 20,
  sort: string = 'sales'
): Promise<SearchResultPage> {
  const params = new URLSearchParams({
    query: query,
    page: String(page),
    size: String(size),
    sort: sort,
  });
  
  return await get<SearchResultPage>(`/api/catalog/search?${params.toString()}`, { auth: false });
}

export async function getSuggestions(query: string): Promise<SuggestionResponse> {
  const params = new URLSearchParams({ query });
  return await get<SuggestionResponse>(`/api/catalog/search/suggestions?${params.toString()}`, { auth: false });
}

