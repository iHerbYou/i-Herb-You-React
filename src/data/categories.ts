export interface SmallCategory {
  id: number;
  name: string;
  parentId: number;
}

export interface MidCategory {
  id: number;
  name: string;
  parentId: number;
  items?: SmallCategory[];
}

export interface TopCategory {
  id: number;
  name: string;
  children: MidCategory[];
}

export const categories: TopCategory[] = [
  {
    id: 1,
    name: '영양제',
    children: [
      {
        id: 4,
        parentId: 1,
        name: '비타민',
        items: [
          { id: 13, parentId: 4, name: '종합비타민' },
          { id: 14, parentId: 4, name: '비타민 A' },
          { id: 15, parentId: 4, name: '비타민 B' },
          { id: 16, parentId: 4, name: '비타민 C' },
          { id: 17, parentId: 4, name: '비타민 D' },
          { id: 18, parentId: 4, name: '비타민 E' },
          { id: 19, parentId: 4, name: '비타민 K' },
        ],
      },
      {
        id: 5,
        parentId: 1,
        name: '미네랄',
        items: [
          { id: 20, parentId: 5, name: '칼슘' },
          { id: 21, parentId: 5, name: '마그네슘' },
          { id: 22, parentId: 5, name: '철분' },
          { id: 23, parentId: 5, name: '아연' },
          { id: 24, parentId: 5, name: '셀레늄' },
          { id: 25, parentId: 5, name: '요오드' },
          { id: 26, parentId: 5, name: '칼륨' },
          { id: 27, parentId: 5, name: '바다 이끼' },
        ],
      },
      {
        id: 6,
        parentId: 1,
        name: '수면',
        items: [
          { id: 28, parentId: 6, name: '멜라토닌' },
          { id: 29, parentId: 6, name: '마그네슘' },
          { id: 30, parentId: 6, name: '5-HTP' },
          { id: 31, parentId: 6, name: '트립토판' },
          { id: 32, parentId: 6, name: '길초근' },
        ],
      },
      {
        id: 7,
        parentId: 1,
        name: '항산화제',
        items: [
          { id: 33, parentId: 7, name: 'Coenzyme Q10 (Ubiquinone)' },
          { id: 34, parentId: 7, name: '강황&커큐민' },
          { id: 35, parentId: 7, name: '글루타치온' },
          { id: 36, parentId: 7, name: '루테인' },
          { id: 37, parentId: 7, name: '제아잔틴' },
          { id: 38, parentId: 7, name: 'NAC(N-아세틸 시스테인)' },
          { id: 39, parentId: 7, name: '아스타잔틴' },
        ],
      },
      {
        id: 8,
        parentId: 1,
        name: '장 건강',
        items: [
          { id: 40, parentId: 8, name: '프로바이오틱스' },
          { id: 41, parentId: 8, name: '프리바이오틱스' },
          { id: 42, parentId: 8, name: '소화 효소' },
          { id: 43, parentId: 8, name: '섬유소' },
        ],
      },
      {
        id: 9,
        parentId: 1,
        name: '뼈, 관절&연골',
        items: [
          { id: 44, parentId: 9, name: '칼슘' },
          { id: 45, parentId: 9, name: '콜라겐 보충제' },
          { id: 46, parentId: 9, name: '클루코사민' },
          { id: 47, parentId: 9, name: '콘드로이틴' },
          { id: 48, parentId: 9, name: 'MSM' },
          { id: 49, parentId: 9, name: '강황&커큐민' },
        ],
      },
      {
        id: 10,
        parentId: 1,
        name: '두뇌 & 인지',
        items: [
          { id: 50, parentId: 10, name: '집중력&기억력' },
          { id: 51, parentId: 10, name: '크레아틴' },
        ],
      },
      {
        id: 11,
        parentId: 1,
        name: '오메가 & 피쉬오일',
        items: [
          { id: 52, parentId: 11, name: '오메가3 피쉬 오일' },
          { id: 53, parentId: 11, name: 'DHA' },
          { id: 54, parentId: 11, name: '크릴 오일' },
          { id: 55, parentId: 11, name: '아마씨유&보충제' },
          { id: 56, parentId: 11, name: '오메가 3-6-9' },
          { id: 57, parentId: 11, name: '해조류 오메가3' },
        ],
      },
      {
        id: 12,
        parentId: 1,
        name: '아미노산',
        items: [
          { id: 58, parentId: 12, name: '아르기닌' },
          { id: 59, parentId: 12, name: '글루타민' },
          { id: 60, parentId: 12, name: '테아닌' },
          { id: 61, parentId: 12, name: '아미노산 블렌드' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: '스포츠',
    children: [
      {
        id: 62,
        parentId: 2,
        name: '단백질',
        items: [
          { id: 66, parentId: 62, name: '유청 단백질' },
          { id: 67, parentId: 62, name: '미셀라 카제인 단백질' },
          { id: 68, parentId: 62, name: '식물성 단백질' },
          { id: 69, parentId: 62, name: '동물성 단백질' },
        ],
      },
      {
        id: 63,
        parentId: 2,
        name: '운동 전 보충제',
        items: [
          { id: 70, parentId: 63, name: '카페인' },
          { id: 71, parentId: 63, name: '베타 알라닌' },
          { id: 72, parentId: 63, name: '운동 전 각성제' },
          { id: 73, parentId: 63, name: '비각성 운동 전 보충제' },
        ],
      },
      {
        id: 64,
        parentId: 2,
        name: '운동 후 회복',
        items: [
          { id: 74, parentId: 64, name: 'BCAA' },
          { id: 75, parentId: 64, name: '필수 아미노산' },
          { id: 76, parentId: 64, name: '류신' },
          { id: 77, parentId: 64, name: 'L-글루타민' },
          { id: 78, parentId: 64, name: '탄수화물 분말' },
          { id: 79, parentId: 64, name: '아연 마그네슘 아스파테이트' },
        ],
      },
      {
        id: 65,
        parentId: 2,
        name: '바, 쿠키, 스낵',
        items: [
          { id: 80, parentId: 65, name: '단백질 바' },
          { id: 81, parentId: 65, name: '단백질 스낵' },
          { id: 82, parentId: 65, name: '다이어트 바' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: '뷰티',
    children: [
      {
        id: 83,
        parentId: 3,
        name: '모발, 피부, 손발톱',
        items: [
          { id: 87, parentId: 83, name: '콜라겐' },
          { id: 88, parentId: 83, name: '비오틴(비타민B7)' },
          { id: 89, parentId: 83, name: '히알루론산' },
        ],
      },
      {
        id: 84,
        parentId: 3,
        name: '다이어트',
        items: [
          { id: 90, parentId: 84, name: '당 제어' },
          { id: 91, parentId: 84, name: '에너지' },
        ],
      },
      {
        id: 85,
        parentId: 3,
        name: '여성 건강',
        items: [
          { id: 92, parentId: 85, name: '여성용 종합비타민' },
          { id: 93, parentId: 85, name: '월경 전 증후군 지원' },
          { id: 94, parentId: 85, name: '폐경 이행기 & 폐경기 지원' },
        ],
      },
      {
        id: 86,
        parentId: 3,
        name: '체중 관리',
        items: [
          { id: 95, parentId: 86, name: '다이어트 포뮬라' },
          { id: 96, parentId: 86, name: '지방 연소제' },
          { id: 97, parentId: 86, name: '식사 대용품' },
          { id: 98, parentId: 86, name: '식욕 보조제' },
          { id: 99, parentId: 86, name: '녹차 추출물' },
        ],
      },
    ],
  },
];

