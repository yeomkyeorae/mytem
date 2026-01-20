"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Sketch, CustomSketch } from "@/types/sketch.types";

// 스케치 또는 커스텀 스케치를 구분하기 위한 유니온 타입
export type SelectedSketch = Sketch | CustomSketch;

interface SketchPickerProps {
  onSelect: (pictogram: SelectedSketch) => void;
  selectedSketch?: SelectedSketch | null;
  showCustomTab?: boolean;
}

const CATEGORIES = [
  { id: "my", label: "내 픽토그램" },
  { id: "all", label: "전체" },
  { id: "clothing", label: "의류" },
  { id: "electronics", label: "전자기기" },
  { id: "accessories", label: "액세서리" },
  { id: "household", label: "생활용품" },
  { id: "sports", label: "스포츠" },
  { id: "books", label: "도서" },
];

// 타입 가드: CustomSketch인지 확인
export function isCustomSketch(pictogram: SelectedSketch): pictogram is CustomSketch {
  return "image_url" in pictogram && "prompt" in pictogram;
}

export default function SketchPicker({
  onSelect,
  selectedSketch,
  showCustomTab = true,
}: SketchPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(showCustomTab ? "my" : "all");
  const [pictograms, setSketchs] = useState<Sketch[]>([]);
  const [customSketchs, setCustomSketchs] = useState<CustomSketch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // 카테고리 변경 시 픽토그램 로드
  useEffect(() => {
    if (selectedCategory === "my") {
      loadCustomSketchs();
    } else if (!searchQuery) {
      loadDefaultSketchs();
    }
  }, [selectedCategory]);

  // 검색어 변경 시 검색
  useEffect(() => {
    if (selectedCategory !== "my") {
      if (searchQuery.length >= 2) {
        const timeoutId = setTimeout(() => {
          searchSketchs();
        }, 500); // 500ms 디바운스

        return () => clearTimeout(timeoutId);
      } else if (searchQuery.length === 0) {
        loadDefaultSketchs();
      }
    }
  }, [searchQuery]);

  const loadCustomSketchs = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/pictograms/custom");

      if (!response.ok) {
        throw new Error("내 픽토그램을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setCustomSketchs(data.pictograms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setCustomSketchs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultSketchs = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all" && selectedCategory !== "my") {
        params.set("category", selectedCategory);
      }

      const response = await fetch(`/api/pictograms?${params}`);

      if (!response.ok) {
        throw new Error("픽토그램을 불러오는데 실패했습니다.");
      }

      const data = await response.json();
      setSketchs(data.pictograms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSketchs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchSketchs = async () => {
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
      setSketchs(data.pictograms || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setSketchs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchQuery("");
  };

  // 선택된 픽토그램의 ID 가져오기
  const getSelectedId = () => {
    if (!selectedSketch) return null;
    return selectedSketch.id;
  };

  // 카테고리 목록 (showCustomTab에 따라 필터링)
  const displayCategories = showCustomTab ? CATEGORIES : CATEGORIES.filter((c) => c.id !== "my");

  return (
    <div className="w-full">
      {/* 검색 입력 (내 픽토그램 탭이 아닐 때만) */}
      {selectedCategory !== "my" && (
        <div className="mb-4">
          <Input
            type="text"
            placeholder="픽토그램 검색 (예: 책, 신발, 노트북...)"
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

      {/* 내 픽토그램 그리드 */}
      {!isLoading && selectedCategory === "my" && (
        <>
          {customSketchs.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {customSketchs.map((pictogram) => (
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
              <p className="text-white/40 mb-4">아직 생성한 픽토그램이 없습니다.</p>
              <Link href="/pictogram/create" className="text-white hover:underline">
                픽토그램 생성하기 →
              </Link>
            </div>
          )}
        </>
      )}

      {/* 기본 픽토그램 그리드 */}
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
      {!isLoading && selectedCategory !== "my" && pictograms.length === 0 && !error && (
        <div className="text-center py-12 text-white/40">
          {searchQuery
            ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
            : "픽토그램을 불러오는 중..."}
        </div>
      )}

      {/* 선택된 픽토그램 정보 */}
      {selectedSketch && (
        <div className="mt-6 p-4 border border-white/10 rounded-lg bg-white/5">
          <p className="text-sm text-white/50 mb-2">선택된 픽토그램</p>
          <div className="flex items-center gap-4">
            {isCustomSketch(selectedSketch) ? (
              <>
                <img
                  src={selectedSketch.image_url}
                  alt={selectedSketch.prompt}
                  className="w-16 h-16 object-contain bg-white/10 rounded-lg"
                />
                <div>
                  <p className="font-medium text-white">{selectedSketch.prompt}</p>
                  <p className="text-sm text-white/50">내 픽토그램</p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: selectedSketch.svg }}
                />
                <div>
                  <p className="font-medium text-white">{selectedSketch.name}</p>
                  <p className="text-sm text-white/50">{selectedSketch.collection}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
