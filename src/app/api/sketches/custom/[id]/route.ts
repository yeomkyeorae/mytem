import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * 커스텀 스케치 삭제 API
 * DELETE /api/sketches/custom/[id]
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
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    // 스케치 소유권 확인 및 삭제
    const { data: sketch, error: fetchError } = await supabase
      .from("custom_pictograms")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !sketch) {
      return NextResponse.json(
        { error: "스케치를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 소유권 확인
    if (sketch.user_id !== user.id) {
      return NextResponse.json(
        { error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 삭제 수행
    const { error: deleteError } = await supabase
      .from("custom_pictograms")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Custom sketch delete error:", deleteError);
      return NextResponse.json(
        { error: "스케치 삭제 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "스케치가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("Custom sketch delete error:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
