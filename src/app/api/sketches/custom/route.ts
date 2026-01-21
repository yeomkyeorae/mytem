import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImageFromUrl } from "@/lib/supabase/storage";

/**
 * 커스텀 스케치 목록 조회 API
 * GET /api/sketches/custom
 *
 * 현재 인증된 사용자의 커스텀 스케치 목록을 반환합니다.
 */
export async function GET() {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 커스텀 스케치 목록 조회
    const { data: sketches, error } = await supabase
      .from("custom_pictograms")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Custom sketches fetch error:", error);
      return NextResponse.json(
        { error: "스케치 목록을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sketches: sketches || [],
      count: sketches?.length || 0,
    });
  } catch (error) {
    console.error("Custom sketches list error:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * 이미지 URL이 Replicate URL인지 확인합니다.
 * Replicate URL 패턴:
 * - https://replicate.delivery/...
 * - URL에 "pbxt" 포함
 */
function isReplicateUrl(url: string): boolean {
  return url.includes("replicate.delivery") || url.includes("pbxt");
}

/**
 * 이미지 URL이 Supabase Storage URL인지 확인합니다.
 */
function isStorageUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return false;
  }
  return url.includes(supabaseUrl) || url.includes("/storage/v1/object/public/");
}

/**
 * 커스텀 스케치 저장 API
 * POST /api/sketches/custom
 *
 * Body:
 * - imageUrl: string (필수) - 생성된 이미지 URL (Replicate URL 또는 Storage URL)
 * - prompt: string (필수) - 이미지 생성에 사용된 프롬프트
 *
 * 동작:
 * 1. imageUrl이 Replicate URL이면 → Storage에 업로드 후 DB에 저장
 * 2. imageUrl이 Storage URL이면 → 그대로 DB에 저장
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { imageUrl, prompt } = body;

    // 필수 필드 검증
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
      return NextResponse.json(
        { error: "이미지 URL은 필수입니다." },
        { status: 400 }
      );
    }

    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "프롬프트는 필수입니다." },
        { status: 400 }
      );
    }

    // URL 형식 검증
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "올바른 이미지 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 프롬프트 길이 검증
    if (prompt.trim().length > 500) {
      return NextResponse.json(
        { error: "프롬프트는 500자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    // 이미지 URL 처리: Replicate URL이면 Storage에 업로드
    let finalImageUrl = imageUrl.trim();

    if (isReplicateUrl(finalImageUrl)) {
      console.log("[Custom] Replicate URL detected. Uploading to Storage:", finalImageUrl);

      try {
        finalImageUrl = await uploadImageFromUrl(finalImageUrl, user.id);
        console.log("[Custom] Image uploaded to Storage successfully:", finalImageUrl);
      } catch (uploadError) {
        console.error("[Custom] Storage upload error:", uploadError);
        return NextResponse.json(
          { error: "이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요." },
          { status: 500 }
        );
      }
    } else if (isStorageUrl(finalImageUrl)) {
      console.log("[Custom] Storage URL detected. Using as is:", finalImageUrl);
    } else {
      console.log("[Custom] Unknown URL type. Attempting to upload:", finalImageUrl);

      // URL 타입을 알 수 없는 경우에도 업로드 시도
      try {
        finalImageUrl = await uploadImageFromUrl(finalImageUrl, user.id);
        console.log("[Custom] Image uploaded to Storage successfully:", finalImageUrl);
      } catch (uploadError) {
        console.error("[Custom] Storage upload error:", uploadError);
        return NextResponse.json(
          { error: "이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요." },
          { status: 500 }
        );
      }
    }

    // 데이터베이스에 저장 (Storage URL 사용)
    const { data: sketch, error } = await supabase
      .from("custom_pictograms")
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        image_url: finalImageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("[Custom] Database save error:", error);
      return NextResponse.json(
        { error: "스케치 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    console.log("[Custom] Sketch saved to database successfully:", sketch.id);

    return NextResponse.json(
      {
        message: "스케치가 생성되었습니다.",
        sketch,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Custom sketch create error:", error);

    // JSON 파싱 에러 처리
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "잘못된 요청 형식입니다." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
