/**
 * 기존 Replicate 이미지를 Supabase Storage로 마이그레이션하는 스크립트
 *
 * 실행 방법:
 * 1. 환경 변수 설정 (.env.local 파일 또는 환경 변수)
 *    - NEXT_PUBLIC_SUPABASE_URL
 *    - SUPABASE_SERVICE_ROLE_KEY
 *
 * 2. ts-node 또는 tsx로 실행
 *    npx tsx scripts/migrate-images.ts
 *
 * 주의사항:
 * - 이 스크립트는 Service Role Key를 사용하므로 RLS를 우회합니다.
 * - 기존 Replicate URL이 아직 유효한 경우에만 마이그레이션이 성공합니다.
 * - 이미 Storage URL인 경우 건너뜁니다.
 */

import { createClient } from "@supabase/supabase-js";

// 환경 변수 로드 (dotenv 사용 시)
import "dotenv/config";

const BUCKET_NAME = "custom-pictograms";
const BATCH_SIZE = 10; // 동시 처리 개수

interface CustomPictogram {
  id: string;
  user_id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

/**
 * 파일 경로 생성
 */
function generateFilePath(userId: string, extension: string = "webp"): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}_${random}.${extension}`;
}

/**
 * URL이 Supabase Storage URL인지 확인
 */
function isStorageUrl(imageUrl: string): boolean {
  return imageUrl.includes("/storage/v1/object/public/custom-pictograms/");
}

/**
 * 이미지 URL에서 확장자 추출
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
  return "webp";
}

/**
 * 단일 이미지 마이그레이션
 */
async function migrateImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  pictogram: CustomPictogram
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
  const { id, user_id, image_url } = pictogram;

  // 이미 Storage URL이면 건너뛰기
  if (isStorageUrl(image_url)) {
    return { success: true, newUrl: image_url };
  }

  try {
    // 1. 외부 이미지 다운로드
    const response = await fetch(image_url);
    if (!response.ok) {
      return {
        success: false,
        error: `이미지 다운로드 실패: ${response.status} ${response.statusText}`,
      };
    }

    const contentType = response.headers.get("content-type") || "image/webp";
    const blob = await response.blob();

    // 2. 파일 경로 생성
    const extension = getExtensionFromUrl(image_url);
    const filePath = generateFilePath(user_id, extension);

    // 3. Storage에 업로드
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, blob, {
        contentType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return {
        success: false,
        error: `Storage 업로드 실패: ${uploadError.message}`,
      };
    }

    // 4. 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    // 5. 데이터베이스 업데이트
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("custom_pictograms")
      .update({ image_url: publicUrl })
      .eq("id", id);

    if (updateError) {
      // Storage에 업로드는 성공했지만 DB 업데이트 실패
      // Storage 파일 삭제 시도
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return {
        success: false,
        error: `DB 업데이트 실패: ${updateError.message}`,
      };
    }

    return { success: true, newUrl: publicUrl };
  } catch (error) {
    return {
      success: false,
      error: `예외 발생: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * 메인 마이그레이션 함수
 */
async function main() {
  console.log("=".repeat(60));
  console.log("Replicate 이미지 → Supabase Storage 마이그레이션 시작");
  console.log("=".repeat(60));

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ 환경 변수가 설정되지 않았습니다.");
    console.error("   필요한 환경 변수:");
    console.error("   - NEXT_PUBLIC_SUPABASE_URL");
    console.error("   - SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  // Supabase Admin 클라이언트 생성
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 모든 커스텀 스케치 조회
  console.log("\n📋 커스텀 스케치 목록 조회 중...");
  const { data: pictograms, error: fetchError } = await supabase
    .from("custom_pictograms")
    .select("*")
    .order("created_at", { ascending: true });

  if (fetchError) {
    console.error("❌ 데이터 조회 실패:", fetchError.message);
    process.exit(1);
  }

  if (!pictograms || pictograms.length === 0) {
    console.log("ℹ️  마이그레이션할 데이터가 없습니다.");
    process.exit(0);
  }

  console.log(`📊 총 ${pictograms.length}개의 스케치 발견`);

  // 이미 Storage URL인 것과 아닌 것 분류
  const toMigrate = pictograms.filter((p) => !isStorageUrl(p.image_url));
  const alreadyMigrated = pictograms.length - toMigrate.length;

  console.log(`   - 이미 마이그레이션됨: ${alreadyMigrated}개`);
  console.log(`   - 마이그레이션 필요: ${toMigrate.length}개`);

  if (toMigrate.length === 0) {
    console.log("\n✅ 모든 이미지가 이미 마이그레이션되었습니다.");
    process.exit(0);
  }

  // 배치 단위로 마이그레이션
  console.log(`\n🚀 마이그레이션 시작 (배치 크기: ${BATCH_SIZE})`);
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const batch = toMigrate.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(toMigrate.length / BATCH_SIZE);

    console.log(`\n[배치 ${batchNum}/${totalBatches}]`);

    const results = await Promise.all(
      batch.map(async (pictogram) => {
        const result = await migrateImage(supabase, pictogram);
        return { pictogram, result };
      })
    );

    for (const { pictogram, result } of results) {
      if (result.success) {
        successCount++;
        console.log(`  ✅ ${pictogram.id.substring(0, 8)}... 성공`);
      } else {
        failCount++;
        console.log(`  ❌ ${pictogram.id.substring(0, 8)}... 실패: ${result.error}`);
      }
    }
  }

  // 결과 요약
  console.log("\n" + "=".repeat(60));
  console.log("마이그레이션 완료");
  console.log("=".repeat(60));
  console.log(`✅ 성공: ${successCount}개`);
  console.log(`❌ 실패: ${failCount}개`);
  console.log(`ℹ️  건너뜀 (이미 마이그레이션됨): ${alreadyMigrated}개`);

  if (failCount > 0) {
    console.log("\n⚠️  일부 이미지 마이그레이션에 실패했습니다.");
    console.log("   실패한 이미지는 Replicate URL이 만료되었을 수 있습니다.");
    process.exit(1);
  }

  console.log("\n✅ 모든 이미지가 성공적으로 마이그레이션되었습니다!");
}

// 스크립트 실행
main().catch((error) => {
  console.error("❌ 예상치 못한 오류:", error);
  process.exit(1);
});
