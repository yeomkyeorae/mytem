import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSketch } from "@/lib/replicate";
import { transferImageToStorage } from "@/lib/storage";

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
 * 커스텀 스케치 생성 API
 * POST /api/sketches/custom
 *
 * Body:
 * - prompt: string (필수) - 이미지 생성 프롬프트
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
    const { prompt } = body;

    // 필수 필드 검증
    if (!prompt || typeof prompt !== "string" || prompt.trim() === "") {
      return NextResponse.json(
        { error: "프롬프트는 필수입니다." },
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

    // Replicate API로 이미지 생성
    let tempImageUrl: string;
    try {
      tempImageUrl = await generateSketch(prompt.trim());
    } catch (genError) {
      console.error("Image generation error:", genError);
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // Supabase Storage에 이미지 영구 저장
    let imageUrl: string;
    try {
      imageUrl = await transferImageToStorage(supabase, tempImageUrl, user.id);
    } catch (storageError) {
      console.error("Storage transfer error:", storageError);
      return NextResponse.json(
        { error: "이미지 저장에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    // 데이터베이스에 저장
    const { data: sketch, error } = await supabase
      .from("custom_pictograms")
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        image_url: imageUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Custom sketch save error:", error);
      return NextResponse.json(
        { error: "스케치 저장 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

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
