"use client";

import { Category } from "@/types/database.types";
import { X } from "lucide-react";

interface CategoryTagProps {
  category: Category;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

/**
 * 카테고리 태그 컴포넌트
 * 카테고리 이름과 삭제 버튼을 포함한 태그 형태
 */
export default function CategoryTag({
  category,
  onDelete,
  isDeleting = false,
}: CategoryTagProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-secondary border border-border hover:bg-accent transition-colors shadow-sm">
      <span className="text-foreground text-sm font-medium">{category.name}</span>
      <button
        onClick={() => onDelete(category.id)}
        disabled={isDeleting}
        className="p-0.5 rounded-full hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={`${category.name} 카테고리 삭제`}
      >
        {isDeleting ? (
          <div className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin" />
        ) : (
          <X className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
        )}
      </button>
    </div>
  );
}
