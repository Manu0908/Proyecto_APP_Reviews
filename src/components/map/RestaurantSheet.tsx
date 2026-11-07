"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import Link from "next/link";
import { Restaurant } from "@/types";
import { resolveSnap } from "@/components/map/sheetSnap";
import { useOneTimeHint } from "@/hooks/useOneTimeHint";

export type OpenSheetLevel = "peek" | "full";

/** Alturas de la bandeja en px. Exportadas para que el mapa deje libre ese espacio. */
export const SHEET_FULL_HEIGHT = 224;
export const SHEET_PEEK_HEIGHT = 104;

const PEEK_OFFSET = SHEET_FULL_HEIGHT - SHEET_PEEK_HEIGHT;
const HIDDEN_OFFSET = SHEET_FULL_HEIGHT + 24; // +24 para ocultar también la sombra
const DRAG_THRESHOLD_PX = 6;
const HINT_STORAGE_KEY = "hint:sheet-drag:v1";
const HINT_AUTO_DISMISS_MS = 5000;

interface RestaurantSheetProps {
  /** null = bandeja oculta. */
  restaurant: Restaurant | null;
  level: OpenSheetLevel;
  onLevelChange: (level: OpenSheetLevel) => void;
  onClose: () => void;
  onRate: () => void;
}

interface DragState {
  pointerId: number;
  startY: number;
  startOffset: number;
  lastY: number;
  lastTime: number;
  velocity: number;
  active: boolean;
}

export function RestaurantSheet({
  restaurant,
  level,
  onLevelChange,
  onClose,
  onRate,
}: RestaurantSheetProps) {
  // Conserva el último restaurante para que el contenido no desaparezca durante la animación de cierre
  const [displayed, setDisplayed] = useState<Restaurant | null>(restaurant);
  useEffect(() => {
    if (restaurant) setDisplayed(restaurant);
  }, [restaurant]);

  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const suppressClickRef = useRef(false);

  const [hintPending, dismissHint] = useOneTimeHint(HINT_STORAGE_KEY);
  const isOpen = restaurant !== null;
  const showHint = hintPending && isOpen && level === "peek";

  // La pista se descarta sola tras unos segundos, o al llegar al nivel completo
  useEffect(() => {
    if (!showHint) return;
    const timer = window.setTimeout(dismissHint, HINT_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [showHint, dismissHint]);

  useEffect(() => {
    if (hintPending && level === "full") dismissHint();
  }, [hintPending, level, dismissHint]);

  const restingOffset = !isOpen ? HIDDEN_OFFSET : level === "full" ? 0 : PEEK_OFFSET;
  const offset = dragOffset ?? restingOffset;

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!isOpen || (e.pointerType === "mouse" && e.button !== 0)) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startOffset: restingOffset,
      lastY: e.clientY,
      lastTime: e.timeStamp,
      velocity: 0,
      active: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;

    const deltaY = e.clientY - drag.startY;
    if (!drag.active) {
      if (Math.abs(deltaY) < DRAG_THRESHOLD_PX) return;
      // Captura solo tras superar el umbral: así los toques simples siguen siendo clics en los botones
      drag.active = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      if (hintPending) dismissHint();
    }

    const elapsed = e.timeStamp - drag.lastTime;
    if (elapsed > 0) {
      const instant = (e.clientY - drag.lastY) / elapsed;
      drag.velocity = drag.velocity * 0.6 + instant * 0.4; // suavizado
    }
    drag.lastY = e.clientY;
    drag.lastTime = e.timeStamp;

    let next = drag.startOffset + deltaY;
    // Estiramiento elástico hacia arriba: se estira como lengua dinámica y se auto-ajusta suavemente al soltarla
    if (next < 0) next = next * 0.35;
    setDragOffset(Math.min(next, HIDDEN_OFFSET));
  };

  const finishDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag || drag.pointerId !== e.pointerId || !drag.active) {
      setDragOffset(null);
      return;
    }

    suppressClickRef.current = true;
    const finalOffset = drag.startOffset + (e.clientY - drag.startY);
    const target = resolveSnap({
      offset: finalOffset,
      velocity: drag.velocity,
      peekOffset: PEEK_OFFSET,
      hiddenOffset: HIDDEN_OFFSET,
    });
    setDragOffset(null);

    if (target === "hidden") onClose();
    else onLevelChange(target);
  };

  // Evita que soltar tras un arrastre dispare el clic del elemento debajo del dedo
  const handleClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const toggleLevel = () => {
    onLevelChange(level === "peek" ? "full" : "peek");
  };

  const reviewCount = displayed?.reviews.length ?? 0;

  return (
    <div
      className={`absolute inset-x-0 z-30 will-change-transform ${
        dragOffset === null
          ? "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          : ""
      }`}
      style={{
        height: SHEET_FULL_HEIGHT + 120,
        bottom: -120,
        transform: `translateY(${offset}px)`,
      }}
      aria-hidden={!isOpen}
    >
      {/* Pista de arrastre de una sola vez, flotando sobre la bandeja */}
      {showHint && (
        <div className="absolute -top-11 inset-x-0 flex justify-center pointer-events-none animate-fade-in">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-highest/95 border border-outline-variant/50 text-on-surface text-[12px] shadow-lg">
            <span className="material-symbols-outlined text-[16px] text-primary">swipe_up</span>
            Desliza hacia arriba para más opciones
          </span>
        </div>
      )}

      <div
        role="dialog"
        aria-label={displayed ? `Resumen de ${displayed.name}` : "Resumen del restaurante"}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleClickCapture}
        className={`h-full ocean-glass-card rounded-t-3xl border-t border-outline-variant/40 px-4 pb-32 touch-none select-none flex flex-col ${
          showHint ? "motion-safe:animate-sheet-nudge" : ""
        }`}
      >
        {/* Tirador */}
        <button
          type="button"
          onClick={toggleLevel}
          aria-label={level === "peek" ? "Mostrar más opciones" : "Mostrar menos"}
          className="w-full pt-2.5 pb-2 flex justify-center cursor-grab active:cursor-grabbing"
        >
          <span className="w-10 h-1.5 rounded-full bg-outline-variant hover:bg-primary transition-colors" />
        </button>

        {displayed && (
          <div key={displayed.id} className="flex flex-col gap-3 animate-fade-in">
            {/* Resumen (niveles 1 y 2): nombre, dirección y puntuación */}
            <div
              onClick={level === "peek" ? () => onLevelChange("full") : undefined}
              className={`flex items-center justify-between gap-3 ${
                level === "peek" ? "cursor-pointer" : ""
              }`}
            >
              <div className="min-w-0">
                <h2 className="font-headline-sm text-[19px] leading-tight text-on-surface truncate">
                  {displayed.name}
                </h2>
                <p className="mt-0.5 text-[12px] text-outline flex items-center gap-1 min-w-0">
                  <span className="material-symbols-outlined text-[14px] shrink-0">location_on</span>
                  <span className="truncate">{displayed.location}</span>
                </p>
              </div>

              <div
                className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary-container/70 border border-primary/40"
                aria-label={`Puntuación ${displayed.grade} de 100`}
              >
                <span
                  className="material-symbols-outlined text-primary text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <span className="font-metric-display text-[17px] leading-none font-semibold text-on-surface">
                  {displayed.grade}
                </span>
              </div>
            </div>

            {/* Nivel 2: opiniones + acciones */}
            <div
              className={`flex flex-col gap-3 transition-opacity duration-200 ${
                level === "full" || dragOffset !== null ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
              aria-hidden={level !== "full"}
            >
              <p className="flex items-center gap-1.5 text-[12.5px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">reviews</span>
                {reviewCount > 0
                  ? `${reviewCount} ${reviewCount === 1 ? "opinión" : "opiniones"} de la comunidad`
                  : "Aún sin opiniones: sé el primero"}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onRate}
                  tabIndex={level === "full" ? 0 : -1}
                  className="flex-1 h-11 rounded-full bg-primary text-on-primary text-[13.5px] font-semibold flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">rate_review</span>
                  Calificar
                </button>
                <Link
                  href={`/restaurant/${displayed.id}`}
                  tabIndex={level === "full" ? 0 : -1}
                  className="flex-1 h-11 rounded-full bg-surface-container-high border border-outline-variant/60 text-on-surface text-[13.5px] font-medium flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform"
                >
                  <span className="material-symbols-outlined text-[18px]">info</span>
                  Detalles
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
