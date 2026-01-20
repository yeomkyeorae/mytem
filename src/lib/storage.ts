import { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "custom-pictograms";

/**
 * 파일 경로 생성
 * @param userId 사용자 ID
 * @param extension 파일 확장자 (기본값: png)
 * @returns 생성된 파일 경로 (userId/timestamp_random.extension)
 */
export function generateFilePath(userId: string, extension: string = "png"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}_${random}.${extension}`;
}

/**
 * 이미지 URL에서 확장자 추출
 * @param imageUrl 이미지 URL
 * @returns 확장자 (기본값: png)
 */
function getExtensionFromUrl(imageUrl: string): string {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const match = pathname.match(/\.(\w+)$/);
    if (match) {
      const ext = match[1].toLowerCase();
      if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
        return ext;
      }
    }
  } catch {
    // URL 파싱 실패 시 기본값 사용
  }
  return "webp"; // Replicate flux-schnell은 기본적으로 webp 반환
}

/**
 * 외부 이미지 URL을 Supabase Storage로 전송
 * @param supabase Supabase 클라이언트
 * @param imageUrl 외부 이미지 URL (Replicate 임시 URL 등)
 * @param userId 사용자 ID
 * @returns Storage에 저장된 이미지의 공개 URL
 */
export async function transferImageToStorage(
  supabase: SupabaseClient,
  imageUrl: string,
  userId: string
): Promise<string> {
  // 1. 외부 이미지 다운로드
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`이미지 다운로드 실패: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "image/webp";
  const blob = await response.blob();

  // 2. 파일 경로 생성
  const extension = getExtensionFromUrl(imageUrl);
  const filePath = generateFilePath(userId, extension);

  // 3. Storage에 업로드
  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, blob, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Storage 업로드 실패: ${uploadError.message}`);
  }

  // 4. 공개 URL 반환
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Storage에서 파일 삭제
 * @param supabase Supabase 클라이언트
 * @param imageUrl Storage 이미지 URL
 * @returns 삭제 성공 여부
 */
export async function deleteImageFromStorage(
  supabase: SupabaseClient,
  imageUrl: string
): Promise<boolean> {
  try {
    // Storage URL에서 파일 경로 추출
    const filePath = extractFilePathFromUrl(imageUrl);
    if (!filePath) {
      console.warn("Storage URL이 아니므로 삭제를 건너뜁니다:", imageUrl);
      return true; // 기존 Replicate URL은 삭제할 수 없으므로 성공으로 처리
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Storage 파일 삭제 실패:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Storage 삭제 중 오류:", error);
    return false;
  }
}

/**
 * Storage URL에서 파일 경로 추출
 * @param imageUrl Storage 이미지 URL
 * @returns 파일 경로 또는 null (Storage URL이 아닌 경우)
 */
function extractFilePathFromUrl(imageUrl: string): string | null {
  try {
    // Supabase Storage URL 패턴: .../storage/v1/object/public/bucket-name/path
    const url = new URL(imageUrl);
    const match = url.pathname.match(/\/storage\/v1\/object\/public\/custom-pictograms\/(.+)$/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * URL이 Supabase Storage URL인지 확인
 * @param imageUrl 확인할 URL
 * @returns Supabase Storage URL 여부
 */
export function isStorageUrl(imageUrl: string): boolean {
  return imageUrl.includes("/storage/v1/object/public/custom-pictograms/");
}
