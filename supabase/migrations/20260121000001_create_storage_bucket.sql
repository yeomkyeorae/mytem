-- Supabase Storage 버킷 생성 및 RLS 정책 설정
-- 커스텀 스케치 이미지를 저장하기 위한 Storage bucket

-- 1. Storage bucket 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'custom-pictograms',
  'custom-pictograms',
  true, -- public access 허용
  5242880, -- 5MB (5 * 1024 * 1024 bytes)
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS 정책 설정

-- 2.1. 모든 사용자가 이미지 조회 가능 (public access)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'custom-pictograms');

-- 2.2. 인증된 사용자만 업로드 가능
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'custom-pictograms'
  AND auth.role() = 'authenticated'
);

-- 2.3. 본인이 업로드한 이미지만 삭제 가능
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'custom-pictograms'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2.4. 본인이 업로드한 이미지만 업데이트 가능
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'custom-pictograms'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'custom-pictograms'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
