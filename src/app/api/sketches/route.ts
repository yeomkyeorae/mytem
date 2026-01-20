import { NextRequest, NextResponse } from "next/server";
import { getSketches, RECOMMENDED_ICONS } from "@/lib/iconify";

/**
 * 기본 스케치 목록 API
 * GET /api/sketches?category=clothing
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");

    let iconIds: string[];

    if (category && RECOMMENDED_ICONS[category]) {
      // 특정 카테고리의 추천 아이콘
      iconIds = RECOMMENDED_ICONS[category];
    } else {
      // 모든 카테고리의 아이콘 (각 카테고리에서 2개씩)
      iconIds = Object.values(RECOMMENDED_ICONS)
        .flat()
        .slice(0, 20);
    }

    // 아이콘 데이터 가져오기
    const sketches = await getSketches(iconIds);

    // 카테고리별로 그룹화
    const categories = Object.keys(RECOMMENDED_ICONS).map((cat) => ({
      name: cat,
      label: getCategoryLabel(cat),
    }));

    return NextResponse.json({
      sketches,
      categories,
      category: category || "all",
    });
  } catch (error) {
    console.error("Sketch list error:", error);

    return NextResponse.json(
      {
        error: "스케치 목록을 가져오는 중 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    clothing: "의류",
    electronics: "전자기기",
    accessories: "액세서리",
    household: "생활용품",
    sports: "스포츠",
    books: "도서",
  };

  return labels[category] || category;
}
