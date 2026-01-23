"use client";

import { useState } from "react";
import Link from "next/link";
import SketchPicker, {
  SelectedSketch,
  isCustomSketch,
} from "@/components/SketchPicker";
import { useAuth } from "@/hooks/useAuth";

export default function SketchTestPage() {
  const { user } = useAuth();
  const [selectedSketch, setSelectedSketch] =
    useState<SelectedSketch | null>(null);

  const getDisplayData = () => {
    if (!selectedSketch) return null;

    if (isCustomSketch(selectedSketch)) {
      return {
        id: selectedSketch.id,
        prompt: selectedSketch.prompt,
        type: "custom",
        imageUrlLength: selectedSketch.image_url.length,
        created_at: selectedSketch.created_at,
      };
    } else {
      return {
        id: selectedSketch.id,
        name: selectedSketch.name,
        collection: selectedSketch.collection,
        keywords: selectedSketch.keywords,
        type: "default",
        svgLength: selectedSketch.svg.length,
      };
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            Mytem
          </Link>
          <div className="flex items-center gap-4">
            {user && (
              <Link
                href="/dashboard"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                대시보드
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">스케치 선택 테스트</h1>
          <p className="text-white/50">
            검색하거나 카테고리를 선택하여 스케치를 찾아보세요.
          </p>
        </div>

        {/* Sketch Picker */}
        <div className="mb-8">
          <SketchPicker
            onSelect={setSelectedSketch}
            selectedSketch={selectedSketch}
          />
        </div>

        {/* 선택 결과 표시 */}
        {selectedSketch && (
          <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
            <h2 className="text-lg font-semibold mb-4">선택 결과 (JSON)</h2>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-white/70">
              {JSON.stringify(getDisplayData(), null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
