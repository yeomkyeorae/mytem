"use client";

import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // 현재 세션 가져오기
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    };

    getSession();

    // 인증 상태 변경 구독
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃 함수
  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user,
  };
}
