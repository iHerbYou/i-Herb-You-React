## 🎧 About Project

프로젝트 명 : **아이허브유 🌿**

소개 : 아이허브유(iHerbYou)는 건강과 웰빙을 중시하는 현대인들이 **필요한 영양제를 빠르고 합리적으로 구매**할 수 있도록 기획된 온라인 플랫폼입니다. <br />
아이허브의 강점을 참고하되, 국내 사용자에게 더 알맞은 맞춤형 서비스와 편리한 결제·배송 경험을 제공하는 것을 목표로 합니다.

## 🚀 Tech Stack

- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS (CDN 방식 사용)
- Fonts: SUITE (Cafe24 제공 폰트), Noto Sans KR
- State: React useState 기반의 경량 상태 관리
- Build/Dev: Vite Dev Server
- Icons: Inline SVG
- Data: 로컬 Mock 데이터 (`src/data/*.ts`)

## ✨ Installation

1) Node.js 버전
```bash
nvm use
```
현재 Vite 7은 Node.js 20.19+ 또는 22.12+ 이상 권장

2) 의존성 설치
```bash
npm install
```

3) 개발 서버 실행
```bash
npm run dev
```
브라우저에서 http://localhost:5173 접속

4) 프로덕션 빌드
```bash
npm run build
npm run preview
```

주의: Tailwind는 CDN을 사용합니다. `tailwind.config.js`, `postcss.config.js` 파일은 없습니다.

## 📁 Project Structure

```text
.
├─ public/
│  └─ images/                 # 정적 이미지 (파비콘 포함)
├─ src/
│  ├─ components/             # UI 컴포넌트 (Header, Footer, ProductCard 등)
│  ├─ data/                   # 카테고리/상품 목업 데이터
│  ├─ index.css               # 전역 스타일 및 폰트 선언
│  ├─ main.tsx                # 진입 파일
│  └─ App.tsx                 # 페이지 컴포지션
└─ index.html                 # Tailwind CDN 및 커스텀 config 포함
```

## 🔧 Customization

- 색상: `index.html` 내 Tailwind config의 `extend.colors.brand.*` 수정
- 폰트: `src/index.css` 상단 `@font-face` 경로 변경으로 교체 가능
- 파비콘: `public/images/iHerbYou-favicon.png` 교체 후 `index.html` 링크 확인
- 배너 이미지: `src/components/BannerCarousel.tsx`의 `bannerImages` 배열 수정

## ✨ Implemented Features

- 헤더 내 카테고리 호버 드롭다운(대/중/소 카테고리 데이터 연동)
- 검색 입력창, 로그인/장바구니 아이콘 및 뱃지(0 표시)
- 상단 배너 “오늘 하루 보지 않기” (sessionStorage) 기능
- 메인 배너 캐러셀(자동 슬라이드, 화살표, 도트)
- 상품 카드: 이미지/카테고리/상품명/가격/평점(0.5 단위)/리뷰수
- 호버 시 이미지 오버레이 + 아이콘 노출
- 베스트셀러 섹션 최대 8개 제한
- 링크/버튼 컬러 및 호버 효과 원본 사이트 분위기 반영

## 📦 Data Notes

- `src/data/products.ts`: 카테고리, 평점, 리뷰수 포함 목업 데이터
- `src/data/categories.ts`: 대/중/소 카테고리 구조화 데이터

## 🧩 Known Notes

- Tailwind는 CDN 기반이므로 클래스 사용 시 즉시 적용됩니다.
- Vite 엔진 관련 경고가 보일 수 있으나 개발 서버 실행에는 문제가 없습니다. Node 버전을 권장 사양으로 올리면 경고가 사라집니다.

## 🧭 Scripts

```bash
npm run dev       # 개발 서버 실행
npm run build     # 프로덕션 빌드
npm run preview   # 빌드 산출물 로컬 미리보기
```

## 📄 Pages & Routes

- `/` 메인(Home)
- `/login` 로그인
- `/signup` 회원가입
- `/find-email` 이메일 찾기
- `/reset-password` 비밀번호 재설정
- `/event/coupon` 이벤트 쿠폰 안내

## 📄 License

이 저장소는 학습/실험 목적의 샘플 프로젝트입니다.
