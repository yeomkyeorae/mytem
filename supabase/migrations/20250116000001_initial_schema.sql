-- Mytem 초기 데이터베이스 스키마
-- 마이그레이션 날짜: 2025-01-16
-- 설명: profiles, items, pictograms, custom_pictograms 테이블 및 RLS 정책 생성

-- ============================================
-- 1. PROFILES 테이블 (사용자 프로필)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- profiles 테이블 코멘트
COMMENT ON TABLE public.profiles IS '사용자 프로필 정보를 저장하는 테이블';
COMMENT ON COLUMN public.profiles.id IS 'auth.users 테이블의 id 참조 (Primary Key)';
COMMENT ON COLUMN public.profiles.email IS '사용자 이메일';
COMMENT ON COLUMN public.profiles.display_name IS '표시 이름';
COMMENT ON COLUMN public.profiles.avatar_url IS '프로필 이미지 URL';

-- ============================================
-- 2. ITEMS 테이블 (소유물)
-- ============================================
CREATE TABLE IF NOT EXISTS public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1 NOT NULL CHECK (quantity >= 0),
  image_url TEXT,
  image_type TEXT CHECK (image_type IN ('default', 'custom')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- items 테이블 코멘트
COMMENT ON TABLE public.items IS '사용자의 소유물 정보를 저장하는 테이블';
COMMENT ON COLUMN public.items.id IS '소유물 고유 식별자';
COMMENT ON COLUMN public.items.user_id IS '소유자 (auth.users 참조)';
COMMENT ON COLUMN public.items.name IS '소유물 이름';
COMMENT ON COLUMN public.items.description IS '소유물 설명';
COMMENT ON COLUMN public.items.quantity IS '소유물 개수';
COMMENT ON COLUMN public.items.image_url IS '픽토그램 이미지 URL';
COMMENT ON COLUMN public.items.image_type IS '이미지 타입 (default: 기본 픽토그램, custom: 커스텀 생성)';

-- items 테이블 인덱스
CREATE INDEX IF NOT EXISTS items_user_id_idx ON public.items(user_id);
CREATE INDEX IF NOT EXISTS items_name_idx ON public.items(name);

-- ============================================
-- 3. PICTOGRAMS 테이블 (기본 픽토그램)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pictograms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- pictograms 테이블 코멘트
COMMENT ON TABLE public.pictograms IS '시스템 제공 기본 픽토그램 이미지 테이블';
COMMENT ON COLUMN public.pictograms.id IS '픽토그램 고유 식별자';
COMMENT ON COLUMN public.pictograms.name IS '픽토그램 이름';
COMMENT ON COLUMN public.pictograms.keywords IS '검색 키워드 배열';
COMMENT ON COLUMN public.pictograms.image_url IS '픽토그램 이미지 URL';
COMMENT ON COLUMN public.pictograms.category IS '카테고리 (의류, 전자기기, 생활용품 등)';

-- pictograms 테이블 인덱스
CREATE INDEX IF NOT EXISTS pictograms_name_idx ON public.pictograms(name);
CREATE INDEX IF NOT EXISTS pictograms_category_idx ON public.pictograms(category);
CREATE INDEX IF NOT EXISTS pictograms_keywords_idx ON public.pictograms USING GIN(keywords);

-- ============================================
-- 4. CUSTOM_PICTOGRAMS 테이블 (사용자 커스텀 픽토그램)
-- ============================================
CREATE TABLE IF NOT EXISTS public.custom_pictograms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- custom_pictograms 테이블 코멘트
COMMENT ON TABLE public.custom_pictograms IS '사용자가 AI로 생성한 커스텀 픽토그램 테이블';
COMMENT ON COLUMN public.custom_pictograms.id IS '커스텀 픽토그램 고유 식별자';
COMMENT ON COLUMN public.custom_pictograms.user_id IS '생성자 (auth.users 참조)';
COMMENT ON COLUMN public.custom_pictograms.prompt IS '이미지 생성에 사용된 프롬프트';
COMMENT ON COLUMN public.custom_pictograms.image_url IS '생성된 픽토그램 이미지 URL';

-- custom_pictograms 테이블 인덱스
CREATE INDEX IF NOT EXISTS custom_pictograms_user_id_idx ON public.custom_pictograms(user_id);

-- ============================================
-- 5. UPDATED_AT 자동 업데이트 함수
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- profiles 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- items 테이블 updated_at 트리거
DROP TRIGGER IF EXISTS set_items_updated_at ON public.items;
CREATE TRIGGER set_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. 신규 사용자 프로필 자동 생성 함수
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 신규 생성 시 profiles 자동 생성 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) 설정
-- ============================================

-- profiles 테이블 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- profiles RLS 정책: 사용자는 자신의 프로필만 조회 가능
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- profiles RLS 정책: 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- items 테이블 RLS 활성화
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- items RLS 정책: 사용자는 자신의 소유물만 조회 가능
CREATE POLICY "Users can view own items"
  ON public.items
  FOR SELECT
  USING (auth.uid() = user_id);

-- items RLS 정책: 사용자는 자신의 소유물만 생성 가능
CREATE POLICY "Users can create own items"
  ON public.items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- items RLS 정책: 사용자는 자신의 소유물만 수정 가능
CREATE POLICY "Users can update own items"
  ON public.items
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- items RLS 정책: 사용자는 자신의 소유물만 삭제 가능
CREATE POLICY "Users can delete own items"
  ON public.items
  FOR DELETE
  USING (auth.uid() = user_id);

-- pictograms 테이블 RLS 활성화
ALTER TABLE public.pictograms ENABLE ROW LEVEL SECURITY;

-- pictograms RLS 정책: 모든 인증된 사용자가 조회 가능 (기본 픽토그램은 공용)
CREATE POLICY "Anyone can view pictograms"
  ON public.pictograms
  FOR SELECT
  TO authenticated
  USING (true);

-- custom_pictograms 테이블 RLS 활성화
ALTER TABLE public.custom_pictograms ENABLE ROW LEVEL SECURITY;

-- custom_pictograms RLS 정책: 사용자는 자신의 커스텀 픽토그램만 조회 가능
CREATE POLICY "Users can view own custom pictograms"
  ON public.custom_pictograms
  FOR SELECT
  USING (auth.uid() = user_id);

-- custom_pictograms RLS 정책: 사용자는 자신의 커스텀 픽토그램만 생성 가능
CREATE POLICY "Users can create own custom pictograms"
  ON public.custom_pictograms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- custom_pictograms RLS 정책: 사용자는 자신의 커스텀 픽토그램만 삭제 가능
CREATE POLICY "Users can delete own custom pictograms"
  ON public.custom_pictograms
  FOR DELETE
  USING (auth.uid() = user_id);
