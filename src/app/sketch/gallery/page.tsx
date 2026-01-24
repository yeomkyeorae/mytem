"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import type { CustomSketch } from "@/types/sketch.types";

export default function SketchGalleryPage() {
  const [sketches, setSketches] = useState<CustomSketch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSketches();
  }, []);

  const loadSketches = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("/api/sketches/custom");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "스케치를 불러오는데 실패했습니다.");
      }

      setSketches(data.sketches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 스케치를 삭제하시겠습니까?")) {
      return;
    }

    setDeletingId(id);

    try {
      const response = await fetch(`/api/sketches/custom/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      // 목록에서 제거
      setSketches((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background text-foreground pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">내 스케치</h1>
              <p className="text-foreground/90 mt-2">
                AI로 생성한 스케치를 관리하세요.
              </p>
            </div>
            <Link href="/sketch/create">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                새 스케치 생성
              </Button>
            </Link>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          {/* 로딩 상태 */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-foreground"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-foreground/90">로딩 중...</span>
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {!isLoading && sketches.length === 0 && !error && (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-card flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-muted"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="m21 15-5-5L5 21" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2">아직 생성한 스케치가 없습니다</h2>
              <p className="text-foreground/90 mb-6">
                AI를 이용해 나만의 스케치를 만들어보세요!
              </p>
              <Link href="/sketch/create">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  첫 스케치 생성하기
                </Button>
              </Link>
            </div>
          )}

          {/* 스케치 그리드 */}
          {!isLoading && sketches.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sketches.map((sketch) => (
                <Card
                  key={sketch.id}
                  className="group relative bg-card border-border overflow-hidden"
                >
                  {/* 이미지 */}
                  <div className="p-4">
                    <img
                      src={sketch.image_url}
                      alt={sketch.prompt}
                      className="w-full aspect-square object-contain"
                    />
                  </div>

                  {/* 정보 */}
                  <div className="p-4 pt-0 border-t border-border">
                    <p className="text-sm text-foreground truncate" title={sketch.prompt}>
                      {sketch.prompt}
                    </p>
                    <p className="text-xs text-muted mt-1">
                      {formatDate(sketch.created_at)}
                    </p>
                  </div>

                  {/* 삭제 버튼 (호버 시 표시) */}
                  <button
                    onClick={() => handleDelete(sketch.id)}
                    disabled={deletingId === sketch.id}
                    className="absolute top-2 right-2 p-2 bg-background/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80 disabled:opacity-50"
                    title="삭제"
                  >
                    {deletingId === sketch.id ? (
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    )}
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
