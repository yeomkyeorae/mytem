"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3">
          <svg
            className="animate-spin h-5 w-5"
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
          <span>로딩 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">대시보드</h1>
          <p className="text-white/50">나의 아이템을 관리하세요</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
            <p className="text-sm text-white/50 mb-1">전체 아이템</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
            <p className="text-sm text-white/50 mb-1">카테고리</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="p-6 border border-white/10 rounded-xl bg-white/[0.02]">
            <p className="text-sm text-white/50 mb-1">커스텀 픽토그램</p>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">빠른 작업</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/items/new"
              className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">아이템 등록</p>
                  <p className="text-sm text-white/50">새로운 아이템을 추가하세요</p>
                </div>
              </div>
            </Link>
            <Link
              href="/pictogram/create"
              className="p-6 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <svg
                    className="w-6 h-6 text-white/70"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium">픽토그램 생성</p>
                  <p className="text-sm text-white/50">AI로 커스텀 이미지를 만드세요</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        <div className="border border-dashed border-white/20 rounded-xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">아직 등록된 아이템이 없습니다</h3>
          <p className="text-white/50 mb-6">
            첫 번째 아이템을 등록하고 관리를 시작하세요
          </p>
          <Link
            href="/items/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-white/90 transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            아이템 등록하기
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-white/30">
        <p>&copy; 2025 Mytem. All rights reserved.</p>
      </footer>
    </div>
  );
}
