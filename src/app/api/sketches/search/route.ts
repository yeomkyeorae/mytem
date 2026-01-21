import { NextRequest, NextResponse } from "next/server";
import { searchIcons, getPictograms } from "@/lib/iconify";

/**
 * 스케치 검색 API
 * GET /api/sketches/search?q=keyword&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    // 검색어 검증
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "검색어를 입력해주세요." },
        { status: 400 }
      );
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: "검색어는 최소 2자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // Iconify API로 아이콘 검색
    const searchResult = await searchIcons(query, limit);

    // 아이콘 ID를 스케치 데이터로 변환
    const sketches = await getPictograms(searchResult.icons);

    return NextResponse.json({
      sketches,
      total: searchResult.total,
      query,
    });
  } catch (error) {
    console.error("Sketch search error:", error);

    return NextResponse.json(
      {
        error: "스케치 검색 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
