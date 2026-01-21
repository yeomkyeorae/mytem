import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteImageFromStorage } from "@/lib/supabase/storage";

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

    // 스케치 소유권 확인 및 이미지 URL 가져오기
    const { data: sketch, error: fetchError } = await supabase
      .from("custom_pictograms")
      .select("id, user_id, image_url")
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

    // Storage에서 이미지 삭제 (실패해도 계속 진행)
    try {
      await deleteImageFromStorage(sketch.image_url);
      console.log("Image deleted from storage:", sketch.image_url);
    } catch (storageError) {
      console.error("Storage deletion error (continuing):", storageError);
      // Storage 삭제 실패는 무시하고 DB 레코드는 삭제
    }

    // DB 레코드 삭제
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
