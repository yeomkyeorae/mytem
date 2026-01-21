import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/categories
 * 현재 사용자의 카테고리 목록 조회
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("카테고리 조회 실패:", error);
      return NextResponse.json(
        { error: "카테고리를 불러오는 데 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      categories: categories || [],
      count: categories?.length || 0,
    });
  } catch (error) {
    console.error("카테고리 조회 중 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/categories
 * 새 카테고리 생성
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증되지 않은 사용자입니다." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    // 검증: 이름 필수
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "카테고리 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();

    // 검증: 이름 길이
    if (trimmedName.length === 0) {
      return NextResponse.json(
        { error: "카테고리 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    if (trimmedName.length > 50) {
      return NextResponse.json(
        { error: "카테고리 이름은 50자 이하여야 합니다." },
        { status: 400 }
      );
    }

    // 중복 체크
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", trimmedName)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "이미 존재하는 카테고리 이름입니다." },
        { status: 409 }
      );
    }

    // 카테고리 생성
    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        user_id: user.id,
        name: trimmedName,
      })
      .select()
      .single();

    if (error) {
      console.error("카테고리 생성 실패:", error);

      // UNIQUE 제약 조건 위반 에러 처리
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "이미 존재하는 카테고리 이름입니다." },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: "카테고리 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "카테고리가 생성되었습니다.",
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("카테고리 생성 중 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
