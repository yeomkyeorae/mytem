import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <main className="relative pt-32 pb-20 px-6">
        {/* Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-blue-600/20 blur-[120px] rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-xs font-medium text-muted-foreground border border-border rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            아이템 관리의 새로운 방법
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-transparent">
            당신의 모든 것을
            <br />
            한 곳에서
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-12 leading-relaxed">
            아이템을 등록하고, 관리하고, 시각화하세요.
            <br className="hidden md:block" />
            AI가 만들어주는 스케치으로 더욱 직관적으로.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:scale-105"
            >
              무료로 시작하기
            </Link>
            <Link
              href="/demo"
              className="w-full sm:w-auto px-8 py-3 border border-border text-foreground rounded-full font-medium hover:bg-card transition-all"
            >
              데모 둘러보기
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <section className="relative mt-32 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-colors">
              <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-lg bg-muted">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">체계적인 관리</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                아이템을 카테고리별로 분류하고 개수와 상세 정보를 한눈에 파악하세요.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-colors">
              <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-lg bg-muted">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">스케치 검색</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                키워드로 기본 스케치을 검색하고 아이템에 바로 적용하세요.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl border border-border bg-card hover:bg-card/80 transition-colors">
              <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-lg bg-muted">
                <svg
                  className="w-5 h-5 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI 이미지 생성</h3>
              <p className="text-sm text-foreground/70 leading-relaxed">
                원하는 스케치이 없다면? AI가 텍스트 설명으로 맞춤 이미지를 만들어드려요.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>&copy; 2025 Mytem. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-muted-foreground transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="hover:text-muted-foreground transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
