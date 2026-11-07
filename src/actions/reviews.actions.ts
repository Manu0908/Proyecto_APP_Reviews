"use server";

import { revalidatePath } from "next/cache";
import {
  CreateReviewInput,
  CreateReviewSchema,
} from "@/lib/validations/schemas";
import {
  BiosecurityCalculationResult,
  calculateBiosecurityScore,
} from "@/features/biosecurity/calculator";
import {
  createServerSupabaseClient,
  recordFallbackReview,
} from "@/lib/supabase/server";

export interface SubmitReviewResponse {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  calculation?: BiosecurityCalculationResult;
  persistedInDatabase?: boolean;
}

/**
 * Server Action para registrar una auditoría ciudadana de bioseguridad.
 * 1. Valida estrictamente el payload con Zod (incluyendo la regla anti-difamación >= 30 caracteres si crítico <= 2.0).
 * 2. Ejecuta el motor de dominio 40/35/15/10 + regla de veto sanitario.
 * 3. Si Supabase está configurado y hay sesión activa, persiste en PostgreSQL (reviews y review_photos);
 *    y sincroniza siempre el almacén resiliente del servidor devolviendo el cálculo real.
 */
export async function submitReviewAction(
  rawInput: CreateReviewInput
): Promise<SubmitReviewResponse> {
  const parsed = CreateReviewSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ||
        "Los datos de la auditoría no superaron la validación sanitaria.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const calculation = calculateBiosecurityScore({
    scoreCritical: data.scoreCritical,
    scoreOperational: data.scoreOperational,
    scoreUtensils: data.scoreUtensils,
    scoreDining: data.scoreDining,
  });

  const supabase = await createServerSupabaseClient();
  let persistedInDatabase = false;

  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: insertedReview, error } = await supabase
          .from("reviews")
          .insert({
            restaurant_id: data.restaurantId,
            user_id: user.id,
            score_critical: data.scoreCritical,
            score_operational: data.scoreOperational,
            score_utensils: data.scoreUtensils,
            score_dining: data.scoreDining,
            selected_chips: data.selectedChips,
            comment: data.comment || null,
            has_verified_receipt: data.hasVerifiedReceipt,
          })
          .select("id")
          .single();

        if (!error && insertedReview?.id) {
          persistedInDatabase = true;

          if (typeof data.photoBytes === "number" && data.photoBytes > 0) {
            await supabase.from("review_photos").insert({
              review_id: insertedReview.id,
              storage_path: `evidence/${data.restaurantId}/${insertedReview.id}.webp`,
              size_bytes: data.photoBytes,
            });
          }
        }
      }
    } catch {
      // Mantiene operación resiliente si la tabla aún no fue migrada en el proyecto remoto
      persistedInDatabase = false;
    }
  }

  const fallbackRecord = recordFallbackReview({
    restaurantId: data.restaurantId,
    pillars: {
      scoreCritical: data.scoreCritical,
      scoreOperational: data.scoreOperational,
      scoreUtensils: data.scoreUtensils,
      scoreDining: data.scoreDining,
    },
    comment: data.comment || "",
    hasVerifiedReceipt: data.hasVerifiedReceipt,
  });

  const finalScore = fallbackRecord.updatedRestaurant?.grade ?? calculation.score;

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/restaurant/${data.restaurantId}`);
  revalidatePath("/api/map/pins");

  return {
    success: true,
    message: calculation.hasCriticalVeto
      ? `Auditoría registrada con Veto Sanitario activo (${finalScore} pts • Nivel Alerta).`
      : `Auditoría registrada con éxito (${finalScore} pts).`,
    calculation,
    persistedInDatabase,
  };
}
