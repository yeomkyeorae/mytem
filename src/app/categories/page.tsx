"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import CategoryTag from "@/components/CategoryTag";
import { Category } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/categories");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("카테고리를 불러오는 데 실패했습니다.");
      }

      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("카테고리 조회 실패:", err);
      setError("카테고리를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedName = categoryName.trim();

    if (!trimmedName) {
      setError("카테고리 이름을 입력해주세요.");
      return;
    }

    if (trimmedName.length > 50) {
      setError("카테고리 이름은 50자 이하여야 합니다.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "카테고리 추가에 실패했습니다.");
        return;
      }

      setSuccessMessage("카테고리가 추가되었습니다.");
      setCategoryName("");
      await fetchCategories();
    } catch (err) {
      console.error("카테고리 추가 실패:", err);
      setError("카테고리 추가에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setError("");
    setSuccessMessage("");
    setDeletingId(id);

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "카테고리 삭제에 실패했습니다.");
        return;
      }

      setSuccessMessage("카테고리가 삭제되었습니다.");
      await fetchCategories();
    } catch (err) {
      console.error("카테고리 삭제 실패:", err);
      setError("카테고리 삭제에 실패했습니다.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8 pt-24">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">카테고리 관리</h1>
            <p className="text-white/50">
              {categories.length > 0
                ? `총 ${categories.length}개의 카테고리를 관리하고 있습니다.`
                : "등록된 카테고리가 없습니다."}
            </p>
          </div>
        </div>

        {/* 카테고리 추가 폼 */}
        <div className="mb-6">
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="새 카테고리 이름 (예: 의류, 전자기기, 책...)"
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30"
              disabled={isSubmitting}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-white/90"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              {isSubmitting ? "추가 중..." : "추가"}
            </Button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
            <button
              onClick={fetchCategories}
              className="ml-4 underline hover:no-underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
            {successMessage}
          </div>
        )}

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
              <span className="text-white/60">카테고리를 불러오는 중...</span>
            </div>
          </div>
        )}

        {/* Categories List */}
        {!isLoading && categories.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <CategoryTag
                key={category.id}
                category={category}
                onDelete={handleDeleteCategory}
                isDeleting={deletingId === category.id}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && categories.length === 0 && !error && (
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
                <path d="M3 9h18" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">아직 등록된 카테고리가 없습니다</h2>
            <p className="text-white/50 mb-6 text-center">
              첫 번째 카테고리를 추가하고 아이템을 체계적으로 관리해보세요.
            </p>
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
