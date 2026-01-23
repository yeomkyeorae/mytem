"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-semibold tracking-tight">
          Mytem
        </Link>

        <div className="flex items-center gap-4">
          {isLoading ? (
            // 로딩 상태
            <div className="h-9 w-20 bg-white/5 rounded-full animate-pulse" />
          ) : user ? (
            // 로그인 상태
            <>
              <Link
                href="/dashboard"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                대시보드
              </Link>
              <Link
                href="/items"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                내 아이템
              </Link>
              <Link
                href="/sketch/gallery"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                내 스케치
              </Link>
              <Link
                href="/categories"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                카테고리 관리
              </Link>
              <span className="text-sm text-white/50 hidden sm:block">{user.email}</span>
              <ThemeToggle />
              <button
                onClick={handleSignOut}
                className="text-sm px-4 py-2 border border-white/20 text-white/70 rounded-full font-medium hover:bg-white/5 hover:text-white transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            // 비로그인 상태
            <>
              <Link
                href="/login"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-sm px-4 py-2 bg-white text-black rounded-full font-medium hover:bg-white/90 transition-colors"
              >
                시작하기
              </Link>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
