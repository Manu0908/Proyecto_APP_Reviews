import { z } from "zod";
import { CRITICAL_VETO_THRESHOLD } from "../../features/biosecurity/calculator.ts";

/**
 * Bounding Box oficial de la República de Colombia (continental e insular):
 * - Latitud: -4.3° S (Leticia) a 13.5° N (Punta Gallinas / Archipiélago)
 * - Longitud: -82.0° O (San Andrés / Pacífico) a -66.8° O (Guainía)
 */
export const COLOMBIA_BOUNDS = {
  minLat: -4.3,
  maxLat: 13.5,
  minLng: -82.0,
  maxLng: -66.8,
} as const;

export const CreateReviewSchema = z
  .object({
    restaurantId: z
      .string()
      .trim()
      .min(1, "El identificador del restaurante es obligatorio."),
    restaurantName: z.string().trim().optional(),
    scoreCritical: z
      .number()
      .min(1.0, "La puntuación crítica mínima es 1.0.")
      .max(5.0, "La puntuación crítica máxima es 5.0."),
    scoreOperational: z
      .number()
      .min(1.0, "La puntuación operativa mínima es 1.0.")
      .max(5.0, "La puntuación operativa máxima es 5.0."),
    scoreUtensils: z
      .number()
      .min(1.0, "La puntuación de utensilios mínima es 1.0.")
      .max(5.0, "La puntuación de utensilios máxima es 5.0."),
    scoreDining: z
      .number()
      .min(1.0, "La puntuación de salón mínima es 1.0.")
      .max(5.0, "La puntuación de salón máxima es 5.0."),
    selectedChips: z.array(z.string()).default([]),
    comment: z
      .string()
      .trim()
      .max(1000, "El comentario no puede exceder los 1000 caracteres.")
      .optional()
      .default(""),
    hasVerifiedReceipt: z.boolean().optional().default(false),
    photoBytes: z
      .number()
      .int()
      .min(0)
      .max(150 * 1024, "La fotografía comprimida no debe superar los 150 KB.")
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Regla Anti-Difamación: si la puntuación crítica es <= 2.0 (activa Veto Sanitario),
    // se exige obligatoriamente un comentario descriptivo >= 30 caracteres.
    if (data.scoreCritical <= CRITICAL_VETO_THRESHOLD) {
      const cleanComment = (data.comment ?? "").trim();
      if (cleanComment.length < 30) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["comment"],
          message:
            "Por transparencia sanitaria (Regla Anti-Difamación), una calificación crítica de riesgo (<= 2.0) requiere describir el hallazgo con al menos 30 caracteres.",
        });
      }
    }
  });

export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;

export const CreateRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre del restaurante debe tener al menos 2 caracteres.")
    .max(120, "El nombre del restaurante es demasiado largo."),
  cuisine: z
    .string()
    .trim()
    .min(2, "La especialidad gastronómica es obligatoria.")
    .max(80, "La especialidad gastronómica es demasiado larga."),
  address: z
    .string()
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres.")
    .max(200, "La dirección no puede exceder los 200 caracteres."),
  city: z
    .string()
    .trim()
    .min(2, "La ciudad es obligatoria.")
    .max(80, "El nombre de la ciudad es demasiado largo.")
    .default("Santa Marta"),
  lat: z
    .number()
    .min(
      COLOMBIA_BOUNDS.minLat,
      `La latitud debe estar dentro del territorio de Colombia (>= ${COLOMBIA_BOUNDS.minLat}°).`
    )
    .max(
      COLOMBIA_BOUNDS.maxLat,
      `La latitud debe estar dentro del territorio de Colombia (<= ${COLOMBIA_BOUNDS.maxLat}°).`
    ),
  lng: z
    .number()
    .min(
      COLOMBIA_BOUNDS.minLng,
      `La longitud debe estar dentro del territorio de Colombia (>= ${COLOMBIA_BOUNDS.minLng}°).`
    )
    .max(
      COLOMBIA_BOUNDS.maxLng,
      `La longitud debe estar dentro del territorio de Colombia (<= ${COLOMBIA_BOUNDS.maxLng}°).`
    ),
  photoBytes: z
    .number()
    .int()
    .min(0)
    .max(150 * 1024, "La foto de fachada comprimida no debe superar los 150 KB.")
    .optional(),
});

export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
