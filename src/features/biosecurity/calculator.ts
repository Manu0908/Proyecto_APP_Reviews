import type { BiosecurityLevel } from "../../types/index.ts";
import { MOCK_AUDIT_AREAS } from "../../data/mockData.ts";

/**
 * Pesos oficiales del Motor de Bioseguridad:
 * - Crítico (Baños, agua potable, control de plagas): 40%
 * - Operativo (Personal y manipulación de alimentos): 35%
 * - Utensilios (Vajilla, cubertería y cristalería): 15%
 * - Salón (Comedor, ventilación y superficies): 10%
 */
export const BIOSECURITY_WEIGHTS = {
  critical: 0.4,
  operational: 0.35,
  utensils: 0.15,
  dining: 0.1,
} as const;

export const CRITICAL_VETO_THRESHOLD = 2.0;
export const CRITICAL_VETO_MAX_SCORE = 45.0;

export interface BiosecurityPillarsInput {
  /** Puntuación de 1.0 a 5.0 en área crítica (Baños y Salubridad - 40%) */
  scoreCritical: number;
  /** Puntuación de 1.0 a 5.0 en área operativa (Personal y Manipulación - 35%) */
  scoreOperational: number;
  /** Puntuación de 1.0 a 5.0 en área de contacto (Vajilla y Utensilios - 15%) */
  scoreUtensils: number;
  /** Puntuación de 1.0 a 5.0 en área de comedor (Salón y Comedor - 10%) */
  scoreDining: number;
}

export interface BiosecurityCalculationResult {
  /** Puntaje final sobre 100.0 (con redondeo a 1 decimal y tope 45.0 si aplica veto) */
  score: number;
  /** Puntaje ponderado sin truncar antes de evaluar el veto */
  rawWeightedScore: number;
  /** Nivel sanitario en la escala de 5 grados de la interfaz */
  level: BiosecurityLevel;
  /** Categoría simplificada del modelo de base de datos ('excelente' | 'favorable' | 'alerta') */
  summaryTier: "excelente" | "favorable" | "alerta";
  /** Indica si se activó la Regla de Veto Sanitario (scoreCritical <= 2.0) */
  hasCriticalVeto: boolean;
  /** Cantidad de áreas con hallazgos deficitarios (< 4.0) */
  infractionsCount: number;
}

/** Limita un número al rango [min, max]. */
function clampScore(value: number, min = 1.0, max = 5.0): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/**
 * Calcula la calificación oficial de bioseguridad aplicando exactamente
 * la fórmula ponderada 40/35/15/10 y la Regla de Veto Sanitario.
 *
 * Fórmula:
 * Puntaje = ((Crítico * 0.40) + (Operativo * 0.35) + (Utensilios * 0.15) + (Salón * 0.10)) * 20.0
 *
 * Regla de Veto Sanitario:
 * Si `scoreCritical <= 2.0`, el puntaje máximo se trunca a 45.0 y el nivel
 * se degrada obligatoriamente a `alerta`.
 */
export function calculateBiosecurityScore(
  input: BiosecurityPillarsInput
): BiosecurityCalculationResult {
  const crit = clampScore(input.scoreCritical);
  const oper = clampScore(input.scoreOperational);
  const uten = clampScore(input.scoreUtensils);
  const dine = clampScore(input.scoreDining);

  const weightedFiveScale =
    crit * BIOSECURITY_WEIGHTS.critical +
    oper * BIOSECURITY_WEIGHTS.operational +
    uten * BIOSECURITY_WEIGHTS.utensils +
    dine * BIOSECURITY_WEIGHTS.dining;

  const rawWeightedScore = Number((weightedFiveScale * 20.0).toFixed(1));
  const hasCriticalVeto = crit <= CRITICAL_VETO_THRESHOLD;

  const finalScore = hasCriticalVeto
    ? Math.min(rawWeightedScore, CRITICAL_VETO_MAX_SCORE)
    : rawWeightedScore;

  const level = resolveBiosecurityLevel(finalScore, hasCriticalVeto);
  const summaryTier = resolveSummaryTier(finalScore, hasCriticalVeto);

  const infractionsCount = [crit, oper, uten, dine].filter((s) => s < 3.5).length;

  return {
    score: finalScore,
    rawWeightedScore,
    level,
    summaryTier,
    hasCriticalVeto,
    infractionsCount,
  };
}

/**
 * Determina el nivel de bioseguridad en la escala de 5 niveles de la UI.
 */
export function resolveBiosecurityLevel(
  score: number,
  hasCriticalVeto: boolean
): BiosecurityLevel {
  if (hasCriticalVeto || score < 60.0) {
    return "alerta";
  }
  if (score >= 95.0) {
    return "aseptico";
  }
  if (score >= 80.0) {
    return "esterilizado";
  }
  if (score >= 70.0) {
    return "antiseptico";
  }
  return "filtrado";
}

/**
 * Determina el semáforo de 3 niveles del esquema relacional ('excelente' | 'favorable' | 'alerta').
 */
export function resolveSummaryTier(
  score: number,
  hasCriticalVeto: boolean
): "excelente" | "favorable" | "alerta" {
  if (hasCriticalVeto || score < 60.0) {
    return "alerta";
  }
  if (score >= 80.0) {
    return "excelente";
  }
  return "favorable";
}

/**
 * Convierte la selección de micro-chips del modal de auditoría rápida
 * en puntuaciones de 1.0 a 5.0 para cada uno de los 4 pilares sanitarios.
 *
 * Para cada área:
 * - 0 chips marcados -> 1.0 (incumplimiento total del pilar)
 * - Todos los chips marcados -> 5.0 (cumplimiento total del pilar)
 * - Proporción lineal redondeada a 1 decimal en el rango [1.0, 5.0].
 */
export function derivePillarScoresFromChips(
  selectedChipIds: string[]
): BiosecurityPillarsInput {
  const selectedSet = new Set(selectedChipIds);

  const computeAreaScore = (areaId: string): number => {
    const area = MOCK_AUDIT_AREAS.find((a) => a.id === areaId);
    if (!area || area.chips.length === 0) return 3.0;
    const matched = area.chips.filter((c) => selectedSet.has(c.id)).length;
    const ratio = matched / area.chips.length;
    return Number((1.0 + ratio * 4.0).toFixed(1));
  };

  return {
    scoreCritical: computeAreaScore("bathrooms"),
    scoreOperational: computeAreaScore("staff"),
    scoreUtensils: computeAreaScore("utensils"),
    scoreDining: computeAreaScore("hall"),
  };
}

/**
 * Calcula la calificación agregada de un establecimiento a partir de múltiples auditorías,
 * replicando de forma idéntica el trigger transaccional `trg_sync_biosecurity_score` de PostgreSQL:
 * - Promedio aritmético de cada uno de los 4 pilares (40/35/15/10).
 * - Regla de Veto Sanitario (`BOOL_OR(score_critical <= 2.0)`): si CUALQUIER auditoría reporta
 *   `scoreCritical <= 2.0`, el puntaje global se trunca a un máximo de 45.0 y el nivel pasa a `alerta`.
 */
export function calculateAggregateBiosecurityScore(
  reviews: BiosecurityPillarsInput[]
): BiosecurityCalculationResult {
  if (reviews.length === 0) {
    return calculateBiosecurityScore({
      scoreCritical: 5.0,
      scoreOperational: 5.0,
      scoreUtensils: 5.0,
      scoreDining: 5.0,
    });
  }

  const normalized = reviews.map((r) => ({
    scoreCritical: clampScore(r.scoreCritical),
    scoreOperational: clampScore(r.scoreOperational),
    scoreUtensils: clampScore(r.scoreUtensils),
    scoreDining: clampScore(r.scoreDining),
  }));

  const count = normalized.length;
  const avgCritical =
    normalized.reduce((acc, r) => acc + r.scoreCritical, 0) / count;
  const avgOperational =
    normalized.reduce((acc, r) => acc + r.scoreOperational, 0) / count;
  const avgUtensils =
    normalized.reduce((acc, r) => acc + r.scoreUtensils, 0) / count;
  const avgDining =
    normalized.reduce((acc, r) => acc + r.scoreDining, 0) / count;

  const weightedFiveScale =
    avgCritical * BIOSECURITY_WEIGHTS.critical +
    avgOperational * BIOSECURITY_WEIGHTS.operational +
    avgUtensils * BIOSECURITY_WEIGHTS.utensils +
    avgDining * BIOSECURITY_WEIGHTS.dining;

  const rawWeightedScore = Number((weightedFiveScale * 20.0).toFixed(1));
  const hasCriticalVeto = normalized.some(
    (r) => r.scoreCritical <= CRITICAL_VETO_THRESHOLD
  );

  const finalScore = hasCriticalVeto
    ? Math.min(rawWeightedScore, CRITICAL_VETO_MAX_SCORE)
    : rawWeightedScore;

  const level = resolveBiosecurityLevel(finalScore, hasCriticalVeto);
  const summaryTier = resolveSummaryTier(finalScore, hasCriticalVeto);
  const infractionsCount = [
    avgCritical,
    avgOperational,
    avgUtensils,
    avgDining,
  ].filter((s) => s < 3.5).length;

  return {
    score: finalScore,
    rawWeightedScore,
    level,
    summaryTier,
    hasCriticalVeto,
    infractionsCount,
  };
}

