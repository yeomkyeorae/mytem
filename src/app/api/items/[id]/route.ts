import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadImageFile } from "@/lib/supabase/storage";
import type { ItemUpdate } from "@/types/database.types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 아이템 상세 조회 API
 * GET /api/items/[id]
 *
 * 현재 인증된 사용자의 특정 아이템을 반환합니다.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // ID 검증
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "유효하지 않은 아이템 ID입니다." },
        { status: 400 }
      );
    }

    // 아이템 조회
    const { data: item, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "아이템을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      console.error("Item fetch error:", error);
      return NextResponse.json(
        { error: "아이템을 가져오는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Item detail error:", error);
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
 * 아이템 수정 API
 * PUT /api/items/[id]
 *
 * Body:
 * - name?: string - 아이템 이름
 * - description?: string - 설명
 * - quantity?: number - 개수
 * - image_url?: string - 이미지 URL
 * - image_type?: 'default' | 'custom' - 이미지 타입
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // ID 검증
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "유효하지 않은 아이템 ID입니다." },
        { status: 400 }
      );
    }

    // Content-Type 확인
    const contentType = request.headers.get("content-type") || "";

    let name: string | undefined;
    let description: string | undefined;
    let quantity: number | undefined;
    let image_url: string | null | undefined;
    let image_type: "default" | "custom" | "uploaded" | undefined;
    let category_id: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      // FormData 처리 (파일 업로드)
      const formData = await request.formData();

      const nameValue = formData.get("name");
      if (nameValue !== null) name = nameValue as string;

      const descriptionValue = formData.get("description");
      if (descriptionValue !== null) description = descriptionValue as string;

      const quantityValue = formData.get("quantity");
      if (quantityValue !== null) quantity = parseInt(quantityValue as string);

      const imageTypeValue = formData.get("image_type");
      if (imageTypeValue !== null) {
        image_type = imageTypeValue as "default" | "custom" | "uploaded";
      }

      const categoryIdValue = formData.get("category_id");
      if (categoryIdValue !== null) category_id = categoryIdValue as string;

      const uploadedFile = formData.get("uploaded_file") as File | null;

      if (uploadedFile && uploadedFile.size > 0) {
        // Storage에 파일 업로드
        try {
          image_url = await uploadImageFile(uploadedFile, user.id);
          image_type = "uploaded";
          console.log("파일 업로드 성공:", image_url);
        } catch (uploadError) {
          console.error("파일 업로드 오류:", uploadError);
          return NextResponse.json(
            { error: "파일 업로드에 실패했습니다." },
            { status: 500 }
          );
        }
      } else {
        const imageUrlValue = formData.get("image_url");
        if (imageUrlValue !== null) image_url = imageUrlValue as string;
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

    // 업데이트 데이터 구성
    const updateData: ItemUpdate = {
      updated_at: new Date().toISOString(),
    };

    // category_id 검증 및 추가
    if (category_id !== undefined) {
      if (category_id !== null) {
        if (typeof category_id !== "string") {
          return NextResponse.json(
            { error: "유효하지 않은 카테고리입니다." },
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
      }
      updateData.category_id = category_id;
    }

    // name 검증 및 추가
    if (name !== undefined) {
      if (typeof name !== "string" || name.trim() === "") {
        return NextResponse.json(
          { error: "아이템 이름은 비어있을 수 없습니다." },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    // description 추가
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // quantity 검증 및 추가
    if (quantity !== undefined) {
      if (typeof quantity !== "number" || quantity < 1) {
        return NextResponse.json(
          { error: "개수는 1 이상의 숫자여야 합니다." },
          { status: 400 }
        );
      }
      updateData.quantity = quantity;
    }

    // image_url 추가
    if (image_url !== undefined) {
      updateData.image_url = image_url || null;
    }

    // image_type 검증 및 추가
    if (image_type !== undefined) {
      if (!["default", "custom", "uploaded"].includes(image_type)) {
        return NextResponse.json(
          { error: "이미지 타입은 'default', 'custom', 또는 'uploaded'이어야 합니다." },
          { status: 400 }
        );
      }
      updateData.image_type = image_type;
    }

    // 업데이트할 필드가 없는 경우
    if (Object.keys(updateData).length === 1) {
      return NextResponse.json(
        { error: "수정할 항목이 없습니다." },
        { status: 400 }
      );
    }

    // 아이템 수정
    const { data: item, error } = await supabase
      .from("items")
      .update(updateData)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "아이템을 찾을 수 없습니다." },
          { status: 404 }
        );
      }
      console.error("Item update error:", error);
      return NextResponse.json(
        { error: "아이템 수정 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "아이템이 수정되었습니다.",
      item,
    });
  } catch (error) {
    console.error("Item update error:", error);

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

/**
 * 아이템 삭제 API
 * DELETE /api/items/[id]
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
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

    // ID 검증
    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "유효하지 않은 아이템 ID입니다." },
        { status: 400 }
      );
    }

    // 먼저 아이템이 존재하고 본인 것인지 확인
    const { data: existingItem, error: fetchError } = await supabase
      .from("items")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: "아이템을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 아이템 삭제
    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Item delete error:", error);
      return NextResponse.json(
        { error: "아이템 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "아이템이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Item delete error:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
