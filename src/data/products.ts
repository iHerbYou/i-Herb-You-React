export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  isBest?: boolean;
  isExclusive?: boolean;
  isPremium?: boolean;
  rating?: number; // 0~5
  reviewCount?: number; // number of reviews
  image: string;
  productVariantId?: number; // 기본 variant ID (API 데이터에서만 사용)
}

export const products: Product[] = [
  {
    id: 1,
    name: "비봇 내추럴 프로틴 바",
    price: 20000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.5,
    reviewCount: 128,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/215b67d8800ede97a2a3fdee95d3a8ea.jpg"
  },
  {
    id: 2,
    name: "액티브엣 오렌지 다이어트 보조제",
    price: 35000,
    category: "영양제",
    isBest: true,
    isExclusive: true,
    rating: 4.2,
    reviewCount: 86,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/3bec1ce45301ead6c688a85f57c8dc7d.jpg"
  },
  {
    id: 3,
    name: "엘리피트 에너지 푸드믹스",
    price: 25000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.0,
    reviewCount: 45,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/523932a5c5e7210759793a4d9d14a75e.jpg"
  },
  {
    id: 4,
    name: "헤르바이츠 베리그래놀라볼",
    price: 15000,
    category: "영양제",
    isBest: true,
    rating: 4.8,
    reviewCount: 203,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/673b98b471baf11002e5bab36503c51c.jpg"
  },
  {
    id: 5,
    name: "헬시퍼펙트 프로틴 파우더",
    price: 25000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.3,
    reviewCount: 59,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/77eb854fdaeb25d9ce1e721d33de36f8.jpg"
  },
  {
    id: 6,
    name: "헬시핏 리플레이스먼트 쉐이크",
    price: 25000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.1,
    reviewCount: 37,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/9cbb7df27c878dcaa0c2f1f40478fc6b.jpg"
  },
  {
    id: 7,
    name: "헬씨엣 멀티 건강 파우더",
    price: 25000,
    category: "영양제",
    isExclusive: true,
    rating: 4.6,
    reviewCount: 142,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/9f4a5198463132562a84f88d94bf4e59.jpg"
  },
  {
    id: 8,
    name: "액티브릿 그린 밸런스 쉐이크",
    price: 24000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.0,
    reviewCount: 21,
    image: "https://ecimg.cafe24img.com/pg2205b12386875045/sojjung3/web/product/medium/20250906/b1db6f8b9b3265807603f0236e5f05ae.jpg"
  },
  {
    id: 9,
    name: "액티브핏 그린 헬시 쉐이크",
    price: 25000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.4,
    reviewCount: 73,
    image: "/images/b864aeace600d99ee6b4b23c8fce5c46.jpg"
  },
  {
    id: 10,
    name: "헬시엣 핑크 하이드레이션 믹스",
    price: 28000,
    category: "뷰티",
    isExclusive: true,
    rating: 4.2,
    reviewCount: 65,
    image: "/images/ba076ba8dc27cd49d1200ace2a3a1b8d.jpg"
  },
  {
    id: 11,
    name: "액티브핏 퍼플 쉐이크",
    price: 15000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.1,
    reviewCount: 18,
    image: "/images/c15ad09850349c88123e222b101d6e58.jpg"
  },
  {
    id: 12,
    name: "헬씨데이 수분충전 믹스",
    price: 15000,
    category: "뷰티",
    isExclusive: true,
    rating: 4.0,
    reviewCount: 12,
    image: "/images/ca30d9596a9ef11bd8084a538fedefd3.jpg"
  },
  {
    id: 13,
    name: "액티브핏 핑크 다이어트 쉐이크",
    price: 12000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.3,
    reviewCount: 39,
    image: "/images/d01e3df9cea446dedc4748c6b835f073.jpg"
  },
  {
    id: 14,
    name: "헬시엣 오트밀 하이드레이션 믹스",
    price: 35000,
    category: "뷰티",
    isExclusive: true,
    rating: 4.5,
    reviewCount: 91,
    image: "/images/e112d84251661d572454e7e00d4889de.jpg"
  },
  {
    id: 15,
    name: "액티브플러스 수분충전 이온믹스",
    price: 15000,
    category: "영양제",
    isExclusive: true,
    rating: 3.9,
    reviewCount: 27,
    image: "/images/f45a1bd8675ca4b292ac38027f3e1336.jpg"
  },
  {
    id: 16,
    name: "헬씨나잇 오렌지 주스",
    price: 7000,
    category: "스포츠",
    isExclusive: true,
    rating: 4.2,
    reviewCount: 44,
    image: "/images/f4ae363f5d361ad62a6c06ed0dde9cfd.jpg"
  },
  {
    id: 17,
    name: "프리미엄 프로틴 파우더",
    price: 45000,
    category: "스포츠",
    isPremium: true,
    rating: 4.7,
    reviewCount: 310,
    image: "/images/215b67d8800ede97a2a3fdee95d3a8ea.jpg"
  },
  {
    id: 18,
    name: "프리미엄 비타민 컴플렉스",
    price: 38000,
    category: "영양제",
    isPremium: true,
    rating: 4.6,
    reviewCount: 204,
    image: "/images/3bec1ce45301ead6c688a85f57c8dc7d.jpg"
  },
  {
    id: 19,
    name: "메가 비타민 데일리팩",
    price: 36000,
    category: "영양제",
    isBest: true,
    rating: 4.5,
    reviewCount: 187,
    image: "/images/3bec1ce45301ead6c688a85f57c8dc7d.jpg"
  },
  {
    id: 20,
    name: "프로바이오틱스 플러스",
    price: 28000,
    category: "영양제",
    rating: 4.3,
    reviewCount: 92,
    image: "/images/215b67d8800ede97a2a3fdee95d3a8ea.jpg"
  },
  {
    id: 21,
    name: "스포츠 리커버리 BCAA",
    price: 22000,
    category: "스포츠",
    rating: 4.2,
    reviewCount: 74,
    image: "/images/b1db6f8b9b3265807603f0236e5f05ae.jpg"
  },
  {
    id: 22,
    name: "하이퍼 포커스 프리워크아웃",
    price: 27000,
    category: "스포츠",
    rating: 4.1,
    reviewCount: 53,
    image: "/images/9f4a5198463132562a84f88d94bf4e59.jpg"
  },
  {
    id: 23,
    name: "뷰티 콜라겐 펩타이드 파우더",
    price: 32000,
    category: "뷰티",
    isExclusive: true,
    rating: 4.4,
    reviewCount: 88,
    image: "/images/ba076ba8dc27cd49d1200ace2a3a1b8d.jpg"
  },
  {
    id: 24,
    name: "하이드라 글로우 히알루론 캡슐",
    price: 34000,
    category: "뷰티",
    rating: 4.6,
    reviewCount: 132,
    image: "/images/ca30d9596a9ef11bd8084a538fedefd3.jpg"
  }
];

export const recipeData = [
  {
    id: 1,
    title: "비타슬림 망고 치아 푸딩",
    image: "/images/mango-pudding.jpg"
  },
  {
    id: 2,
    title: "헬씨니 초코 시리얼바",
    image: "/images/choco-cereal.jpg"
  },
  {
    id: 3,
    title: "헬씨니 오메가3 골드 소프트젤",
    image: "/images/omega3-gel.jpg"
  }
];