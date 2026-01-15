# Mytem 개발 계획

## 프로젝트 개요

인증된 사용자가 본인의 소유물을 체계적으로 관리할 수 있는 웹 애플리케이션

### 주요 기능

1. **소유물 관리 (CRUD)**: 소유물 등록, 조회, 수정, 삭제
2. **기본 픽토그램 제공**: 일반적인 소유 항목(티셔츠, 신발, 책 등)에 대한 기본 이미지
3. **AI 픽토그램 생성**: 텍스트 설명으로 커스텀 픽토그램 이미지 생성
4. **키워드 검색**: 소유물 키워드 검색으로 픽토그램 이미지 조회

### 소유물 속성

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

- [x] AGENT_PM.md 파일 생성
- [x] 업무 부여 및 수행 프로토콜 정의
- [x] 업무 히스토리 관리 체계 구축
- [x] CLAUDE.md에 에이전트 참조 추가

### 7. 프로젝트 주요 기능 및 시나리오 정의 ✅

- [x] CLAUDE.md에 주요 기능 정의
- [x] CLAUDE.md에 주요 시나리오 정의
- [x] DEVELOPMENT_PLAN.md 업데이트

---

## 진행 중인 작업

(현재 없음)

---

## 다음 할 일

### Phase 1: 데이터베이스 및 인증

- [ ] Supabase 프로젝트 생성 및 연동
- [ ] 데이터베이스 스키마 설계
  - [ ] users 테이블 (사용자 정보)
  - [ ] items 테이블 (소유물: 이름, 개수, 설명, 이미지ID)
  - [ ] pictograms 테이블 (픽토그램 이미지: 키워드, 이미지URL, 타입)
- [ ] Supabase Auth 설정
- [ ] 환경 변수 설정 (.env.local)

### Phase 2: 기본 UI 컴포넌트

- [ ] shadcn/ui 컴포넌트 추가
  - [ ] Button, Card, Input, Dialog, Form
  - [ ] Select, Dropdown, Toast
- [ ] 레이아웃 컴포넌트
  - [ ] Header/Navigation
  - [ ] Sidebar (카테고리 네비게이션)
  - [ ] Footer

### Phase 3: 인증 기능

- [ ] 로그인 페이지 (/login)
- [ ] 회원가입 페이지 (/signup)
- [ ] 로그아웃 기능
- [ ] 인증 상태 관리 (Context/Hook)
- [ ] 보호된 라우트 설정

### Phase 4: 기본 픽토그램 시스템

- [ ] 기본 픽토그램 이미지 준비
  - [ ] 의류: 티셔츠, 바지, 신발, 모자 등
  - [ ] 전자기기: 랩탑, 노트북, 스마트폰 등
  - [ ] 생활용품: 책, 가방, 시계 등
- [ ] 픽토그램 데이터베이스 시딩
- [ ] 키워드 검색 API 구현

### Phase 5: 소유물 관리 (CRUD)

- [ ] 소유물 목록 페이지 (/items)
- [ ] 소유물 상세 페이지 (/items/[id])
- [ ] 소유물 등록 기능
  - [ ] 픽토그램 검색 및 선택
  - [ ] 이름, 개수, 설명 입력
- [ ] 소유물 수정 기능
- [ ] 소유물 삭제 기능

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
