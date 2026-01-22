import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ItemInsert } from "@/types/database.types";

/**
 * 아이템 목록 조회 API
 * GET /api/items
 * GET /api/items?categoryId=all (전체 아이템)
 * GET /api/items?categoryId={uuid} (특정 카테고리 아이템)
 *
 * 현재 인증된 사용자의 아이템 목록을 반환합니다.
 * 정렬: 최신순 (created_at DESC)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // 인증 확인
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    // 아이템 목록 조회 (카테고리 JOIN)
    let query = supabase
      .from("items")
      .select("*, categories(id, name)")
      .eq("user_id", user.id);

    // 카테고리 필터링
    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    const { data: items, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Items fetch error:", error);
      return NextResponse.json(
        { error: "아이템 목록을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("Items list error:", error);
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
 * 아이템 등록 API
 * POST /api/items
 *
 * Body:
 * - name: string (필수) - 아이템 이름
 * - description?: string - 설명
 * - quantity?: number - 개수 (기본값: 1)
 * - image_url?: string - 이미지 URL
 * - image_type?: 'default' | 'custom' - 이미지 타입
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
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { name, description, quantity, image_url, image_type, category_id } = body;

    // 필수 필드 검증
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "아이템 이름은 필수입니다." },
        { status: 400 }
      );
    }

    // category_id 검증
    if (!category_id || typeof category_id !== "string") {
      return NextResponse.json(
        { error: "카테고리를 선택해주세요." },
        { status: 400 }
      );
    }

    // 카테고리 존재 여부 및 소유권 검증
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json(
        { error: "유효하지 않은 카테고리입니다." },
        { status: 400 }
      );
    }

    // quantity 검증
    if (quantity !== undefined && (typeof quantity !== "number" || quantity < 1)) {
      return NextResponse.json(
        { error: "개수는 1 이상의 숫자여야 합니다." },
        { status: 400 }
      );
    }

    // image_type 검증
    if (image_type !== undefined && !["default", "custom"].includes(image_type)) {
      return NextResponse.json(
        { error: "이미지 타입은 'default' 또는 'custom'이어야 합니다." },
        { status: 400 }
      );
    }

    // 아이템 데이터 생성
    const itemData: ItemInsert = {
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      quantity: quantity || 1,
      image_url: image_url || null,
      image_type: image_type || "default",
      category_id: category_id,
    };

    // 아이템 등록
    const { data: item, error } = await supabase
      .from("items")
      .insert(itemData)
      .select()
      .single();

    if (error) {
      console.error("Item create error:", error);
      return NextResponse.json(
        { error: "아이템 등록 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "아이템이 등록되었습니다.",
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Item create error:", error);

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
