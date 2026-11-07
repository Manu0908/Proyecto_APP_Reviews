import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Route Handler ligero de salud y Keep-Alive (/api/health).
 * Ejecutado automáticamente cada 4 días por GitHub Actions para evitar
 * la pausa automática por inactividad (7 días) del plan gratuito de Supabase.
 */
export async function GET() {
  const start = Date.now();
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      {
        status: "ok",
        mode: "fallback-local",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  try {
    const { error } = await supabase
      .from("restaurants")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    return NextResponse.json(
      {
        status: "ok",
        mode: error ? "supabase-reachable-unmigrated" : "supabase-active",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  } catch {
    return NextResponse.json(
      {
        status: "ok",
        mode: "fallback-resilient",
        latencyMs: Date.now() - start,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }
}
