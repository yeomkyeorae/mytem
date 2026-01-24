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
import SketchPicker, { SelectedSketch, isCustomSketch } from "@/components/SketchPicker";
import type { Item, Category } from "@/types/database.types";

export interface ItemFormData {
  name: string;
  description: string;
  quantity: number;
  image_url: string | null;
  image_type: "default" | "custom" | "uploaded";
  category_id: string;
  uploaded_file?: File;
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

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

    // 이미지 필수 검증: 파일 업로드 또는 스케치 선택 중 하나는 필수
    if (!uploadedFile && !selectedSketch) {
      newErrors.image = "이미지 파일 또는 스케치 이미지를 선택해주세요.";
      alert("이미지 파일 또는 스케치 이미지를 선택해주세요.");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 파일 검증
  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드할 수 있습니다.";
    }
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return "파일 크기는 5MB 이하여야 합니다.";
    }
    return null;
  };

  // 파일 선택 핸들러
  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrors({ ...errors, uploadedFile: error });
      return;
    }

    // 스케치가 이미 선택되어 있는 경우 확인
    if (selectedSketch) {
      const confirmed = confirm(
        "스케치 이미지가 이미 선택되어 있습니다.\n이미지 파일로 변경하시겠습니까?"
      );
      if (!confirmed) {
        return;
      }
      // 스케치 제거
      setSelectedSketch(null);
    }

    setUploadedFile(file);
    setErrors({ ...errors, uploadedFile: "", image: "" });

    // 미리보기 생성
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 드래그앤드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // 파일 입력 변경
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // 업로드된 파일 제거
  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    setUploadedFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // 이미지 우선순위: 업로드된 파일 > 선택된 스케치
    let imageUrl: string | null = null;
    let imageType: "default" | "custom" | "uploaded" = "default";
    let fileToUpload: File | undefined = undefined;

    if (uploadedFile) {
      // 업로드된 파일이 최우선
      imageType = "uploaded";
      fileToUpload = uploadedFile;
    } else if (selectedSketch) {
      // 스케치 선택
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
      uploaded_file: fileToUpload,
    });
  };

  const handleSketchSelect = (sketch: SelectedSketch) => {
    // 파일이 이미 업로드되어 있는 경우 확인
    if (uploadedFile) {
      const confirmed = confirm(
        "이미지 파일이 이미 업로드되어 있습니다.\n스케치 이미지로 변경하시겠습니까?"
      );
      if (!confirmed) {
        return;
      }
      // 업로드된 파일 제거
      setUploadedFile(null);
      setUploadedFilePreview(null);
    }

    setSelectedSketch(sketch);
    setShowPicker(false);
    setErrors({ ...errors, image: "" });
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
            className="w-full h-full flex items-center justify-center [&_svg]:w-full [&_svg]:h-full [&_svg]:text-foreground"
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
      {/* 이미지 파일 업로드 */}
      <div>
        <Label className="text-muted-foreground mb-2 block">
          이미지 파일 <span className="text-muted text-xs">(스케치와 둘 중 하나 필수)</span>
        </Label>

        {uploadedFile && uploadedFilePreview ? (
          // 업로드된 파일 미리보기
          <div className="mb-3">
            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
              <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg overflow-hidden">
                <img
                  src={uploadedFilePreview}
                  alt="업로드된 이미지"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-sm text-foreground/70">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveUploadedFile}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                제거
              </Button>
            </div>
          </div>
        ) : (
          // 드래그앤드롭 영역
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mb-3 flex flex-col items-center justify-center gap-3 p-8 bg-card border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragging
                ? "border-ring bg-muted"
                : "border-border hover:border-ring hover:bg-accent"
            }`}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <svg
              className="w-12 h-12 text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                이미지를 드래그하거나 클릭하여 업로드
              </p>
              <p className="text-xs text-muted">
                PNG, JPG, WEBP (최대 5MB)
              </p>
            </div>
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {errors.uploadedFile && (
          <p className="mt-1 text-sm text-red-400">{errors.uploadedFile}</p>
        )}
      </div>

      {/* 스케치 선택 */}
      <div>
        <Label className="text-muted-foreground mb-2 block">
          스케치 이미지 <span className="text-muted text-xs">(파일과 둘 중 하나 필수)</span>
        </Label>

        {/* 선택된 스케치 미리보기 */}
        <div className="mb-3">
          {selectedSketch && displayInfo ? (
            <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
              <div className="w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
                {displayInfo.imageElement}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{displayInfo.name}</p>
                {displayInfo.collection && (
                  <p className="text-sm text-foreground/70">{displayInfo.collection}</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSketch(null)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                제거
              </Button>
            </div>
          ) : (
            <div
              onClick={() => setShowPicker(true)}
              className="flex flex-col items-center justify-center gap-2 p-8 bg-card border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted hover:border-ring transition-colors"
            >
              <svg
                className="w-10 h-10 text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <p className="text-sm text-muted-foreground">스케치를 선택해주세요</p>
            </div>
          )}
        </div>

        {/* 스케치 선택/변경 버튼 */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowPicker(!showPicker)}
          className="w-full border-border text-black hover:bg-muted hover:text-foreground"
        >
          {showPicker ? "닫기" : selectedSketch ? "스케치 변경" : "스케치 선택"}
        </Button>

        {/* 스케치 선택기 */}
        {showPicker && (
          <div className="mt-4 p-4 border border-border rounded-lg bg-background/50">
            <SketchPicker
              onSelect={handleSketchSelect}
              selectedSketch={selectedSketch}
              showCustomTab={true}
            />
          </div>
        )}

        {errors.image && !uploadedFile && !selectedSketch && (
          <p className="mt-2 text-sm text-red-400">{errors.image}</p>
        )}
      </div>

      {/* 카테고리 선택 */}
      <div>
        <Label htmlFor="category" className="text-muted-foreground mb-2 block">
          카테고리 <span className="text-red-400">*</span>
        </Label>
        <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
          <SelectTrigger className="bg-card border-border text-foreground">
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
        {errors.category && <p className="mt-1 text-sm text-red-400">{errors.category}</p>}
        {categories.length === 0 && (
          <Link
            href="/categories"
            className="mt-2 inline-block text-sm text-muted-foreground hover:text-foreground underline"
          >
            카테고리를 먼저 생성하세요
          </Link>
        )}
      </div>

      {/* 이름 입력 */}
      <div>
        <Label htmlFor="name" className="text-muted-foreground mb-2 block">
          아이템 이름 <span className="text-red-400">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="예: 노트북, 가방, 책"
          className="bg-card border-border text-foreground placeholder:text-muted focus:border-ring"
        />
        {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
      </div>

      {/* 개수 입력 */}
      <div>
        <Label htmlFor="quantity" className="text-muted-foreground mb-2 block">
          개수 <span className="text-red-400">*</span>
        </Label>
        <Input
          id="quantity"
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="bg-card border-border text-foreground placeholder:text-muted focus:border-ring"
        />
        {errors.quantity && <p className="mt-1 text-sm text-red-400">{errors.quantity}</p>}
      </div>

      {/* 설명 입력 */}
      <div>
        <Label htmlFor="description" className="text-muted-foreground mb-2 block">
          설명 (선택)
        </Label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="아이템에 대한 간단한 설명을 입력해주세요."
          rows={4}
          className="w-full px-4 py-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted focus:outline-none focus:border-ring focus:bg-accent transition-colors resize-none"
        />
      </div>

      {/* 제출 버튼 */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
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
