export interface SmallCategory {
  name: string;
}

export interface MidCategory {
  name: string;
  items?: SmallCategory[];
}

export interface TopCategory {
  name: string;
  children: MidCategory[];
}

export const categories: TopCategory[] = [
  {
    name: '영양제',
    children: [
      {
        name: '비타민',
        items: [
          { name: '종합비타민' },
          { name: '비타민 A' },
          { name: '비타민 B' },
          { name: '비타민 C' },
          { name: '비타민 D' },
          { name: '비타민 E' },
          { name: '비타민 K' },
        ],
      },
      {
        name: '미네랄',
        items: [
          { name: '칼슘' },
          { name: '마그네슘' },
          { name: '철분' },
          { name: '아연' },
          { name: '셀레늄' },
          { name: '요오드' },
          { name: '칼륨' },
          { name: '바다 이끼' },
        ],
      },
      {
        name: '수면',
        items: [
          { name: '멜라토닌' },
          { name: '마그네슘' },
          { name: '5-HTP' },
          { name: '트립토판' },
          { name: '길초근' },
        ],
      },
      {
        name: '항산화제',
        items: [
          { name: 'Coenzyme Q10 (Ubiquinone)' },
          { name: '강황&커큐민' },
          { name: '글루타치온' },
          { name: '루테인' },
          { name: '제아잔틴' },
          { name: 'NAC(N-아세틸 시스테인)' },
          { name: '아스타잔틴' },
        ],
      },
      {
        name: '장 건강',
        items: [
          { name: '프로바이오틱스' },
          { name: '프리바이오틱스' },
          { name: '소화 효소' },
          { name: '섬유소' },
        ],
      },
      {
        name: '뼈, 관절&연골',
        items: [
          { name: '칼슘' },
          { name: '콜라겐 보충제' },
          { name: '클루코사민' },
          { name: '콘드로이틴' },
          { name: 'MSM' },
          { name: '강황&커큐민' },
        ],
      },
      {
        name: '두뇌 & 인지',
        items: [
          { name: '집중력&기억력' },
          { name: '크레아틴' },
        ],
      },
      {
        name: '오메가 & 피쉬오일',
        items: [
          { name: '오메가3 피쉬 오일' },
          { name: 'DHA' },
          { name: '크릴 오일' },
          { name: '아마씨유&보충제' },
          { name: '오메가 3-6-9' },
          { name: '해조류 오메가3' },
        ],
      },
      {
        name: '아미노산',
        items: [
          { name: '아르기닌' },
          { name: '글루타민' },
          { name: '테아닌' },
          { name: '아미노산 블렌드' },
        ],
      },
    ],
  },
  {
    name: '스포츠',
    children: [
      {
        name: '단백질',
        items: [
          { name: '유청 단백질' },
          { name: '미셀라 카제인 단백질' },
          { name: '식물성 단백질' },
          { name: '동물성 단백질' },
        ],
      },
      {
        name: '운동 전 보충제',
        items: [
          { name: '카페인' },
          { name: '베타 알라닌' },
          { name: '운동 전 각성제' },
          { name: '비각성 운동 전 보충제' },
        ],
      },
      {
        name: '운동 후 회복 (근육 회복 보충제)',
        items: [
          { name: 'BCAA' },
          { name: '필수 아미노산' },
          { name: '류신' },
          { name: 'L-글루타민' },
          { name: '탄수화물 분말' },
          { name: '아연 마그네슘 아스파테이트' },
        ],
      },
      {
        name: '바, 쿠키, 스낵',
        items: [
          { name: '단백질 바' },
          { name: '단백질 스낵' },
          { name: '다이어트 바' },
        ],
      },
    ],
  },
  {
    name: '뷰티',
    children: [
      {
        name: '모발, 피부, 손발톱',
        items: [
          { name: '콜라겐' },
          { name: '비오틴(비타민B7)' },
          { name: '히알루론산' },
        ],
      },
      {
        name: '다이어트',
        items: [
          { name: '당 제어' },
          { name: '에너지' },
        ],
      },
      {
        name: '여성 건강',
        items: [
          { name: '여성용 종합비타민' },
          { name: '월경 전 증후군 지원' },
          { name: '폐경 이행기 & 폐경기 지원' },
        ],
      },
      {
        name: '체중 관리',
        items: [
          { name: '다이어트 포뮬라' },
          { name: '지방 연소제' },
          { name: '식사 대용품' },
          { name: '식욕 보조제' },
          { name: '녹차 추출물' },
        ],
      },
    ],
  },
];

