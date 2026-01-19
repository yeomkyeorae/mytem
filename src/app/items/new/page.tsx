"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ItemForm, { type ItemFormData } from "@/components/ItemForm";

export default function NewItemPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 인증 확인 후 미인증 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "소유물 등록에 실패했습니다.");
      }

      toast({
        title: "등록 완료",
        description: "소유물이 성공적으로 등록되었습니다.",
      });

      router.push("/items");
    } catch (err) {
      toast({
        title: "등록 실패",
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
              내 소유물
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
          내 소유물로 돌아가기
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">새 소유물 등록</h1>
          <p className="text-white/50">
            새로운 소유물의 정보를 입력해주세요.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <ItemForm
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
            submitLabel="등록하기"
          />
        </div>
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
