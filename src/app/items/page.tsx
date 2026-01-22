"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ItemCard from "@/components/ItemCard";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import type { Item, Category } from "@/types/database.types";

// 정적 JSX를 컴포넌트 외부로 호이스팅하여 리렌더링 시 재생성 방지
const DropdownIcon = (
  <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 pointer-events-none"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function ItemsPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "created_at">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 인증 확인 후 미인증 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // 카테고리 및 아이템 목록 가져오기 (병렬 실행)
  useEffect(() => {
    if (isAuthenticated) {
      // 독립적인 요청들을 병렬로 실행하여 로딩 시간 단축
      Promise.all([fetchCategories(), fetchItems()]);
    }
  }, [isAuthenticated]);

  // 카테고리 선택 또는 정렬 변경 시 아이템 재로드
  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [selectedCategoryId, sortBy, sortOrder]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");

      if (!response.ok) {
        console.error("카테고리 목록을 불러오는데 실패했습니다.");
        return;
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("카테고리 로드 에러:", err);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    setError("");

    try {
      // 쿼리 파라미터 구성
      const params = new URLSearchParams();

      if (selectedCategoryId !== "all") {
        params.append("categoryId", selectedCategoryId);
      }

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const url = `/api/items?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("아이템 목록을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setItems(data.items || []);

      // "전체" 선택 시 총 개수 업데이트
      if (selectedCategoryId === "all") {
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner className="h-5 w-5 text-white" />
          <span className="text-white/60">로딩 중...</span>
        </div>
      </div>
    );
  }

  // 미인증 상태
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pt-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">내 아이템</h1>
            <p className="text-white/50">
              {items.length > 0
                ? `총 ${items.length}개의 아이템을 관리하고 있습니다.`
                : "등록된 아이템이 없습니다."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 정렬 드롭다운 */}
            <div className="relative">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split("-") as ["name" | "created_at", "asc" | "desc"];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white appearance-none cursor-pointer hover:bg-white/20 transition-colors pr-10"
              >
                <option value="created_at-desc" className="bg-black text-white">최신순</option>
                <option value="created_at-asc" className="bg-black text-white">오래된순</option>
                <option value="name-asc" className="bg-black text-white">이름순 (가나다)</option>
                <option value="name-desc" className="bg-black text-white">이름순 (가나다 역순)</option>
              </select>
              {/* 드롭다운 아이콘 */}
              {DropdownIcon}
            </div>

            <Link href="/items/new">
              <Button className="bg-white text-black hover:bg-white/90">
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
                새 아이템 등록
              </Button>
            </Link>
          </div>
        </div>

        {/* 카테고리 필터 */}
        {categories.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {/* "전체" 버튼 */}
              <button
                onClick={() => setSelectedCategoryId("all")}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                  selectedCategoryId === "all"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
                )}
              >
                전체 ({totalCount})
              </button>

              {/* 각 카테고리 버튼 */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
                    selectedCategoryId === category.id
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 카테고리가 없을 때 안내 메시지 */}
        {categories.length === 0 && items.length > 0 && !isLoading && (
          <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-white/60 text-sm">
              카테고리를 생성하여 아이템을 분류해보세요.{" "}
              <Link href="/categories" className="underline hover:text-white">
                카테고리 관리
              </Link>
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
            <button
              onClick={fetchItems}
              className="ml-4 underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <LoadingSpinner className="h-5 w-5 text-white" />
              <span className="text-white/60">아이템을 불러오는 중...</span>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-white/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            {selectedCategoryId === "all" ? (
              <>
                <h2 className="text-xl font-semibold mb-2">아직 등록된 아이템이 없습니다</h2>
                <p className="text-white/50 mb-6 text-center">
                  첫 번째 아이템을 등록하고 체계적으로 관리해보세요.
                </p>
                <Link href="/items/new">
                  <Button className="bg-white text-black hover:bg-white/90">
                    <svg
                      className="w-4 h-4 mr-2"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    첫 아이템 등록하기
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-2">이 카테고리에 아이템이 없습니다</h2>
                <p className="text-white/50 mb-6 text-center">
                  {categories.find((c) => c.id === selectedCategoryId)?.name} 카테고리에 아이템을 추가해보세요.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setSelectedCategoryId("all")}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/10"
                  >
                    전체 아이템 보기
                  </Button>
                  <Link href="/items/new">
                    <Button className="bg-white text-black hover:bg-white/90">
                      <svg
                        className="w-4 h-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      아이템 등록하기
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-xs text-white/30">
          <p>&copy; 2025 Mytem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
