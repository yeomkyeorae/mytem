"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import ItemCard from "@/components/ItemCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import type { Item } from "@/types/database.types";

export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [error, setError] = useState("");

  // 미인증 시 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // 아이템 목록 가져오기
  useEffect(() => {
    if (isAuthenticated) {
      fetchItems();
    }
  }, [isAuthenticated]);

  const fetchItems = async () => {
    setIsItemsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/items");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("아이템 목록을 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsItemsLoading(false);
    }
  };

  // 통계 계산
  const stats = useMemo(() => ({
    totalCount: items.length,
    customSketchCount: items.filter(item => item.image_type === "custom").length,
  }), [items]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">대시보드</h1>
          <p className="text-foreground/90">나의 아이템을 관리하세요</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
            <button onClick={fetchItems} className="ml-4 underline hover:no-underline">
              다시 시도
            </button>
          </div>
        )}

        {/* Quick Stats - 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-6 border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground mb-1">전체 아이템</p>
            <p className="text-3xl font-bold">
              {isItemsLoading ? <LoadingSpinner /> : stats.totalCount}
            </p>
          </div>
          <div className="p-6 border border-border rounded-xl bg-card">
            <p className="text-sm text-muted-foreground mb-1">커스텀 스케치</p>
            <p className="text-3xl font-bold">
              {isItemsLoading ? <LoadingSpinner /> : stats.customSketchCount}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/items/new"
              className="p-6 border border-border rounded-xl bg-card hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">아이템 등록</p>
                  <p className="text-sm text-foreground/90">새로운 아이템을 추가하세요</p>
                </div>
              </div>
            </Link>
            <Link
              href="/sketch/create"
              className="p-6 border border-border rounded-xl bg-card hover:bg-card/80 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center group-hover:bg-muted/80 transition-colors">
                  <svg
                    className="w-6 h-6 text-muted-foreground"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">스케치 생성</p>
                  <p className="text-sm text-foreground/90">AI로 커스텀 이미지를 만드세요</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Items */}
        {!isItemsLoading && items.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">최근 등록된 아이템</h2>
              <Link href="/items" className="text-sm text-muted-foreground hover:text-foreground">
                전체 보기 →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {items.slice(0, 5).map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isItemsLoading && items.length === 0 && !error && (
          <div className="border border-dashed border-border rounded-xl p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg
                className="w-8 h-8 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">아직 등록된 아이템이 없습니다</h3>
            <p className="text-foreground/90 mb-6">
              첫 번째 아이템을 등록하고 관리를 시작하세요
            </p>
            <Link
              href="/items/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              아이템 등록하기
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted">
        <p>&copy; 2025 Mytem. All rights reserved.</p>
      </footer>
    </div>
  );
}
