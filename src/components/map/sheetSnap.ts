/**
 * Lógica pura de encaje (snap) de la bandeja inferior del mapa.
 *
 * Convención de coordenadas: `offset` es el translateY de la bandeja en px.
 *   0             → nivel "full" (bandeja completamente visible)
 *   peekOffset    → nivel "peek" (solo el resumen)
 *   hiddenOffset  → bandeja oculta
 * Valores mayores significan "más abajo".
 */
export type SheetLevel = "hidden" | "peek" | "full";

/** Velocidad (px/ms) a partir de la cual un gesto se considera un "flick". */
export const FLICK_VELOCITY = 0.5;

export interface ResolveSnapArgs {
  offset: number;
  /** px/ms; positivo = hacia abajo, negativo = hacia arriba. */
  velocity: number;
  peekOffset: number;
  hiddenOffset: number;
}

export function resolveSnap({
  offset,
  velocity,
  peekOffset,
  hiddenOffset,
}: ResolveSnapArgs): SheetLevel {
  // Gesto rápido: salta al nivel siguiente en la dirección del gesto
  if (velocity > FLICK_VELOCITY) {
    return offset < peekOffset ? "peek" : "hidden";
  }
  if (velocity < -FLICK_VELOCITY) {
    return offset > peekOffset ? "peek" : "full";
  }

  // Gesto lento: nivel más cercano a la posición donde se soltó
  const candidates: ReadonlyArray<[SheetLevel, number]> = [
    ["full", 0],
    ["peek", peekOffset],
    ["hidden", hiddenOffset],
  ];
  let best = candidates[0];
  for (const candidate of candidates) {
    if (Math.abs(candidate[1] - offset) < Math.abs(best[1] - offset)) {
      best = candidate;
    }
  }
  return best[0];
}
