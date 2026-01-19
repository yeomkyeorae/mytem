"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PictogramPicker from "@/components/PictogramPicker";
import type { Pictogram } from "@/types/pictogram.types";
import type { Item } from "@/types/database.types";

export interface ItemFormData {
  name: string;
  description: string;
  quantity: number;
  image_url: string | null;
  image_type: "default" | "custom";
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
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [quantity, setQuantity] = useState(initialData?.quantity || 1);
  const [selectedPictogram, setSelectedPictogram] = useState<Pictogram | null>(
    initialData?.image_url
      ? {
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

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = "소유물 이름을 입력해주세요.";
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

    await onSubmit({
      name: name.trim(),
      description: description.trim(),
      quantity,
      image_url: selectedPictogram?.svg || null,
      image_type: "default",
    });
  };

  const handlePictogramSelect = (pictogram: Pictogram) => {
    setSelectedPictogram(pictogram);
    setShowPicker(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 픽토그램 선택 */}
      <div>
        <Label className="text-white/70 mb-2 block">픽토그램 이미지</Label>

        {/* 선택된 픽토그램 미리보기 */}
        <div className="mb-3">
          {selectedPictogram ? (
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
              <div
                className="w-16 h-16 flex items-center justify-center bg-white/10 rounded-lg [&_svg]:w-full [&_svg]:h-full [&_svg]:text-white"
                dangerouslySetInnerHTML={{ __html: selectedPictogram.svg }}
              />
              <div className="flex-1">
                <p className="font-medium text-white">{selectedPictogram.name}</p>
                {selectedPictogram.collection && (
                  <p className="text-sm text-white/50">{selectedPictogram.collection}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPictogram(null)}
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
              <p className="text-sm text-white/50">픽토그램을 선택해주세요</p>
            </div>
          )}
        </div>

        {/* 픽토그램 선택/변경 버튼 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full border-white/20 text-white/70 hover:bg-white/10 hover:text-white"
        >
          {showPicker ? "닫기" : selectedPictogram ? "픽토그램 변경" : "픽토그램 선택"}
        </Button>

        {/* 픽토그램 선택기 */}
        {showPicker && (
          <div className="mt-4 p-4 border border-white/10 rounded-lg bg-black/50">
            <PictogramPicker
              onSelect={handlePictogramSelect}
              selectedPictogram={selectedPictogram}
            />
          </div>
        )}
      </div>

      {/* 이름 입력 */}
      <div>
        <Label htmlFor="name" className="text-white/70 mb-2 block">
          소유물 이름 <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 노트북, 가방, 책"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-white/30"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-400">{errors.name}</p>
        )}
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
        {errors.quantity && (
          <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>
        )}
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
          placeholder="소유물에 대한 간단한 설명을 입력해주세요."
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
            <svg
              className="animate-spin h-4 w-4"
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
            처리 중...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  );
}
