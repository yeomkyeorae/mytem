import { createClient } from "./server";
import { randomUUID } from "crypto";

/**
 * Supabase Storage 헬퍼 함수
 * custom-pictograms 버킷에 이미지를 업로드, 삭제, URL 생성하는 기능 제공
 */

const BUCKET_NAME = "custom-pictograms";

/**
 * Content-Type에서 파일 확장자를 결정합니다.
 */
function getFileExtension(contentType: string): string {
  const mimeTypeMap: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };

  return mimeTypeMap[contentType.toLowerCase()] || "png";
}

/**
 * Replicate URL에서 이미지를 다운로드하여 Supabase Storage에 업로드합니다.
 *
 * @param imageUrl - Replicate에서 생성된 이미지 URL
 * @param userId - 사용자 ID (폴더명으로 사용)
 * @param fileName - 선택적 파일명 (제공되지 않으면 UUID 사용)
 * @returns Supabase Storage의 public URL
 * @throws 이미지 다운로드 또는 업로드 실패 시 에러
 */
export async function uploadImageFromUrl(
  imageUrl: string,
  userId: string,
  fileName?: string
): Promise<string> {
  try {
    console.log("Starting image upload from URL:", imageUrl);

    // 1. Replicate URL에서 이미지 다운로드
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch image from URL: ${response.status} ${response.statusText}`
      );
    }

    const contentType = response.headers.get("content-type") || "image/png";
    console.log("Image content-type:", contentType);

    // 이미지가 아닌 경우 에러
    if (!contentType.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}. Expected image/*`);
    }

    const imageBlob = await response.blob();
    console.log("Image blob size:", imageBlob.size, "bytes");

    // 5MB 제한 확인
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (imageBlob.size > MAX_SIZE) {
      throw new Error(
        `Image size (${imageBlob.size} bytes) exceeds maximum allowed size (${MAX_SIZE} bytes)`
      );
    }

    // 2. 파일명 생성
    const fileExtension = getFileExtension(contentType);
    const generatedFileName = fileName || `${randomUUID()}.${fileExtension}`;
    const filePath = `${userId}/${generatedFileName}`;

    console.log("Uploading to path:", filePath);

    // 3. Supabase Storage에 업로드
    const supabase = await createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, imageBlob, {
        contentType,
        upsert: false, // 덮어쓰기 비활성화
      });

    if (error) {
      console.error("Supabase storage upload error:", error);
      throw new Error(`Failed to upload image to storage: ${error.message}`);
    }

    console.log("Upload successful, path:", data.path);

    // 4. Public URL 생성 및 반환
    const publicUrl = getPublicUrl(data.path);
    console.log("Generated public URL:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("uploadImageFromUrl error:", error);
    throw new Error(
      `Image upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Supabase Storage에서 이미지를 삭제합니다.
 *
 * @param imageUrl - 삭제할 이미지의 public URL 또는 storage path
 * @throws 삭제 실패 시 에러
 */
export async function deleteImageFromStorage(imageUrl: string): Promise<void> {
  try {
    console.log("Deleting image from storage:", imageUrl);

    // URL에서 storage path 추출
    const filePath = extractStoragePath(imageUrl);

    if (!filePath) {
      console.warn("Could not extract storage path from URL:", imageUrl);
      // Replicate URL이거나 외부 URL인 경우 삭제하지 않음
      return;
    }

    console.log("Extracted file path:", filePath);

    const supabase = await createClient();
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error("Supabase storage delete error:", error);
      throw new Error(`Failed to delete image from storage: ${error.message}`);
    }

    console.log("Image deleted successfully:", filePath);
  } catch (error) {
    console.error("deleteImageFromStorage error:", error);
    throw new Error(
      `Image deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * Storage path로부터 public URL을 생성합니다.
 *
 * @param path - Storage 내 파일 경로 (예: "userId/uuid.png")
 * @returns public URL
 */
export function getPublicUrl(path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL environment variable is not set");
  }

  // Supabase Storage public URL 형식
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
}

/**
 * Public URL에서 storage path를 추출합니다.
 * Supabase Storage URL이 아닌 경우 null을 반환합니다.
 *
 * @param url - 이미지 URL
 * @returns storage path 또는 null
 */
function extractStoragePath(url: string): string | null {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    if (!supabaseUrl) {
      return null;
    }

    // Supabase Storage URL 패턴 확인
    const storagePrefix = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/`;

    if (!url.startsWith(storagePrefix)) {
      return null;
    }

    // prefix 제거하여 path 추출
    const path = url.substring(storagePrefix.length);

    // URL 디코딩
    return decodeURIComponent(path);
  } catch (error) {
    console.error("extractStoragePath error:", error);
    return null;
  }
}
