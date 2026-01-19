"use client";

import { useState } from "react";
import Link from "next/link";
import PictogramPicker from "@/components/PictogramPicker";
import type { Pictogram } from "@/types/pictogram.types";
import { useAuth } from "@/hooks/useAuth";

export default function PictogramTestPage() {
  const { user } = useAuth();
  const [selectedPictogram, setSelectedPictogram] = useState<Pictogram | null>(
    null
  );

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
          <h1 className="text-2xl font-bold mb-2">픽토그램 선택 테스트</h1>
          <p className="text-white/50">
            검색하거나 카테고리를 선택하여 픽토그램을 찾아보세요.
          </p>
        </div>

        {/* Pictogram Picker */}
        <div className="mb-8">
          <PictogramPicker
            onSelect={setSelectedPictogram}
            selectedPictogram={selectedPictogram}
          />
        </div>

        {/* 선택 결과 표시 */}
        {selectedPictogram && (
          <div className="border border-white/10 rounded-xl p-6 bg-white/[0.02]">
            <h2 className="text-lg font-semibold mb-4">선택 결과 (JSON)</h2>
            <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-sm text-white/70">
              {JSON.stringify(
                {
                  id: selectedPictogram.id,
                  name: selectedPictogram.name,
                  collection: selectedPictogram.collection,
                  keywords: selectedPictogram.keywords,
                  svgLength: selectedPictogram.svg.length,
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
