import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 인증 성공 시 대시보드로 리다이렉트
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // 오류 발생 시 로그인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
