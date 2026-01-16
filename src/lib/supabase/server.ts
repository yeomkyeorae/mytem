import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * 서버 컴포넌트 및 API Routes에서 사용하는 Supabase 클라이언트
 *
 * 사용 예시:
 * ```tsx
 * // 서버 컴포넌트
 * import { createClient } from '@/lib/supabase/server';
 *
 * export default async function Page() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('items').select('*');
 *   // ...
 * }
 * ```
 *
 * ```ts
 * // API Route
 * import { createClient } from '@/lib/supabase/server';
 *
 * export async function GET() {
 *   const supabase = await createClient();
 *   const { data } = await supabase.from('items').select('*');
 *   return Response.json({ data });
 * }
 * ```
 */
export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file."
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll 메서드는 서버 컴포넌트에서 호출될 때
          // 쿠키를 설정할 수 없는 경우가 있습니다.
          // 미들웨어에서 세션을 갱신하면 이 오류는 무시해도 됩니다.
        }
      },
    },
  });
}

/**
 * Admin 권한이 필요한 작업을 위한 Supabase 클라이언트
 * RLS(Row Level Security)를 우회합니다.
 *
 * 주의: 이 클라이언트는 서버에서만 사용해야 합니다.
 * 절대 클라이언트 측에 노출하지 마세요!
 */
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file."
    );
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, serviceRoleKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // 서버 컴포넌트에서 쿠키 설정 불가능한 경우 무시
        }
      },
    },
  });
}
