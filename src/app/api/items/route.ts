import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImageFile } from "@/lib/supabase/storage";
import type { ItemInsert } from "@/types/database.types";

/**
 * 아이템 목록 조회 API
 * GET /api/items
 * GET /api/items?categoryId=all (전체 아이템)
 * GET /api/items?categoryId={uuid} (특정 카테고리 아이템)
 * GET /api/items?sortBy=name&sortOrder=asc (정렬 옵션)
 *
 * 현재 인증된 사용자의 아이템 목록을 반환합니다.
 * 정렬: sortBy (name | created_at), sortOrder (asc | desc)
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
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // sortBy 검증
    const validSortBy = ["name", "created_at"];
    const sortColumn = validSortBy.includes(sortBy) ? sortBy : "created_at";

    // sortOrder 검증
    const validSortOrder = ["asc", "desc"];
    const ascending = validSortOrder.includes(sortOrder) ? sortOrder === "asc" : false;

    // 아이템 목록 조회 (카테고리 JOIN)
    let query = supabase.from("items").select("*, categories(id, name)").eq("user_id", user.id);

    // 카테고리 필터링
    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", categoryId);
    }

    // 정렬 적용
    const { data: items, error } = await query.order(sortColumn, { ascending });

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
 * Body (JSON 또는 FormData):
 * - name: string (필수) - 아이템 이름
 * - description?: string - 설명
 * - quantity?: number - 개수 (기본값: 1)
 * - image_url?: string - 이미지 URL
 * - image_type?: 'default' | 'custom' | 'uploaded' - 이미지 타입
 * - category_id: string (필수) - 카테고리 ID
 * - uploaded_file?: File - 업로드할 이미지 파일 (FormData only)
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

    // Content-Type 확인
    const contentType = request.headers.get("content-type") || "";

    let name: string;
    let description: string | undefined;
    let quantity: number | undefined;
    let image_url: string | null = null;
    let image_type: "default" | "custom" | "uploaded" = "default";
    let category_id: string;

    if (contentType.includes("multipart/form-data")) {
      // FormData 처리 (파일 업로드)
      const formData = await request.formData();

      name = formData.get("name") as string;
      description = formData.get("description") as string | undefined;
      quantity = formData.get("quantity")
        ? parseInt(formData.get("quantity") as string)
        : undefined;
      image_type = (formData.get("image_type") as "default" | "custom" | "uploaded") || "default";
      category_id = formData.get("category_id") as string;

      const uploadedFile = formData.get("uploaded_file") as File | null;

      if (uploadedFile && image_type === "uploaded") {
        // Storage에 파일 업로드
        try {
          image_url = await uploadImageFile(uploadedFile, user.id);
          console.log("파일 업로드 성공:", image_url);
        } catch (uploadError) {
          console.error("파일 업로드 오류:", uploadError);
          return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 });
        }
      } else {
        image_url = formData.get("image_url") as string | null;
      }
    } else {
      // JSON 처리 (기존 방식 - 스케치만 선택)
      const body = await request.json();
      name = body.name;
      description = body.description;
      quantity = body.quantity;
      image_url = body.image_url;
      image_type = body.image_type;
      category_id = body.category_id;
    }

    // 필수 필드 검증
    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json({ error: "아이템 이름은 필수입니다." }, { status: 400 });
    }

    if (!category_id || typeof category_id !== "string") {
      return NextResponse.json({ error: "카테고리를 선택해주세요." }, { status: 400 });
    }

    // 카테고리 검증
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id)
      .eq("user_id", user.id)
      .single();

    if (categoryError || !category) {
      return NextResponse.json({ error: "유효하지 않은 카테고리입니다." }, { status: 400 });
    }

    // image_type 검증 (uploaded 추가)
    if (!["default", "custom", "uploaded"].includes(image_type)) {
      return NextResponse.json({ error: "이미지 타입이 올바르지 않습니다." }, { status: 400 });
    }

    // 아이템 데이터 생성
    const itemData: ItemInsert = {
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      quantity: quantity || 1,
      image_url: image_url || null,
      image_type: image_type,
      category_id: category_id,
    };

    // 아이템 등록
    const { data: item, error } = await supabase.from("items").insert(itemData).select().single();

    if (error) {
      console.error("아이템 등록 오류:", error);
      return NextResponse.json({ error: "아이템 등록 중 오류가 발생했습니다." }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: "아이템이 등록되었습니다.",
        item,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
