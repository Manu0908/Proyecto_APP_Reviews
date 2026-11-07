"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_AUDIT_AREAS } from "@/data/mockData";
import {
  calculateBiosecurityScore,
  CRITICAL_VETO_THRESHOLD,
  derivePillarScoresFromChips,
} from "@/features/biosecurity/calculator";
import { submitReviewAction } from "@/actions/reviews.actions";
import {
  CompressedImageResult,
  compressImageToWebP,
} from "@/lib/image-compression";

interface QuickAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId?: string;
  restaurantName?: string;
  restaurantLocation?: string;
}

export function QuickAuditModal({
  isOpen,
  onClose,
  restaurantId = "los-maracuchos-gaira",
  restaurantName,
}: QuickAuditModalProps) {
  const router = useRouter();
  // Estado para acordeones abiertos
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    bathrooms: true,
    staff: true,
    utensils: false,
    hall: false,
  });

  // Estado de chips seleccionados (por defecto marcamos una base favorable para agilizar la inspección)
  const [selectedChips, setSelectedChips] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    MOCK_AUDIT_AREAS.forEach((area) => {
      area.chips.forEach((chip, idx) => {
        initial[chip.id] = chip.selectedByDefault || idx < 3;
      });
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverFeedback, setServerFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [evidenceNote, setEvidenceNote] = useState("");
  const [hasReceipt, setHasReceipt] = useState(false);
  const [compressedPhoto, setCompressedPhoto] =
    useState<CompressedImageResult | null>(null);
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const activeChipIds = Object.entries(selectedChips)
    .filter(([, active]) => active)
    .map(([id]) => id);

  const livePillars = derivePillarScoresFromChips(activeChipIds);
  const liveCalculation = calculateBiosecurityScore(livePillars);
  const requiresAntiDefamationComment =
    livePillars.scoreCritical <= CRITICAL_VETO_THRESHOLD;

  const toggleAccordion = (id: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleChip = (chipId: string) => {
    setErrorMessage(null);
    setSelectedChips((prev) => ({
      ...prev,
      [chipId]: !prev[chipId],
    }));
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsCompressingPhoto(true);
    try {
      const result = await compressImageToWebP(file);
      setCompressedPhoto(result);
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "No se pudo comprimir la fotografía seleccionada."
      );
    } finally {
      setIsCompressingPhoto(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);
    setServerFeedback(null);
    setIsSubmitting(true);

    try {
      const response = await submitReviewAction({
        restaurantId,
        restaurantName,
        scoreCritical: livePillars.scoreCritical,
        scoreOperational: livePillars.scoreOperational,
        scoreUtensils: livePillars.scoreUtensils,
        scoreDining: livePillars.scoreDining,
        selectedChips: activeChipIds,
        comment: evidenceNote,
        hasVerifiedReceipt: hasReceipt,
        photoBytes: compressedPhoto?.compressedBytes,
      });

      if (!response.success) {
        setErrorMessage(response.message);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setServerFeedback(response.message);
      router.refresh();

      setTimeout(() => {
        setIsSuccess(false);
        setServerFeedback(null);
        onClose();
      }, 1500);
    } catch {
      setIsSubmitting(false);
      setErrorMessage("Error de red al procesar la auditoría sanitaria.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end max-w-md mx-auto">
      {/* Backdrop blur overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-[4px] z-10 transition-opacity"
      />

      {/* Bottom Sheet Modal Container */}
      <div className="relative z-20 w-full bg-surface-container-low border-t border-outline-variant/40 rounded-t-[28px] frosted-sheet flex flex-col max-h-[85vh] transition-all duration-300 shadow-2xl">
        {/* Top Handle Bar */}
        <div
          onClick={onClose}
          className="w-full pt-3 pb-2 flex justify-center items-center cursor-pointer"
        >
          <div className="w-12 h-1 rounded-full bg-outline-variant/70 hover:bg-outline transition-colors" />
        </div>

        {/* Modal Header Section */}
        <div className="px-5 pt-1 pb-3 flex items-center justify-between border-b border-outline-variant/20">
          <div>
            <h2 className="font-headline-sm text-[20px] text-on-surface font-semibold tracking-tight">
              Calificar y Opinar
            </h2>
            <p className="font-body-sm text-[12px] text-outline mt-0.5">
              {restaurantName
                ? `Evaluando: ${restaurantName} (${liveCalculation.score} pts)`
                : `Marca los puntos observados (${liveCalculation.score} pts)`}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
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
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                      <span
                        className="material-symbols-outlined text-[18px]"
                        data-icon={area.icon}
                      >
                        {area.icon}
                      </span>
                    </div>
                    <div>
                      <span className="font-label-md text-[13.5px] text-on-surface font-medium block">
                        {area.name}
                      </span>
                      <span className="font-label-caps text-[9px] text-outline block">
                        {area.chips.length} criterios clave
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="font-label-caps text-[10.5px] px-2.5 py-0.5 rounded-full bg-secondary-container text-primary font-semibold">
                      {areaActiveCount}/{area.chips.length}
                    </span>
                    <span
                      className={`material-symbols-outlined text-outline transition-transform duration-200 ${
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
                            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 ${
                              isSelected
                                ? "bg-primary-container text-on-primary-container border border-primary/40 shadow-sm"
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

          {/* Aviso de Veto Sanitario y Regla Anti-Difamación */}
          {requiresAntiDefamationComment && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-rose-500/40 text-rose-200 text-[11.5px] leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-rose-300 shrink-0 mt-0.5">
                warning
              </span>
              <span>
                <strong>Veto Sanitario Crítico Activo (Tope 45.0 pts):</strong> Al reportar una deficiencia crítica en baños/salubridad, debes describir el hallazgo con al menos 30 caracteres ({evidenceNote.trim().length}/30).
              </span>
            </div>
          )}

          {/* Notes & Evidence Section */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-label-caps text-outline block uppercase tracking-wider text-[10px]">
                {requiresAntiDefamationComment
                  ? "Justificación Sanitaria Obligatoria (Mín. 30 caracteres) *"
                  : "Comentario y Fotos (Opcional)"}
              </label>
              <button
                type="button"
                onClick={() => setHasReceipt(!hasReceipt)}
                className={`text-[10.5px] font-label-caps px-2.5 py-1 rounded-full border transition-all inline-flex items-center gap-1 ${
                  hasReceipt
                    ? "bg-secondary-container text-primary border-primary/50 font-bold"
                    : "text-outline border-outline-variant/40 hover:text-on-surface"
                }`}
              >
                {hasReceipt ? (
                  <>
                    <span className="material-symbols-outlined text-[13px] text-teal-400">check</span>
                    <span>Foto de Factura Adjunta</span>
                  </>
                ) : (
                  "+ Adjuntar Factura"
                )}
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <div className="relative flex items-center">
              <input
                type="text"
                value={evidenceNote}
                onChange={(e) => {
                  setErrorMessage(null);
                  setEvidenceNote(e.target.value);
                }}
                placeholder={
                  requiresAntiDefamationComment
                    ? "Describe el hallazgo crítico (mínimo 30 caracteres)..."
                    : "Escribe tu opinión o detalles del local..."
                }
                className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-full px-4 py-2.5 text-body-sm text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all pr-24 font-body-md"
              />
              <button
                type="button"
                disabled={isCompressingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="absolute right-1.5 px-3 py-1.5 rounded-full bg-secondary-container hover:bg-secondary-container/90 text-primary font-label-md text-[12px] flex items-center space-x-1 transition-colors border border-outline-variant/40"
              >
                <span
                  className="material-symbols-outlined text-[16px]"
                  data-icon="photo_camera"
                >
                  photo_camera
                </span>
                <span>{isCompressingPhoto ? "..." : "Foto"}</span>
              </button>
            </div>

            {compressedPhoto && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-secondary-container/40 border border-primary/30 text-[11px] text-on-surface">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="material-symbols-outlined text-[14px] text-teal-400">
                    check_circle
                  </span>
                  <span className="truncate">{compressedPhoto.file.name}</span>
                </span>
                <span className="text-primary font-metric-sm shrink-0 ml-2">
                  {(compressedPhoto.compressedBytes / 1024).toFixed(1)} KB WebP (Sin EXIF)
                </span>
              </div>
            )}

            {errorMessage && (
              <p className="text-[11.5px] text-rose-300 bg-red-950/60 border border-rose-500/40 rounded-xl px-3 py-2">
                {errorMessage}
              </p>
            )}

            {serverFeedback && (
              <p className="text-[11.5px] text-teal-300 bg-teal-950/60 border border-teal-500/40 rounded-xl px-3 py-2">
                {serverFeedback}
              </p>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-3">
            <button
              type="button"
              disabled={isSubmitting || isSuccess}
              onClick={handleSubmit}
              className={`w-full py-3.5 px-6 rounded-full font-headline-sm text-[15px] font-semibold tracking-tight active:scale-[0.98] transition-all flex items-center justify-center space-x-2 ${
                isSuccess
                  ? "bg-teal-600 text-white border border-teal-500 shadow-md"
                  : "bg-primary text-on-primary hover:bg-primary/95 shadow-md"
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
                  <span>Publicando Reseña...</span>
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
                  <span>¡Reseña Publicada con Éxito!</span>
                </>
              ) : (
                <>
                  <span
                    className="material-symbols-outlined text-[19px]"
                    data-icon="rate_review"
                  >
                    rate_review
                  </span>
                  <span>Publicar Reseña</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
