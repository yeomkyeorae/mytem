# Mytem 개발 계획

## 프로젝트 개요

인증된 사용자가 본인의 아이템을 체계적으로 관리할 수 있는 웹 애플리케이션

### 주요 기능

1. **아이템 관리 (CRUD)**: 아이템 등록, 조회, 수정, 삭제
2. **기본 픽토그램 제공**: 일반적인 소유 항목(티셔츠, 신발, 책 등)에 대한 기본 이미지
3. **AI 픽토그램 생성**: 텍스트 설명으로 커스텀 픽토그램 이미지 생성
4. **키워드 검색**: 아이템 키워드 검색으로 픽토그램 이미지 조회

### 아이템 속성

- 이미지 (픽토그램)
- 이름
- 개수
- 설명

---

## 완료된 작업

### 1. 프로젝트 초기 설정 ✅

- [x] Next.js 14 프로젝트 생성 (App Router, React 18)
- [x] TypeScript 설정 (strict 모드)
- [x] TailwindCSS 설정
- [x] shadcn/ui 설정 (components.json)
- [x] ESLint + Prettier 설정
- [x] Git 저장소 초기화

### 2. 프로젝트 구조 설정 ✅

```
src/
├── app/
│   ├── layout.tsx      # 루트 레이아웃 (한국어, Inter 폰트)
│   ├── page.tsx        # 랜딩 페이지
│   └── globals.css     # 전역 스타일 및 테마 변수
├── components/         # UI 컴포넌트 (빈 폴더)
├── hooks/              # 커스텀 훅 (빈 폴더)
└── lib/
    └── utils.ts        # 유틸리티 함수 (cn 헬퍼)
```

### 3. 테마 시스템 설정 ✅

- [x] CSS 변수 기반 색상 시스템
- [x] 다크/라이트 모드 지원 준비
- [x] shadcn/ui 호환 색상 팔레트

### 4. 개발 도구 설정 ✅

- [x] Path alias 설정 (@/* → src/*)
- [x] Prettier 설정 (2 spaces, 100자 너비)
- [x] ESLint + Prettier 통합
- [x] 개발 스크립트 설정 (dev, build, lint, format, test)

### 5. 버전 다운그레이드 ✅

- [x] Next.js 16 → 14.2.35 다운그레이드
- [x] React 19 → 18.2.0 다운그레이드
- [x] ESLint 9 → 8 다운그레이드
- [x] 의존성 재설치 및 빌드 테스트 통과

### 6. 프로젝트 매니저 에이전트 설정 ✅

- [x] .claude/agents/manager.md 파일 생성
- [x] 업무 부여 및 수행 프로토콜 정의
- [x] 업무 히스토리 관리 체계 구축
- [x] CLAUDE.md에 에이전트 참조 추가

### 7. 프로젝트 주요 기능 및 시나리오 정의 ✅

- [x] CLAUDE.md에 주요 기능 정의
- [x] CLAUDE.md에 주요 시나리오 정의
- [x] DEVELOPMENT_PLAN.md 업데이트

### 8. Supabase 연동 및 초기 설정 ✅

- [x] Supabase 패키지 설치 (@supabase/supabase-js, @supabase/ssr)
- [x] 환경 변수 예제 파일 생성 (.env.local.example)
- [x] Supabase 클라이언트 설정
  - [x] src/lib/supabase/client.ts (브라우저용)
  - [x] src/lib/supabase/server.ts (서버용 + Admin)
- [x] TypeScript 타입 정의 (src/types/database.types.ts)
- [x] 데이터베이스 스키마 SQL 마이그레이션 파일 생성
  - [x] profiles 테이블 (사용자 프로필)
  - [x] items 테이블 (아이템)
  - [x] pictograms 테이블 (기본 픽토그램)
  - [x] custom_pictograms 테이블 (커스텀 픽토그램)
- [x] RLS(Row Level Security) 정책 설정
- [x] 자동 트리거 설정 (updated_at 갱신, 사용자 프로필 자동 생성)

---

## 진행 중인 작업

(현재 없음)

### 9. Supabase Auth 인증 기능 구현 ✅

- [x] 회원가입 기능 구현 (이메일/비밀번호)
  - [x] src/app/signup/page.tsx에 Supabase Auth 연동
  - [x] 에러 핸들링 (이미 존재하는 이메일 등)
  - [x] 이메일 확인 안내 화면 구현
- [x] 로그인 기능 구현 (이메일/비밀번호)
  - [x] src/app/login/page.tsx에 Supabase Auth 연동
  - [x] 에러 핸들링 (잘못된 자격 증명, 이메일 미인증 등)
- [x] 인증 콜백 처리 (src/app/auth/callback/route.ts)
- [x] 인증 상태 관리 Hook (src/hooks/useAuth.ts)
- [x] 미들웨어 설정 (src/middleware.ts)
  - [x] 보호된 라우트 설정 (/dashboard, /items, /pictogram)
  - [x] 인증 상태에 따른 리다이렉션
- [x] 로그아웃 기능 구현
- [x] 대시보드 페이지 생성 (src/app/dashboard/page.tsx)

### 10. 기본 UI 컴포넌트 구성 ✅

- [x] shadcn/ui 컴포넌트 설치
  - [x] Button, Card, Input 컴포넌트
  - [x] Dialog, Form, Select 컴포넌트
  - [x] Toast, Toaster 컴포넌트
  - [x] Label 컴포넌트 (자동 설치)
- [x] 공통 레이아웃 컴포넌트
  - [x] Navbar 컴포넌트 (인증 상태 반영)
  - [x] Footer 컴포넌트
- [x] Root Layout에 Toaster 추가

### 11. Phase 4 픽토그램 시스템 구현 ✅

**백엔드**:
- [x] Iconify API 클라이언트 설정
  - [x] src/lib/iconify.ts 헬퍼 함수
  - [x] src/types/pictogram.types.ts 타입 정의
  - [x] 5개 인기 컬렉션 연동 (Material Design, Heroicons, Lucide 등)
- [x] 픽토그램 검색 API
  - [x] GET /api/pictograms/search?q=keyword
  - [x] Iconify API 연동, SVG 데이터 반환
- [x] 기본 픽토그램 목록 API
  - [x] GET /api/pictograms?category=clothing
  - [x] 카테고리별 추천 픽토그램 (의류, 전자기기, 생활용품 등)

**프론트엔드**:
- [x] PictogramPicker 컴포넌트 (src/components/PictogramPicker.tsx)
  - [x] 실시간 검색 기능 (500ms 디바운스)
  - [x] 카테고리 탭 필터
  - [x] 그리드 레이아웃 (반응형)
  - [x] 선택 상태 표시
- [x] 테스트 페이지 (/pictograms/test)
- [x] SVG 렌더링 및 미리보기

---

## 다음 할 일

### Phase 1: 데이터베이스 및 인증

- [x] Supabase 프로젝트 연동 (클라이언트 설정 완료)
- [x] 데이터베이스 스키마 설계
  - [x] profiles 테이블 (사용자 프로필)
  - [x] items 테이블 (아이템: 이름, 개수, 설명, 이미지URL, 이미지타입)
  - [x] pictograms 테이블 (기본 픽토그램: 이름, 키워드, 이미지URL, 카테고리)
  - [x] custom_pictograms 테이블 (커스텀 픽토그램)
- [ ] Supabase 대시보드에서 프로젝트 생성 (수동 작업 필요)
- [ ] Supabase 대시보드에서 마이그레이션 SQL 실행 (수동 작업 필요)
- [x] 환경 변수 설정 (.env.local.example 생성됨)

### Phase 2: 기본 UI 컴포넌트 ✅

- [x] shadcn/ui 컴포넌트 추가
  - [x] Button, Card, Input, Dialog, Form
  - [x] Select, Toast (Toaster 포함)
  - [x] Label (자동 설치)
- [x] 레이아웃 컴포넌트
  - [x] Header/Navigation (Navbar 컴포넌트)
  - [x] Footer
- [ ] Sidebar (카테고리 네비게이션) - Phase 5에서 필요 시 구현

### Phase 3: 인증 기능 ✅

- [x] 로그인 페이지 (/login) - 디자인 및 기능 구현 완료
- [x] 회원가입 페이지 (/signup) - 디자인 및 기능 구현 완료
- [x] 로그아웃 기능
- [x] 인증 상태 관리 (useAuth Hook)
- [x] 보호된 라우트 설정 (미들웨어)
- [x] 대시보드 페이지 (/dashboard)

### Phase 4: 기본 픽토그램 시스템 ✅

- [x] 기본 픽토그램 이미지 준비
  - [x] Iconify API 연동 (Material Design, Heroicons, Lucide 등)
  - [x] 카테고리별 추천 아이콘 (의류, 전자기기, 생활용품 등)
- [x] 키워드 검색 API 구현
  - [x] GET /api/pictograms/search
- [x] 기본 픽토그램 목록 API 구현
  - [x] GET /api/pictograms
- [x] 픽토그램 검색/선택 UI 구현
  - [x] PictogramPicker 컴포넌트
  - [x] 실시간 검색 기능
  - [x] 카테고리 필터
  - [x] 테스트 페이지 (/pictograms/test)

### Phase 5: 아이템 관리 (CRUD) ✅

**백엔드 API**:
- [x] GET /api/items - 아이템 목록 조회
- [x] POST /api/items - 아이템 등록
- [x] GET /api/items/[id] - 아이템 상세 조회
- [x] PUT /api/items/[id] - 아이템 수정
- [x] DELETE /api/items/[id] - 아이템 삭제

**프론트엔드**:
- [x] 아이템 목록 페이지 (/items)
- [x] 아이템 상세 페이지 (/items/[id])
- [x] 아이템 등록 기능 (/items/new)
  - [x] PictogramPicker 연동
  - [x] 이름, 개수, 설명 입력
- [x] 아이템 수정 기능 (/items/[id]/edit)
- [x] 아이템 삭제 기능
- [x] ItemCard 컴포넌트
- [x] ItemForm 컴포넌트

### 12. Navbar 컴포넌트 리팩토링 ✅

- [x] 모든 페이지에서 Navbar.tsx 재사용
  - [x] /dashboard 페이지 - 커스텀 header 제거, Navbar 적용
  - [x] /items 페이지 - 커스텀 header 제거, Navbar 적용
  - [x] /login 페이지 - 간단한 header 제거, Navbar 적용
  - [x] /signup 페이지 - header 제거, Navbar 적용
- [x] 코드 중복 제거 및 일관성 개선
- [x] "/" 경로 접근 제어 추가
  - [x] middleware.ts에서 로그인 사용자는 /dashboard로 리다이렉트
  - [x] 비로그인 사용자만 "/" 접근 가능

### 13. 용어 통일 작업 ✅

- [x] "소유물" → "아이템"으로 전체 용어 변경 (총 20개 파일)
  - [x] 문서 파일 6개 (CLAUDE.md, DEVELOPMENT_PLAN.md, 에이전트 파일들)
  - [x] 프론트엔드 페이지 및 컴포넌트 10개
  - [x] 백엔드 API 2개
  - [x] 데이터베이스 스키마 및 타입 2개 (주석만 변경)
- [x] 사용자 UI 텍스트 일관성 확보
- [x] 데이터베이스 호환성 유지 (테이블명/컬럼명은 변경하지 않음)

### 14. Navbar 네비게이션 개선 ✅

- [x] 로그인 상태 시 "내 아이템" 메뉴 추가
  - [x] Navbar.tsx에서 "대시보드" 옆에 "내 아이템" 링크 추가
  - [x] /items 경로로 연결
  - [x] 일관된 스타일 적용

### Phase 6: AI 픽토그램 생성

- [ ] AI 이미지 생성 API 연동 (나노바나나 등)
- [ ] 픽토그램 생성 페이지 (/pictogram/create)
- [ ] 텍스트 입력 → 이미지 생성 플로우
- [ ] 생성된 이미지 저장 및 관리
- [ ] 사용자별 커스텀 픽토그램 목록

### Phase 7: 추가 기능

- [ ] 대시보드/통계 페이지
- [ ] 다크 모드 토글
- [ ] 반응형 디자인 최적화
- [ ] PWA 지원 (선택)

---

## 기술 스택

| 구분     | 기술                         |
| -------- | ---------------------------- |
| Frontend | Next.js 14, React 18         |
| Styling  | TailwindCSS, shadcn/ui       |
| Backend  | Next.js API Routes           |
| Database | Supabase (PostgreSQL)        |
| Auth     | Supabase Auth                |
| AI Image | 나노바나나 API (예정)        |
| Hosting  | Vercel                       |
| Language | TypeScript (strict mode)     |
| Icons    | Lucide React                 |
| Linting  | ESLint, Prettier             |

---

## 참고 사항

- 모든 컴포넌트는 `src/components/`에 위치
- 커밋 메시지 형식: `feat:`, `fix:`, `docs:`, `chore:`, `refact:`
- main 브랜치는 항상 배포 가능한 상태 유지
