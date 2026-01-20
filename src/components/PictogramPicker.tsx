"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Pictogram, CustomPictogram } from "@/types/pictogram.types";

// 스케치 또는 커스텀 스케치을 구분하기 위한 유니온 타입
export type SelectedPictogram = Pictogram | CustomPictogram;

interface PictogramPickerProps {
  onSelect: (pictogram: SelectedPictogram) => void;
  selectedPictogram?: SelectedPictogram | null;
  showCustomTab?: boolean;
}

const CATEGORIES = [
  { id: "my", label: "내 스케치" },
  { id: "all", label: "전체" },
  { id: "clothing", label: "의류" },
  { id: "electronics", label: "전자기기" },
  { id: "accessories", label: "액세서리" },
  { id: "household", label: "생활용품" },
  { id: "sports", label: "스포츠" },
  { id: "books", label: "도서" },
];

// 타입 가드: CustomPictogram인지 확인
export function isCustomPictogram(
  pictogram: SelectedPictogram
): pictogram is CustomPictogram {
  return "image_url" in pictogram && "prompt" in pictogram;
}

export default function PictogramPicker({
  onSelect,
  selectedPictogram,
  showCustomTab = true,
}: PictogramPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(showCustomTab ? "my" : "all");
  const [pictograms, setPictograms] = useState<Pictogram[]>([]);
  const [customPictograms, setCustomPictograms] = useState<CustomPictogram[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 카테고리 변경 시 스케치 로드
  useEffect(() => {
    if (selectedCategory === "my") {
      loadCustomPictograms();
    } else if (!searchQuery) {
      loadDefaultPictograms();
    }
  }, [selectedCategory]);

  // 검색어 변경 시 검색
  useEffect(() => {
    if (selectedCategory !== "my") {
      if (searchQuery.length >= 2) {
        const timeoutId = setTimeout(() => {
          searchPictograms();
        }, 500); // 500ms 디바운스

        return () => clearTimeout(timeoutId);
      } else if (searchQuery.length === 0) {
        loadDefaultPictograms();
      }
    }
  }, [searchQuery]);

  const loadCustomPictograms = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pictograms/custom");

      if (!response.ok) {
        throw new Error("내 스케치을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setCustomPictograms(data.pictograms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setCustomPictograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultPictograms = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all" && selectedCategory !== "my") {
        params.set("category", selectedCategory);
      }

      const response = await fetch(`/api/pictograms?${params}`);

      if (!response.ok) {
        throw new Error("스케치을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setPictograms(data.pictograms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setPictograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchPictograms = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        limit: "30",
      });

      const response = await fetch(`/api/pictograms/search?${params}`);

      if (!response.ok) {
        throw new Error("검색에 실패했습니다.");
      }

      const data = await response.json();
      setPictograms(data.pictograms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setPictograms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  // 선택된 스케치의 ID 가져오기
  const getSelectedId = () => {
    if (!selectedPictogram) return null;
    return selectedPictogram.id;
  };

  // 카테고리 목록 (showCustomTab에 따라 필터링)
  const displayCategories = showCustomTab
    ? CATEGORIES
    : CATEGORIES.filter((c) => c.id !== "my");

  return (
    <div className="w-full">
      {/* 검색 입력 (내 스케치 탭이 아닐 때만) */}
      {selectedCategory !== "my" && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="스케치 검색 (예: 책, 신발, 노트북...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* 카테고리 탭 */}
      {!searchQuery && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {displayCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/70 hover:bg-white/20"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
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
      )}

      {/* 내 스케치 그리드 */}
      {!isLoading && selectedCategory === "my" && (
        <>
          {customPictograms.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {customPictograms.map((pictogram) => (
                <Card
                  key={pictogram.id}
                  onClick={() => onSelect(pictogram)}
                  className={`p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg text-white ${
                    getSelectedId() === pictogram.id
                      ? "ring-2 ring-white bg-white/10"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <img
                    src={pictogram.image_url}
                    alt={pictogram.prompt}
                    className="w-full aspect-square object-contain"
                  />
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/40 mb-4">아직 생성한 스케치이 없습니다.</p>
              <Link
                href="/pictogram/create"
                className="text-white hover:underline"
              >
                스케치 생성하기 →
              </Link>
            </div>
          )}
        </>
      )}

      {/* 기본 스케치 그리드 */}
      {!isLoading && selectedCategory !== "my" && pictograms.length > 0 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
          {pictograms.map((pictogram) => (
            <Card
              key={pictogram.id}
              onClick={() => onSelect(pictogram)}
              className={`p-4 cursor-pointer transition-all hover:scale-105 hover:shadow-lg text-white ${
                getSelectedId() === pictogram.id
                  ? "ring-2 ring-white bg-white/10"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              <div
                className="w-full aspect-square flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: pictogram.svg }}
              />
            </Card>
          ))}
        </div>
      )}

      {/* 검색 결과 없음 */}
      {!isLoading &&
        selectedCategory !== "my" &&
        pictograms.length === 0 &&
        !error && (
          <div className="text-center py-12 text-white/40">
            {searchQuery
              ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
              : "스케치을 불러오는 중..."}
          </div>
        )}

      {/* 선택된 스케치 정보 */}
      {selectedPictogram && (
        <div className="mt-6 p-4 border border-white/10 rounded-lg bg-white/5">
          <p className="text-sm text-white/50 mb-2">선택된 스케치</p>
          <div className="flex items-center gap-4">
            {isCustomPictogram(selectedPictogram) ? (
              <>
                <img
                  src={selectedPictogram.image_url}
                  alt={selectedPictogram.prompt}
                  className="w-16 h-16 object-contain bg-white/10 rounded-lg"
                />
                <div>
                  <p className="font-medium text-white">{selectedPictogram.prompt}</p>
                  <p className="text-sm text-white/50">내 스케치</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: selectedPictogram.svg }}
                />
                <div>
                  <p className="font-medium text-white">{selectedPictogram.name}</p>
                  <p className="text-sm text-white/50">{selectedPictogram.collection}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
