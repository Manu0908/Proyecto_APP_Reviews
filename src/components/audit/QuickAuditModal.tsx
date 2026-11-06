"use client";

import { useState } from "react";
import { MOCK_AUDIT_AREAS } from "@/data/mockData";

interface QuickAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantName?: string;
  restaurantLocation?: string;
}

export function QuickAuditModal({
  isOpen,
  onClose,
  restaurantName = "L’Écume Marine",
  restaurantLocation = "Mayfair, London W1J",
}: QuickAuditModalProps) {
  // Estado para acordeones abiertos
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    bathrooms: true,
    staff: true,
    utensils: true,
    hall: true,
  });

  // Estado de chips seleccionados
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_AUDIT_AREAS.forEach((area) => {
      area.chips.forEach((chip) => {
        initial[chip.id] = chip.selectedByDefault;
      });
    });
    return initial;
  });

  // Estado de simulación de submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [hasReceipt, setHasReceipt] = useState(false);

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleChip = (chipId: string) => {
    setSelectedChips((prev) => ({
      ...prev,
      [chipId]: !prev[chipId],
    }));
  };

  // Cálculo reactivo del porcentaje y grado
  const allChipIds = MOCK_AUDIT_AREAS.flatMap((a) => a.chips.map((c) => c.id));
  const activeCount = allChipIds.filter((id) => selectedChips[id]).length;
  const currentScore = ((activeCount / allChipIds.length) * 100).toFixed(1);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto">
      {/* Backdrop blur overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-surface-container-lowest/70 backdrop-blur-[4px] z-10 transition-opacity"
      />

      {/* Bottom Sheet Modal Container */}
      <div className="relative z-20 w-full bg-surface-container-low/95 border-t border-outline-variant/40 rounded-t-[28px] frosted-sheet flex flex-col max-h-[85vh] transition-all duration-300">
        {/* Top Handle Bar */}
        <div
          onClick={onClose}
          className="w-full pt-3 pb-2 flex justify-center items-center cursor-pointer"
        >
          <div className="w-12 h-1 rounded-full bg-outline-variant/70 hover:bg-outline transition-colors" />
        </div>

        {/* Modal Header Section */}
        <div className="px-5 pt-1 pb-3 flex items-start justify-between border-b border-outline-variant/20">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-caps text-secondary tracking-widest uppercase text-[10px]">
                Modo Inspección Rápida
              </span>
            </div>
            <h2 className="font-headline-md text-[22px] text-on-surface font-normal tracking-tight">
              Auditoría Sanitaria
            </h2>
            <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5 flex items-center gap-1.5">
              <span
                className="material-symbols-outlined text-primary text-[15px]"
                data-icon="pin_drop"
              >
                pin_drop
              </span>
              <span>
                {restaurantName} • {restaurantLocation}
              </span>
            </p>
          </div>

          {/* Live Composite Score Meter */}
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-surface-container-high border border-primary/30 shadow-[0_0_12px_rgba(173,204,211,0.18)]">
              <span
                className="material-symbols-outlined text-primary text-[17px]"
                data-icon="verified_user"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <div className="flex items-baseline">
                <span className="font-label-caps text-[9px] text-on-surface-variant mr-1">
                  GRADE
                </span>
                <span className="font-metric-sm text-metric-sm text-on-surface font-semibold">
                  {currentScore}
                </span>
              </div>
            </div>
            <span className="font-label-caps text-[9px] text-primary/80 mt-1 uppercase tracking-wider">
              {Number(currentScore) >= 95
                ? "Aséptico Platinum"
                : Number(currentScore) >= 80
                ? "Esterilizado"
                : Number(currentScore) >= 65
                ? "Antiséptico"
                : Number(currentScore) >= 40
                ? "Filtrado"
                : "Orgánico"}
            </span>
          </div>
        </div>

        {/* Scrollable Inspection Accordion Area */}
        <div className="overflow-y-auto custom-scrollbar px-5 py-3 space-y-3 pb-8">
          {MOCK_AUDIT_AREAS.map((area) => {
            const isOpenAccordion = openAccordions[area.id];
            const areaActiveCount = area.chips.filter(
              (c) => selectedChips[c.id]
            ).length;

            return (
              <div
                key={area.id}
                className="rounded-xl border border-outline-variant/40 bg-surface-container/60 overflow-hidden backdrop-blur-md transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(area.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface-container-high/40 transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                      <span
                        className="material-symbols-outlined text-[17px]"
                        data-icon={area.icon}
                      >
                        {area.icon}
                      </span>
                    </div>
                    <div>
                      <span className="font-label-md text-[13px] text-on-surface font-medium block">
                        {area.number}. {area.name}
                      </span>
                      <span className="font-label-caps text-[9px] text-outline block">
                        {area.code}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-label-caps text-[10px] px-2 py-0.5 rounded-full bg-surface-container-highest text-primary">
                      {areaActiveCount}/{area.chips.length} pass
                    </span>
                    <span
                      className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                        isOpenAccordion ? "rotate-180" : ""
                      }`}
                      data-icon="expand_more"
                    >
                      expand_more
                    </span>
                  </div>
                </button>

                {isOpenAccordion && (
                  <div className="px-4 pb-3.5 pt-1 space-y-2 block">
                    <p className="font-body-sm text-outline text-[12px]">
                      {area.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {area.chips.map((chip) => {
                        const isSelected = selectedChips[chip.id];
                        return (
                          <button
                            key={chip.id}
                            type="button"
                            onClick={() => toggleChip(chip.id)}
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all ${
                              isSelected
                                ? "bg-primary-container text-on-primary-container border border-primary/40 shadow-[0_0_10px_rgba(123,153,160,0.3)]"
                                : "bg-surface-container-high text-on-surface-variant border border-outline-variant/60 hover:border-primary-container"
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[14px] ${
                                isSelected ? "opacity-100" : "opacity-0"
                              }`}
                              data-icon="check"
                            >
                              check
                            </span>
                            <span>{chip.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Notes & Evidence Section (Fantasma) */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-outline block uppercase tracking-wider text-[10px]">
                Nota Clínica & Evidencia Fotográfica
              </label>
              <button
                type="button"
                onClick={() => setHasReceipt(!hasReceipt)}
                className={`text-[10px] font-label-caps px-2 py-0.5 rounded-full border transition-all ${
                  hasReceipt
                    ? "bg-secondary-container text-primary border-primary/40"
                    : "text-outline border-outline-variant/40"
                }`}
              >
                {hasReceipt ? "✓ Ticket Adjunto (+50 XP)" : "+ Subir Ticket de Consumo"}
              </button>
            </div>

            <div className="relative flex items-center">
              <input
                type="text"
                value={evidenceNote}
                onChange={(e) => setEvidenceNote(e.target.value)}
                placeholder="Observación opcional (ej. revisión UV completada)..."
                className="w-full bg-surface-container-lowest/80 border border-outline-variant/60 rounded-full px-4 py-2.5 text-body-sm text-[12.5px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 transition-all pr-24"
              />
              <button
                type="button"
                onClick={() => alert("Cámara fantasma: Permite adjuntar fotos de cocina, baños o ticket.")}
                className="absolute right-1.5 px-3 py-1.5 rounded-full bg-secondary-container/80 hover:bg-secondary-container text-primary font-label-md text-[12px] flex items-center space-x-1 transition-colors border border-outline-variant/40"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  data-icon="photo_camera"
                >
                  photo_camera
                </span>
                <span>Foto</span>
              </button>
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-3">
            <button
              type="button"
              disabled={isSubmitting || isSuccess}
              onClick={handleSubmit}
              className={`w-full py-3.5 px-6 rounded-full font-headline-sm text-[15px] font-semibold tracking-tight active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${
                isSuccess
                  ? "bg-surface-bright text-primary border border-primary/40"
                  : "bg-primary-container hover:bg-primary text-on-primary-container shadow-[0_0_20px_rgba(123,153,160,0.4)]"
              }`}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="material-symbols-outlined animate-spin text-[19px]"
                    data-icon="sync"
                  >
                    sync
                  </span>
                  <span>Sellando Registro de Bioseguridad...</span>
                </>
              ) : isSuccess ? (
                <>
                  <span
                    className="material-symbols-outlined text-[19px]"
                    data-icon="check_circle"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  <span>¡Auditoría Verificada y Registrada! (+60 XP)</span>
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-[19px]"
                    data-icon="verified"
                  >
                    verified
                  </span>
                  <span>Confirmar y Enviar Auditoría</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-2 mt-2">
              <span
                className="material-symbols-outlined text-[12px] text-outline"
                data-icon="lock"
              >
                lock
              </span>
              <span className="font-label-caps text-[9px] text-outline tracking-wider">
                REGISTRO CRIPTOGRÁFICO • AUDITORÍA EN TIEMPO REAL
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
