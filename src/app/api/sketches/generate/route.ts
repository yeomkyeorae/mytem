import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSketch } from "@/lib/replicate";

/**
 * AI 스케치 이미지 생성 API
 * POST /api/sketches/generate
 *
 * Body:
 * - prompt: string (필수) - 이미지 생성 프롬프트
 *
 * Response:
 * - imageUrl: string - 생성된 이미지 URL
 * - prompt: string - 사용된 프롬프트
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
    let imageUrl: string;
    try {
      imageUrl = await generateSketch(prompt.trim());
    } catch (genError) {
      console.error("Image generation error:", genError);
      return NextResponse.json(
        { error: "이미지 생성에 실패했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        imageUrl,
        prompt: prompt.trim(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sketch generation error:", error);

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
