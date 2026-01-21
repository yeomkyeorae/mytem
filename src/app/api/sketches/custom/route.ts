import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
 * 커스텀 스케치 저장 API
 * POST /api/sketches/custom
 *
 * Body:
 * - imageUrl: string (필수) - 생성된 이미지 URL
 * - prompt: string (필수) - 이미지 생성에 사용된 프롬프트
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

    // 데이터베이스에 저장
    const { data: sketch, error } = await supabase
      .from("custom_pictograms")
      .insert({
        user_id: user.id,
        prompt: prompt.trim(),
        image_url: imageUrl.trim(),
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
