"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import type { CustomPictogram } from "@/types/pictogram.types";

export default function PictogramCreatePage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [recentPictograms, setRecentPictograms] = useState<CustomPictogram[]>([]);

  // 최근 생성한 스케치 로드
  useEffect(() => {
    loadRecentPictograms();
  }, []);

  const loadRecentPictograms = async () => {
    try {
      const response = await fetch("/api/pictograms/custom");
      if (response.ok) {
        const data = await response.json();
        setRecentPictograms(data.pictograms.slice(0, 6));
      }
    } catch (err) {
      console.error("Failed to load recent pictograms:", err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("이미지 설명을 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedImage(null);

    try {
      const response = await fetch("/api/pictograms/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "이미지 생성에 실패했습니다.");
      }

      setGeneratedImage(data.pictogram.image_url);
      // 최근 스케치 목록 갱신
      loadRecentPictograms();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setPrompt("");
    setError("");
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-black text-white pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <Link
              href="/pictogram/gallery"
              className="text-sm text-white/50 hover:text-white transition-colors mb-4 inline-block"
            >
              ← 갤러리로 돌아가기
            </Link>
            <h1 className="text-3xl font-bold">AI 스케치 생성</h1>
            <p className="text-white/60 mt-2">
              원하는 이미지를 텍스트로 설명하면 AI가 스케치을 만들어드립니다.
            </p>
          </div>

          {/* 생성 폼 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-white/70 mb-2 block">
                  이미지 설명 <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="prompt"
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="예: 가방, 노트북, 운동화, 책상 위의 커피잔..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  disabled={isGenerating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isGenerating) {
                      handleGenerate();
                    }
                  }}
                />
                <p className="mt-2 text-sm text-white/40">
                  간단하고 명확한 설명이 좋은 결과를 만듭니다.
                </p>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {/* 생성 버튼 */}
              {!generatedImage && (
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full py-3 bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {isGenerating ? (
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
                      이미지 생성 중...
                    </span>
                  ) : (
                    "생성하기"
                  )}
                </Button>
              )}
            </div>

            {/* 생성된 이미지 미리보기 */}
            {generatedImage && (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-white/50 mb-4">생성된 스케치</p>
                  <div className="inline-block p-4 bg-white/10 rounded-xl">
                    <img
                      src={generatedImage}
                      alt="Generated pictogram"
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => router.push("/pictogram/gallery")}
                    className="flex-1 py-3 bg-white text-black hover:bg-white/90"
                  >
                    갤러리에서 확인
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 py-3 border-white/20 text-white hover:bg-white/10"
                  >
                    다시 생성
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 최근 생성한 스케치 */}
          {recentPictograms.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">최근 생성한 스케치</h2>
                <Link
                  href="/pictogram/gallery"
                  className="text-sm text-white/50 hover:text-white transition-colors"
                >
                  전체 보기 →
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {recentPictograms.map((pictogram) => (
                  <Card
                    key={pictogram.id}
                    className="p-3 bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <img
                      src={pictogram.image_url}
                      alt={pictogram.prompt}
                      className="w-full aspect-square object-contain"
                    />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* 사용 팁 */}
          <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
            <h3 className="font-semibold mb-3">사용 팁</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li>• 단일 물체를 간단히 설명하세요 (예: "가방", "노트북")</li>
              <li>• 구체적인 설명이 더 좋은 결과를 만듭니다</li>
              <li>• 생성된 스케치은 아이템 등록 시 사용할 수 있습니다</li>
              <li>• 마음에 들지 않으면 "다시 생성"을 클릭하세요</li>
            </ul>
          </div>
        </div>
      </main>
    </>
  );
}
