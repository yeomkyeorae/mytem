"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import type { Item } from "@/types/database.types";
import Navbar from "@/components/Navbar";

export default function ItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 인증 확인 후 미인증 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // 아이템 상세 정보 가져오기
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchItem();
    }
  }, [isAuthenticated, id]);

  const fetchItem = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/items/${id}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 404) {
          setError("아이템을 찾을 수 없습니다.");
          return;
        }
        throw new Error("아이템을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setItem(data.item);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "아이템 삭제에 실패했습니다.");
      }

      toast({
        title: "삭제 완료",
        description: "아이템이 성공적으로 삭제되었습니다.",
      });

      router.push("/items");
    } catch (err) {
      toast({
        title: "삭제 실패",
        description: err instanceof Error ? err.message : "오류가 발생했습니다.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // 이미지 렌더링
  const renderImage = () => {
    if (!item?.image_url) {
      return (
        <svg
          className="w-24 h-24 text-white/30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    }

    if (item.image_url.trim().startsWith("<svg")) {
      return (
        <div
          className="w-32 h-32 flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:text-white"
          dangerouslySetInnerHTML={{ __html: item.image_url }}
        />
      );
    }

    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={item.image_url} alt={item.name} className="w-32 h-32 object-contain" />
    );
  };

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
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
      <main className="max-w-3xl mx-auto px-6 py-8 pt-24">
        {/* Back Link */}
        <Link
          href="/items"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          내 아이템으로 돌아가기
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
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
              <span className="text-white/60">아이템 정보를 불러오는 중...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-red-400">{error}</h2>
            <p className="text-white/50 mb-6">요청한 아이템을 찾을 수 없거나 접근할 수 없습니다.</p>
            <Link href="/items">
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                목록으로 돌아가기
              </Button>
            </Link>
          </div>
        )}

        {/* Item Detail */}
        {item && !isLoading && (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {/* Item Image */}
            <div className="flex items-center justify-center py-12 bg-white/5">{renderImage()}</div>

            {/* Item Info */}
            <div className="p-6">
              <h1 className="text-2xl font-bold mb-2">{item.name}</h1>

              {/* Quantity */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-white/50">개수:</span>
                <span className="font-medium">{item.quantity}개</span>
              </div>

              {/* Description */}
              {item.description && (
                <div className="mb-6">
                  <h2 className="text-sm text-white/50 mb-2">설명</h2>
                  <p className="text-white/80 whitespace-pre-wrap">{item.description}</p>
                </div>
              )}

              {/* Meta Info */}
              <div className="text-xs text-white/30 pt-4 border-t border-white/10">
                <p>등록일: {new Date(item.created_at).toLocaleDateString("ko-KR")}</p>
                <p>수정일: {new Date(item.updated_at).toLocaleDateString("ko-KR")}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-white/5 border-t border-white/10 flex gap-3">
              <Link href={`/items/${id}/edit`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-black hover:bg-green-500/10 hover:text-green-300"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  수정
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                  <path d="M10 11v6M14 11v6" />
                </svg>
                삭제
              </Button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
            <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-2">아이템 삭제</h2>
              <p className="text-white/60 mb-6">
                정말로 &quot;{item?.name}&quot;을(를) 삭제하시겠습니까?
                <br />이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-500 text-white hover:bg-red-600"
                >
                  {isDeleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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
                      삭제 중...
                    </span>
                  ) : (
                    "삭제"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="flex-1 border-white/20 text-black hover:bg-green-500/10 hover:text-green-300"
                >
                  취소
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 text-center text-xs text-white/30">
          <p>&copy; 2025 Mytem. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
