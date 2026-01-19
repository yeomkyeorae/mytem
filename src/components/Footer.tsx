import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-white/40">
            &copy; 2025 Mytem. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              이용약관
            </Link>
            <Link
              href="/contact"
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              문의하기
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
