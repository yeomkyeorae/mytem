"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SketchPicker, { SelectedSketch, isCustomSketch } from "@/components/SkecthPicker";
import type { Item, Category } from "@/types/database.types";

export interface ItemFormData {
  name: string;
  description: string;
  quantity: number;
  image_url: string | null;
  image_type: "default" | "custom";
  category_id: string;
}

interface ItemFormProps {
  initialData?: Partial<Item>;
  onSubmit: (data: ItemFormData) => Promise<void>;
  isLoading: boolean;
  submitLabel?: string;
}

export default function ItemForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "등록하기",
}: ItemFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialData?.category_id || ""
  );
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [selectedSketch, setSelectedSketch] = useState<SelectedSketch | null>(
    initialData?.image_url
      ? initialData.image_type === "custom"
        ? {
            id: "initial",
            user_id: "",
            prompt: initialData.name || "",
            image_url: initialData.image_url,
            created_at: "",
          }
        : {
            id: "initial",
            name: initialData.name || "",
            svg: initialData.image_url,
            keywords: [],
            collection: "",
          }
      : null
  );
  const [showPicker, setShowPicker] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 카테고리 목록 로드
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedCategoryId) {
      newErrors.category = "카테고리를 선택해주세요.";
    }

    if (!name.trim()) {
      newErrors.name = "아이템 이름을 입력해주세요.";
    }

    if (quantity < 1) {
      newErrors.quantity = "개수는 1 이상이어야 합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // 이미지 URL과 타입 결정
    let imageUrl: string | null = null;
    let imageType: "default" | "custom" = "default";

    if (selectedSketch) {
      if (isCustomSketch(selectedSketch)) {
        imageUrl = selectedSketch.image_url;
        imageType = "custom";
      } else {
        imageUrl = selectedSketch.svg;
        imageType = "default";
      }
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      quantity,
      image_url: imageUrl,
      image_type: imageType,
      category_id: selectedCategoryId,
    });
  };

  const handleSketchSelect = (sketch: SelectedSketch) => {
    setSelectedSketch(sketch);
    setShowPicker(false);
  };

  // 선택된 스케치 정보 표시용 함수
  const getDisplayInfo = () => {
    if (!selectedSketch) return null;

    if (isCustomSketch(selectedSketch)) {
      return {
        imageElement: (
          <img
            src={selectedSketch.image_url}
            alt={selectedSketch.prompt}
            className="w-full h-full object-contain"
          />
        ),
        name: selectedSketch.prompt,
        collection: "내 스케치",
      };
    } else {
      return {
        imageElement: (
          <div
            className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:text-white"
            dangerouslySetInnerHTML={{ __html: selectedSketch.svg }}
          />
        ),
        name: selectedSketch.name,
        collection: selectedSketch.collection,
      };
    }
  };

  const displayInfo = getDisplayInfo();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 스케치 선택 */}
      <div>
        <Label className="text-white/70 mb-2 block">스케치 이미지</Label>

        {/* 선택된 스케치 미리보기 */}
        <div className="mb-3">
          {selectedSketch && displayInfo ? (
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg">
                {displayInfo.imageElement}
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{displayInfo.name}</p>
                {displayInfo.collection && (
                  <p className="text-sm text-white/50">{displayInfo.collection}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSketch(null)}
                className="text-white/50 hover:text-white hover:bg-white/10"
              >
                제거
              </Button>
            </div>
          ) : (
            <div
              onClick={() => setShowPicker(true)}
              className="flex flex-col items-center justify-center gap-2 p-8 bg-white/5 border border-dashed border-white/20 rounded-lg cursor-pointer hover:bg-white/10 hover:border-white/30 transition-colors"
            >
              <svg
                className="w-10 h-10 text-white/30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <p className="text-sm text-white/50">스케치를 선택해주세요</p>
            </div>
          )}
        </div>

        {/* 스케치 선택/변경 버튼 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
        >
          {showPicker ? "닫기" : selectedSketch ? "스케치 변경" : "스케치 선택"}
        </Button>

        {/* 스케치 선택기 */}
        {showPicker && (
          <div className="mt-4 p-4 border border-white/10 rounded-lg bg-black/50">
            <SketchPicker
              onSelect={handleSketchSelect}
              selectedSketch={selectedSketch}
              showCustomTab={true}
            />
          </div>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div>
        <Label htmlFor="category" className="text-white/70 mb-2 block">
          카테고리 <span className="text-red-400">*</span>
        </Label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="카테고리를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            {categories.length === 0 ? (
              <SelectItem value="empty" disabled>
                카테고리가 없습니다
              </SelectItem>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-400">{errors.category}</p>
        )}
        {categories.length === 0 && (
          <Link
            href="/categories"
            className="mt-2 inline-block text-sm text-white/50 hover:text-white underline"
          >
            카테고리를 먼저 생성하세요
          </Link>
        )}
      </div>

      {/* 이름 입력 */}
      <div>
        <Label htmlFor="name" className="text-white/70 mb-2 block">
          아이템 이름 <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 노트북, 가방, 책"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30"
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      {/* 개수 입력 */}
      <div>
        <Label htmlFor="quantity" className="text-white/70 mb-2 block">
          개수 <span className="text-red-400">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30"
        />
        {errors.quantity && <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>}
      </div>

      {/* 설명 입력 */}
      <div>
        <Label htmlFor="description" className="text-white/70 mb-2 block">
          설명 (선택)
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="아이템에 대한 간단한 설명을 입력해주세요."
          rows={4}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-colors resize-none"
        />
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-white text-black hover:bg-white/90 disabled:opacity-50"
      >
        {isLoading ? (
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
            처리 중...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
