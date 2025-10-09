## 🎧 About Project

프로젝트 명 : **아이허브유 🌿**

소개 : 아이허브유(iHerbYou)는 건강과 웰빙을 중시하는 현대인들이 **필요한 영양제를 빠르고 합리적으로 구매**할 수 있도록 기획된 온라인 플랫폼입니다. <br />
아이허브의 강점을 참고하되, 국내 사용자에게 더 알맞은 맞춤형 서비스와 편리한 결제·배송 경험을 제공하는 것을 목표로 합니다.

## 🚀 Tech Stack

- **Frontend**: React 19.1 + TypeScript + Vite 7.1
- **Routing**: React Router DOM v6.30
- **Styling**: Tailwind CSS (CDN 방식 사용)
- **Fonts**: SUITE, Noto Sans KR
- **State Management**: React Context API (CartContext, ToastContext)
- **Build/Dev**: Vite Dev Server
- **Icons**: Inline SVG

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
│  ├─ images/                 # 정적 이미지 (파비콘 포함)
│  └─ policies/               # 약관/정책 HTML 파일
├─ src/
│  ├─ components/             # UI 컴포넌트
│  ├─ contexts/               # 전역 상태
│  ├─ pages/                  # 페이지 컴포넌트 (20개)
│  ├─ lib/                    # API 및 비즈니스 로직
│  ├─ data/                   # 대/중/소 카테고리, 제품 목업 데이터
│  ├─ hooks/
│  │  └─ useScrollToTop.ts    # 스크롤 최상단 훅
│  ├─ index.css               # 전역 스타일 및 폰트 선언
│  ├─ main.tsx                # 진입 파일
│  └─ App.tsx                 # 라우팅 설정
└─ index.html                 # Tailwind CDN 및 커스텀 config 포함
```


## ✨ Implemented Features

### 🏠 메인 페이지
- 상단 배너 "오늘 하루 보지 않기" (sessionStorage) 기능
- 메인 배너 캐러셀 (자동 슬라이드, 화살표, 도트 네비게이션)
- 베스트셀러 섹션 (최대 8개)
- 신상품 섹션
- 추천 레시피 섹션

### 🔍 검색 & 카테고리
- 헤더 내 카테고리 호버 드롭다운 (대/중/소 카테고리)
- 실시간 검색 기능 및 검색 히스토리 관리
- 최근 검색어 저장 및 삭제
- 카테고리별 제품 필터링 및 정렬
- 브랜드 전체 목록 및 브랜드별 제품 조회

### 🛒 장바구니 & 주문
- 장바구니 추가/수정/삭제
- 수량 변경 및 선택 삭제
- 쿠폰 적용 기능
- 포인트 사용 기능
- 배송지 관리 (추가/수정/삭제/기본 배송지 설정)
- 주문서 작성 및 결제
- 장바구니 수량 뱃지 실시간 업데이트

### 👤 회원 기능
- 회원가입 (이메일/비밀번호/이름/전화번호)
- 로그인/로그아웃
- 비밀번호 재설정
- 이메일 인증
- 라우트 가드 (로그인 필수 페이지 접근 제어)

### 📦 마이페이지
- 주문 내역 조회
- 주문 상세 조회
- 배송 추적
- 작성 가능한 리뷰 목록
- 작성한 리뷰 목록
- 리뷰 수정/삭제
- 문의 내역 조회
- 포인트 적립/사용 내역
- 보유 쿠폰 조회
- 회원 정보 수정
- 회원 탈퇴

### 💚 위시리스트
- 제품 찜하기/찜 해제
- 위시리스트 조회
- 위시리스트 공유 (공유 링크 생성)
- 공유된 위시리스트 조회

### 📝 리뷰 & Q&A
- 제품 리뷰 작성/수정/삭제
- 리뷰 사진 업로드 (최대 5장)
- 리뷰 평점 (별점 0.5 단위)
- 리뷰 신고 기능
- 리뷰 정렬 (최신순/평점높은순/평점낮은순)
- 제품 Q&A 작성/수정/삭제
- Q&A 비밀글 기능
- 관리자 답변 표시

### 🎨 UI/UX
- 반응형 디자인 (모바일/태블릿/데스크톱)
- 토스트 알림 시스템
- 모달 컴포넌트 (장바구니 추가, 리뷰 작성, Q&A 작성 등)
- 로딩 상태 표시
- 에러 처리 및 사용자 피드백
- 스크롤 시 자동 상단 이동
- 제품 카드 호버 효과
- 이미지 lazy loading

## 🏗️ Architecture

### Context API
- **CartContext**: 장바구니 상태 전역 관리 (제품 추가/삭제/수량 변경)
- **ToastContext**: 토스트 알림 전역 관리 (성공/에러/정보 메시지)

### API Layer (`src/lib/`)
모든 API 호출은 `src/lib/` 디렉토리에서 관리되며, 실제 백엔드 연동을 위한 구조로 설계되었습니다.
- 인증 토큰 자동 갱신
- 에러 핸들링 및 로그아웃 처리
- HttpOnly 쿠키 기반 토큰 관리

### Route Guards
- **GuestOnly**: 로그인 상태에서 접근 불가 (로그인/회원가입 페이지)
- **RequireAuth**: 로그인 필수 (위시리스트/마이페이지)

## 📦 Data Notes

- `src/data/products.ts`: 카테고리, 평점, 리뷰수 포함 목업 데이터
- `src/data/categories.ts`: 대/중/소 카테고리 구조화 데이터
- API 응답은 실제 백엔드 구조를 따름 (인증, 제품, 주문 등)

## 🧩 Known Notes

- **Tailwind CDN**: CDN 기반이므로 클래스 사용 시 즉시 적용됩니다. 프로덕션 환경에서는 빌드 타임 Tailwind를 권장합니다.
- **Node.js 버전**: Vite 7은 Node.js 20.19+ 또는 22.12+ 이상을 권장합니다.
- **인증 시스템**: HttpOnly 쿠키 기반 JWT 토큰 사용 (accessToken + refreshToken)
- **세션 관리**: sessionStorage를 활용한 로그인 상태 관리
- **이미지**: 제품 이미지는 `public/images/` 디렉토리에 저장되어 있습니다.
- **반응형**: 모바일(sm), 태블릿(md), 데스크톱(lg, xl) 대응

## 📄 License

이 저장소는 학습/실험 목적의 샘플 프로젝트입니다.
