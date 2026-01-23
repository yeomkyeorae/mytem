# Mytem 개발 계획

## 프로젝트 개요

인증된 사용자가 본인의 아이템을 체계적으로 관리할 수 있는 웹 애플리케이션

### 주요 기능

1. **아이템 관리 (CRUD)**: 아이템 등록, 조회, 수정, 삭제
2. **기본 스케치 제공**: 일반적인 소유 항목(티셔츠, 신발, 책 등)에 대한 기본 이미지
3. **AI 스케치 생성**: 텍스트 설명으로 커스텀 스케치 이미지 생성
4. **키워드 검색**: 아이템 키워드 검색으로 스케치 이미지 조회

### 아이템 속성

- 이미지 (스케치)
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
  - [x] sketches 테이블 (기본 스케치)
  - [x] custom_sketches 테이블 (커스텀 스케치)
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
  - [x] 보호된 라우트 설정 (/dashboard, /items, /sketch)
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

### 11. Phase 4 스케치 시스템 구현 ✅

**백엔드**:
- [x] Iconify API 클라이언트 설정
  - [x] src/lib/iconify.ts 헬퍼 함수
  - [x] src/types/sketch.types.ts 타입 정의
  - [x] 5개 인기 컬렉션 연동 (Material Design, Heroicons, Lucide 등)
- [x] 스케치 검색 API
  - [x] GET /api/sketches/search?q=keyword
  - [x] Iconify API 연동, SVG 데이터 반환
- [x] 기본 스케치 목록 API
  - [x] GET /api/sketches?category=clothing
  - [x] 카테고리별 추천 스케치 (의류, 전자기기, 생활용품 등)

**프론트엔드**:
- [x] SketchPicker 컴포넌트 (src/components/SketchPicker.tsx)
  - [x] 실시간 검색 기능 (500ms 디바운스)
  - [x] 카테고리 탭 필터
  - [x] 그리드 레이아웃 (반응형)
  - [x] 선택 상태 표시
- [x] 테스트 페이지 (/sketches/test)
- [x] SVG 렌더링 및 미리보기

---

## 다음 할 일

### Phase 1: 데이터베이스 및 인증

- [x] Supabase 프로젝트 연동 (클라이언트 설정 완료)
- [x] 데이터베이스 스키마 설계
  - [x] profiles 테이블 (사용자 프로필)
  - [x] items 테이블 (아이템: 이름, 개수, 설명, 이미지URL, 이미지타입)
  - [x] sketches 테이블 (기본 스케치: 이름, 키워드, 이미지URL, 카테고리)
  - [x] custom_sketches 테이블 (커스텀 스케치)
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

### Phase 4: 기본 스케치 시스템 ✅

- [x] 기본 스케치 이미지 준비
  - [x] Iconify API 연동 (Material Design, Heroicons, Lucide 등)
  - [x] 카테고리별 추천 아이콘 (의류, 전자기기, 생활용품 등)
- [x] 키워드 검색 API 구현
  - [x] GET /api/sketches/search
- [x] 기본 스케치 목록 API 구현
  - [x] GET /api/sketches
- [x] 스케치 검색/선택 UI 구현
  - [x] SketchPicker 컴포넌트
  - [x] 실시간 검색 기능
  - [x] 카테고리 필터
  - [x] 테스트 페이지 (/sketches/test)

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
  - [x] SketchPicker 연동
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

### 15. 대시보드 아이템 API 연동 ✅

- [x] 대시보드 페이지에 아이템 API 연동
  - [x] /api/items API 호출하여 실제 데이터 표시
  - [x] 통계 섹션에 전체 아이템 개수, 커스텀 스케치 개수 표시
  - [x] 최근 등록된 아이템 5개 표시 (ItemCard 컴포넌트 재사용)
  - [x] 카테고리 통계 카드 제거 (기능 미구현)
  - [x] 에러 처리 및 "다시 시도" 버튼 추가
  - [x] 아이템이 없을 때만 Empty State 표시

### Phase 6: AI 스케치 생성 ✅

**백엔드**:
- [x] Replicate API 연동 (Flux Schnell 모델, ~$0.003/image)
  - [x] src/lib/replicate.ts - API 클라이언트 설정
  - [x] 스케치 스타일 프롬프트 템플릿 적용
- [x] 커스텀 스케치 API 구현
  - [x] GET /api/sketches/custom - 사용자 스케치 목록 조회
  - [x] POST /api/sketches/custom - AI 이미지 생성 및 저장
  - [x] DELETE /api/sketches/custom/[id] - 스케치 삭제

**프론트엔드**:
- [x] 스케치 생성 페이지 (/sketch/create)
  - [x] 프롬프트 입력 UI
  - [x] 이미지 생성 로딩 상태
  - [x] 생성된 이미지 미리보기
  - [x] 최근 생성한 스케치 목록
- [x] 스케치 갤러리 페이지 (/sketch/gallery)
  - [x] 사용자 스케치 그리드 표시
  - [x] 삭제 기능 (호버 시 버튼 표시)
- [x] SketchPicker 확장
  - [x] "내 스케치" 탭 추가
  - [x] 커스텀 스케치 선택 기능
  - [x] isCustomSketch 타입 가드 추가
- [x] ItemForm 개선
  - [x] 커스텀 스케치 지원
  - [x] image_type 동적 설정 (default/custom)
- [x] Navbar 메뉴 추가
  - [x] "스케치 생성" 링크 추가

**타입 및 설정**:
- [x] CustomSketch 타입 추가 (src/types/sketch.types.ts)
- [x] .env.local.example에 REPLICATE_API_TOKEN 추가
- [x] replicate 패키지 설치

### 16. 스케치 생성 흐름 개선 ✅

- [x] 백엔드 API 분리
  - [x] POST /api/sketches/generate 생성 (AI 이미지만 생성, DB 저장 안 함)
  - [x] POST /api/sketches/custom 수정 (이미지 URL + 프롬프트 받아서 DB에만 저장)
- [x] 프론트엔드 UI 개선
  - [x] /sketch/create 페이지 수정
  - [x] "생성하기" 버튼 → /api/sketches/generate 호출
  - [x] "추가하기" 버튼 추가 → /api/sketches/custom 호출하여 DB 저장
  - [x] 토스트 알림 추가 (useToast hook 사용)
- [x] 사용자 경험 개선
  - [x] 생성된 이미지 확인 후 저장 여부 결정 가능
  - [x] 불필요한 이미지가 DB에 저장되지 않음

### 17. Supabase Storage 이미지 저장 구현 ✅

- [x] Supabase Storage 설정
  - [x] custom-pictograms 버킷 생성 마이그레이션 파일
  - [x] RLS 정책 설정 (업로드, 조회, 삭제)
  - [x] 파일 타입 제한 (image/png, image/jpeg, image/webp)
  - [x] 파일 크기 제한 (5MB)
- [x] Storage 헬퍼 함수 구현
  - [x] src/lib/supabase/storage.ts 생성
  - [x] uploadImageFromUrl() - Replicate URL에서 다운로드 후 Storage 업로드
  - [x] deleteImageFromStorage() - Storage 이미지 삭제
  - [x] getPublicUrl() - Storage public URL 생성
- [x] 백엔드 API 수정
  - [x] POST /api/sketches/generate - Replicate URL만 반환
  - [x] POST /api/sketches/custom - "추가하기" 시 Storage 업로드
  - [x] DELETE /api/sketches/custom/[id] - Storage 이미지 삭제 로직 추가
- [x] 이미지 영구 저장
  - [x] Replicate URL 만료 문제 해결
  - [x] 사용자별 폴더 구조 ({userId}/{uuid}.png)
- [x] Storage 업로드 시점 최적화
  - [x] "생성하기" 시 Storage 업로드 안 함 (Replicate URL만 반환)
  - [x] "추가하기" 시 Storage 업로드 및 DB 저장
  - [x] 불필요한 이미지가 Storage에 쌓이지 않음

### 18. 스케치 선택 카테고리 동적 로딩 ✅

- [x] 문제 분석
  - [x] SketchPicker 컴포넌트의 하드코딩된 카테고리 확인
  - [x] API가 이미 카테고리 목록 제공하고 있음을 확인
- [x] SketchPicker 컴포넌트 개선
  - [x] 하드코딩된 CATEGORIES 상수 제거
  - [x] loadCategories() 함수 추가 - /api/sketches로부터 카테고리 동적 로딩
  - [x] categories 상태 추가 및 로딩 상태 관리
  - [x] displayCategories 로직 개선 (내 스케치 + 전체 + API 카테고리)
  - [x] 카테고리 로딩 중 UI 추가
- [x] 기대 효과
  - [x] iconify.ts의 RECOMMENDED_ICONS 변경 시 자동 UI 반영
  - [x] 하드코딩 제거로 유지보수성 향상

### 19. 스케치 카테고리 선택 버그 수정 ✅

- [x] 문제 분석
  - [x] "내 스케치" 외의 카테고리 선택 시 스케치 미출력 확인
  - [x] API 응답 필드명과 컴포넌트에서 읽는 필드명 불일치 발견
  - [x] API는 `sketches` 반환, 컴포넌트는 `pictograms` 참조
- [x] SketchPicker 컴포넌트 수정
  - [x] loadDefaultSketchs() 함수: `data.pictograms` → `data.sketches` 수정
  - [x] searchSketchs() 함수: `data.pictograms` → `data.sketches` 수정
- [x] 결과
  - [x] 모든 카테고리에서 스케치 정상 출력
  - [x] 검색 기능 정상 작동

### 20. 다크 모드 토글 기능 구현 ✅

- [x] next-themes 패키지 설치
- [x] ThemeProvider 컴포넌트 생성
  - [x] src/components/ThemeProvider.tsx
  - [x] attribute="class", defaultTheme="dark", enableSystem
- [x] app/layout.tsx에 ThemeProvider 적용
  - [x] suppressHydrationWarning 추가
  - [x] disableTransitionOnChange로 깜빡임 방지
- [x] ThemeToggle 컴포넌트 생성
  - [x] src/components/ThemeToggle.tsx
  - [x] 해/달 아이콘 토글 버튼
  - [x] 부드러운 전환 애니메이션
  - [x] hydration 이슈 해결 (mounted 상태 관리)
- [x] Navbar에 토글 버튼 추가
  - [x] 로그인/비로그인 상태 모두 지원
- [x] 기능 검증
  - [x] 테마 전환 정상 작동
  - [x] localStorage에 선호도 저장
  - [x] 시스템 테마 자동 감지
- [x] 하드코딩된 색상을 CSS 변수로 변경
  - [x] 11개 페이지 파일 수정 (page.tsx, login, signup, dashboard, items 등)
  - [x] 4개 컴포넌트 수정 (Navbar, ItemForm, ItemCard, SketchPicker)
  - [x] bg-black → bg-background, text-white → text-foreground
  - [x] 모든 페이지에서 다크/라이트 모드 정상 작동 확인
- [x] UI 가시성 개선
  - [x] ThemeToggle 버튼 색상 수정 (라이트 모드에서도 명확히 보이도록)
  - [x] 카테고리 관리 페이지 테마 적용 (categories/page.tsx)
  - [x] CategoryTag 컴포넌트 테마 적용

### Phase 7: 추가 기능

- [x] 대시보드/통계 페이지
- [x] 다크 모드 토글
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
| AI Image | Replicate Flux Schnell       |
| Hosting  | Vercel                       |
| Language | TypeScript (strict mode)     |
| Icons    | Lucide React                 |
| Linting  | ESLint, Prettier             |

---

## 참고 사항

- 모든 컴포넌트는 `src/components/`에 위치
- 커밋 메시지 형식: `feat:`, `fix:`, `docs:`, `chore:`, `refact:`
- main 브랜치는 항상 배포 가능한 상태 유지
