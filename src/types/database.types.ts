/**
 * Supabase 데이터베이스 타입 정의
 *
 * 이 파일은 수동으로 작성된 초기 버전입니다.
 * Supabase CLI를 사용하여 자동 생성할 수도 있습니다:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

/** 이미지 타입: 기본 스케치, 커스텀 생성, 또는 업로드된 파일 */
export type ImageType = "default" | "custom" | "uploaded";

export interface Database {
  public: {
    Tables: {
      /** 사용자 프로필 테이블 */
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      /** 카테고리 테이블 */
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      /** 아이템 테이블 */
      items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          quantity: number;
          image_url: string | null;
          image_type: ImageType | null;
          category_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          quantity?: number;
          image_url?: string | null;
          image_type?: ImageType | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          quantity?: number;
          image_url?: string | null;
          image_type?: ImageType | null;
          category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "items_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "items_category_id_fkey";
            columns: ["category_id"];
            referencedRelation: "categories";
            referencedColumns: ["id"];
          }
        ];
      };

      /** 기본 스케치 테이블 */
      pictograms: {
        Row: {
          id: string;
          name: string;
          keywords: string[];
          image_url: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          keywords: string[];
          image_url: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          keywords?: string[];
          image_url?: string;
          category?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };

      /** 사용자 커스텀 스케치 테이블 */
      custom_pictograms: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          image_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          image_url: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          prompt?: string;
          image_url?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "custom_pictograms_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      image_type: ImageType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// 편의를 위한 타입 별칭
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// 개별 테이블 타입 (자주 사용되는 타입)
export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Item = Tables<"items">;
export type Pictogram = Tables<"pictograms">;
export type CustomPictogram = Tables<"custom_pictograms">;

// Insert 타입
export type ProfileInsert = InsertTables<"profiles">;
export type CategoryInsert = InsertTables<"categories">;
export type ItemInsert = InsertTables<"items">;
export type PictogramInsert = InsertTables<"pictograms">;
export type CustomPictogramInsert = InsertTables<"custom_pictograms">;

// Update 타입
export type ProfileUpdate = UpdateTables<"profiles">;
export type CategoryUpdate = UpdateTables<"categories">;
export type ItemUpdate = UpdateTables<"items">;
export type PictogramUpdate = UpdateTables<"pictograms">;
export type CustomPictogramUpdate = UpdateTables<"custom_pictograms">;
