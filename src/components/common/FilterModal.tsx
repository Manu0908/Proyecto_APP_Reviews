"use client";

import { useState } from "react";
import { BiosecurityLevel } from "@/types";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  maxDistance: number;
  onSelectDistance: (dist: number) => void;
  onlyVerifiedReceipt: boolean;
  onToggleVerifiedReceipt: (val: boolean) => void;
  zeroInfractionsOnly: boolean;
  onToggleZeroInfractions: (val: boolean) => void;
  onReset: () => void;
}

export function FilterModal({
  isOpen,
  onClose,
  selectedLevel,
  onSelectLevel,
  maxDistance,
  onSelectDistance,
  onlyVerifiedReceipt,
  onToggleVerifiedReceipt,
  zeroInfractionsOnly,
  onToggleZeroInfractions,
  onReset,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-sm z-10"
      />

      {/* Sheet Container */}
      <div className="relative z-20 w-full bg-surface-container-low border-t border-outline-variant/40 rounded-t-[28px] frosted-sheet flex flex-col max-h-[82vh] transition-all">
        {/* Top Handle */}
        <div
          onClick={onClose}
          className="w-full pt-3 pb-1 flex justify-center items-center cursor-pointer"
        >
          <div className="w-12 h-1 rounded-full bg-outline-variant/70 hover:bg-outline transition-colors" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-3 flex items-center justify-between border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-primary text-[20px]"
              data-icon="tune"
            >
              tune
            </span>
            <h3 className="font-headline-sm text-[18px] text-on-surface font-medium">
              Filtros de Bioseguridad
            </h3>
          </div>
          <button
            onClick={onReset}
            className="text-[11.5px] font-label-caps text-outline hover:text-primary transition-colors uppercase tracking-wider"
          >
            Restablecer
          </button>
        </div>

        {/* Body scrollable */}
        <div className="overflow-y-auto custom-scrollbar px-5 py-4 space-y-4 pb-8">
          {/* Nivel de Bioseguridad */}
          <div>
            <label className="font-label-caps text-outline text-[10px] block uppercase tracking-wider mb-2">
              Nivel de Bioseguridad Requerido
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Todos los Grados" },
                { id: "aseptico", label: "N5: Aséptico (95-100)" },
                { id: "esterilizado", label: "N4: Esterilizado (80-94)" },
                { id: "antiseptico", label: "N3: Antiséptico (70-79)" },
                { id: "filtrado", label: "N2: Filtrado (60-69)" },
                { id: "alerta", label: "N1: Alerta Sanitaria (<60)" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onSelectLevel(lvl.id)}
                  className={`px-3 py-1.5 rounded-full text-label-md text-[12px] font-medium border transition-all ${
                    selectedLevel === lvl.id
                      ? "bg-primary-container text-on-primary-container border-primary/50 shadow-sm"
                      : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30 hover:border-primary/40"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Radio de Distancia */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-label-caps text-outline text-[10px] block uppercase tracking-wider">
                Distancia Máxima
              </label>
              <span className="font-metric-sm text-primary text-[12px]">
                {maxDistance === 10 ? "Toda la ciudad" : `< ${maxDistance} km`}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 3, 5, 10].map((dist) => (
                <button
                  key={dist}
                  type="button"
                  onClick={() => onSelectDistance(dist)}
                  className={`py-1.5 rounded-xl text-center text-label-md text-[11.5px] font-medium border transition-all ${
                    maxDistance === dist
                      ? "bg-secondary-container text-primary border-primary/50 font-bold"
                      : "bg-surface-container-high/50 text-outline border-outline-variant/30"
                  }`}
                >
                  {dist === 10 ? "Ciudad" : `${dist} km`}
                </button>
              ))}
            </div>
          </div>

          {/* Filtros Especiales / Switches */}
          <div className="space-y-2 pt-2 border-t border-outline-variant/20">
            <label className="font-label-caps text-outline text-[10px] block uppercase tracking-wider mb-2">
              Garantías de Auditoría
            </label>

            {/* Switch: Visita Verificada */}
            <div
              onClick={() => onToggleVerifiedReceipt(!onlyVerifiedReceipt)}
              className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="material-symbols-outlined text-primary text-[20px]"
                  data-icon="receipt_long"
                >
                  receipt_long
                </span>
                <div>
                  <span className="font-label-md text-[13px] text-on-surface font-medium block">
                    Solo Visitas Verificadas
                  </span>
                  <span className="font-body-sm text-[11px] text-outline">
                    Con ticket/recibo auditado por comensales
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                  onlyVerifiedReceipt ? "bg-primary" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-surface transition-transform ${
                    onlyVerifiedReceipt ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* Switch: Cero Infracciones */}
            <div
              onClick={() => onToggleZeroInfractions(!zeroInfractionsOnly)}
              className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="material-symbols-outlined text-primary text-[20px]"
                  data-icon="check_circle"
                >
                  check_circle
                </span>
                <div>
                  <span className="font-label-md text-[13px] text-on-surface font-medium block">
                    0 Infracciones Sanitarias
                  </span>
                  <span className="font-body-sm text-[11px] text-outline">
                    Sin observaciones en manipulación o baños
                  </span>
                </div>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors relative flex items-center p-0.5 ${
                  zeroInfractionsOnly ? "bg-primary" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-surface transition-transform ${
                    zeroInfractionsOnly ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Botón Aplicar */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-full bg-primary-container hover:bg-primary text-on-primary-container font-headline-sm text-[14px] font-semibold tracking-tight shadow-lg active:scale-95 transition-all text-center"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
