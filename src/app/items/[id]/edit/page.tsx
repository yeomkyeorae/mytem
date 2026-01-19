"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ItemForm, { type ItemFormData } from "@/components/ItemForm";
import type { Item } from "@/types/database.types";

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const handleSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "아이템 수정에 실패했습니다.");
      }

      toast({
        title: "수정 완료",
        description: "아이템이 성공적으로 수정되었습니다.",
      });

      router.push(`/items/${id}`);
    } catch (err) {
      toast({
        title: "수정 실패",
        description: err instanceof Error ? err.message : "오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 중
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5 text-white"
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
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Mytem
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/items"
              className="text-white/60 hover:text-white transition-colors"
            >
              내 아이템
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-white/60 text-sm">{user?.email}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Back Link */}
        <Link
          href={`/items/${id}`}
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
          상세 페이지로 돌아가기
        </Link>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <svg
                className="animate-spin h-5 w-5 text-white"
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
            <p className="text-white/50 mb-6">
              요청한 아이템을 찾을 수 없거나 접근할 수 없습니다.
            </p>
            <Link href="/items">
              <button className="px-6 py-2 border border-white/20 rounded-lg text-white hover:bg-white/10 transition-colors">
                목록으로 돌아가기
              </button>
            </Link>
          </div>
        )}

        {/* Edit Form */}
        {item && !isLoading && (
          <>
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">아이템 수정</h1>
              <p className="text-white/50">
                &quot;{item.name}&quot;의 정보를 수정합니다.
              </p>
            </div>

            {/* Form */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <ItemForm
                initialData={item}
                onSubmit={handleSubmit}
                isLoading={isSubmitting}
                submitLabel="수정하기"
              />
            </div>
          </>
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
