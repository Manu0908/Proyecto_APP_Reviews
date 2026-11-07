import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: "citizen_inspector" | "verified_owner" | "moderator";
          total_audits: number;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: "citizen_inspector" | "verified_owner" | "moderator";
          total_audits?: number;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          role?: "citizen_inspector" | "verified_owner" | "moderator";
          total_audits?: number;
        };
        Relationships: [];
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          cuisine: string;
          address: string;
          city: string;
          geom: unknown;
          biosecurity_score: number;
          biosecurity_level: string;
          has_critical_veto: boolean;
          total_reviews: number;
          hero_image: string | null;
          owner_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          cuisine?: string;
          address: string;
          city?: string;
          geom: unknown;
          biosecurity_score?: number;
          biosecurity_level?: string;
          has_critical_veto?: boolean;
          total_reviews?: number;
          hero_image?: string | null;
          owner_id?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          cuisine?: string;
          address?: string;
          city?: string;
          biosecurity_score?: number;
          biosecurity_level?: string;
          has_critical_veto?: boolean;
          total_reviews?: number;
          hero_image?: string | null;
          owner_id?: string | null;
        };
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          restaurant_id: string;
          user_id: string;
          score_critical: number;
          score_operational: number;
          score_utensils: number;
          score_dining: number;
          selected_chips: string[];
          comment: string | null;
          has_verified_receipt: boolean;
          owner_reply: string | null;
          owner_reply_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          user_id: string;
          score_critical: number;
          score_operational: number;
          score_utensils: number;
          score_dining: number;
          selected_chips?: string[];
          comment?: string | null;
          has_verified_receipt?: boolean;
          owner_reply?: string | null;
          owner_reply_at?: string | null;
          created_at?: string;
        };
        Update: {
          score_critical?: number;
          score_operational?: number;
          score_utensils?: number;
          score_dining?: number;
          selected_chips?: string[];
          comment?: string | null;
          owner_reply?: string | null;
          owner_reply_at?: string | null;
        };
        Relationships: [];
      };
      review_photos: {
        Row: {
          id: string;
          review_id: string;
          storage_path: string;
          size_bytes: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          storage_path: string;
          size_bytes?: number;
          created_at?: string;
        };
        Update: {
          storage_path?: string;
          size_bytes?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

/**
 * Verifica si las variables de entorno de Supabase están configuradas con valores reales
 * (distintos del placeholder de ejemplo).
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;
  if (url.includes("tu-proyecto.supabase.co") || anonKey.includes("tu-anon-key")) {
    return false;
  }
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Crea un cliente tipado de Supabase para el navegador (Client Components).
 * Si las variables de entorno aún no están configuradas localmente, devuelve `null`
 * para permitir el fallback elegante a `MOCK_RESTAURANTS`.
 */
export function createBrowserSupabaseClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
