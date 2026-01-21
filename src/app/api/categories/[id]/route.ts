import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE /api/categories/[id]
 * 카테고리 삭제
 * 연관된 아이템의 category_id는 자동으로 NULL로 변경됨 (ON DELETE SET NULL)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "카테고리 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 카테고리 존재 여부 및 소유권 확인
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!category) {
      return NextResponse.json(
        { error: "카테고리를 찾을 수 없거나 삭제 권한이 없습니다." },
        { status: 404 }
      );
    }

    // 카테고리 삭제 (연관된 items의 category_id는 자동으로 NULL로 설정됨)
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("카테고리 삭제 실패:", error);
      return NextResponse.json(
        { error: "카테고리 삭제에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "카테고리가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("카테고리 삭제 중 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
