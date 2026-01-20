-- Supabase Storage 설정
-- 마이그레이션 날짜: 2025-01-20
-- 설명: custom-pictograms 버킷 및 RLS 정책 생성

-- ============================================
-- 1. CUSTOM-PICTOGRAMS 버킷 생성
-- ============================================
-- 주의: 버킷 생성은 Supabase Dashboard에서 직접 수행하는 것이 권장됨
-- 아래 SQL은 참고용으로 포함

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'custom-pictograms',
  'custom-pictograms',
  true,
  5242880,  -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. RLS 정책 설정
-- ============================================

-- RLS 정책: 자신의 폴더에만 업로드 가능
CREATE POLICY "Users can upload to own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'custom-pictograms'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS 정책: 자신의 파일만 삭제 가능
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'custom-pictograms'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS 정책: 공개 읽기 허용 (퍼블릭 버킷)
CREATE POLICY "Anyone can read custom pictograms"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'custom-pictograms');
