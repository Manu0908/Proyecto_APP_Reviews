"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { FilterModal } from "@/components/common/FilterModal";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { Restaurant } from "@/types";

const InteractiveMap = dynamic(
  () =>
    import("@/components/map/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[360px] bg-surface-container-lowest flex items-center justify-center text-outline text-[12px] font-label-caps">
        <span className="animate-pulse">Cargando Vector Cartográfico...</span>
      </div>
    ),
  }
);

export default function MapPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant>(
    MOCK_RESTAURANTS[0]
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(10);
  const [onlyVerifiedReceipt, setOnlyVerifiedReceipt] = useState(false);
  const [zeroInfractionsOnly, setZeroInfractionsOnly] = useState(false);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isUVMode, setIsUVMode] = useState(false);

  // Filtrado compuesto
  const displayedRestaurants = MOCK_RESTAURANTS.filter((r) => {
    if (activeFilter !== "all" && r.level !== activeFilter) return false;
    if (zeroInfractionsOnly && r.metrics.infractions > 0) return false;
    return true;
  });

  const handleResetFilters = () => {
    setActiveFilter("all");
    setMaxDistance(10);
    setOnlyVerifiedReceipt(false);
    setZeroInfractionsOnly(false);
  };

  return (
    <>
      <TopAppBar
        title="Índice Sanitario"
        onFilterClick={() => setIsFilterModalOpen(true)}
      />

      {/* Main Canvas con Mapa Interactivo MapLibre GL */}
      <main className="relative w-full h-[calc(100vh-116px)] flex flex-col justify-between overflow-hidden">
        {/* Controles de Filtros Flotantes Superiores */}
        <div className="absolute top-3 left-0 right-0 z-20 px-space-md pointer-events-none">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pointer-events-auto">
            {/* Toggle Modo UV */}
            <button
              onClick={() => setIsUVMode(!isUVMode)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border backdrop-blur-md shadow-lg ${
                isUVMode
                  ? "bg-purple-900/80 text-purple-200 border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.5)]"
                  : "bg-surface-container-high/90 text-on-surface-variant border-outline-variant/40 hover:border-primary/50"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]" data-icon="flare">
                flare
              </span>
              <span>Modo UV {isUVMode ? "Activo" : "Off"}</span>
            </button>

            {/* Chip Aséptico */}
            <button
              onClick={() =>
                setActiveFilter(activeFilter === "aseptico" ? "all" : "aseptico")
              }
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border backdrop-blur-md shadow-md ${
                activeFilter === "aseptico"
                  ? "bg-primary-container text-on-primary-container border-primary/50 shadow-sm"
                  : "bg-surface-container-high/90 text-on-surface-variant border-outline-variant/40 hover:border-primary/50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
              <span>💎 Aséptico ({MOCK_RESTAURANTS.filter((r) => r.level === "aseptico").length})</span>
            </button>

            {/* Chip Esterilizado */}
            <button
              onClick={() =>
                setActiveFilter(activeFilter === "esterilizado" ? "all" : "esterilizado")
              }
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border backdrop-blur-md shadow-md ${
                activeFilter === "esterilizado"
                  ? "bg-primary-container text-on-primary-container border-primary/50"
                  : "bg-surface-container-high/90 text-on-surface-variant border-outline-variant/40 hover:border-primary/50"
              }`}
            >
              <span>⚡ Esterilizado</span>
            </button>

            {/* Chip Orgánico */}
            <button
              onClick={() =>
                setActiveFilter(activeFilter === "organico" ? "all" : "organico")
              }
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border backdrop-blur-md shadow-md ${
                activeFilter === "organico"
                  ? "bg-primary-container text-on-primary-container border-primary/50"
                  : "bg-surface-container-high/90 text-on-surface-variant border-outline-variant/40 hover:border-primary/50"
              }`}
            >
              <span>🌿 Orgánico</span>
            </button>
          </div>
        </div>

        {/* Mapa Libre GL con soporte táctil, rotación y zoom */}
        <InteractiveMap
          restaurants={displayedRestaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={setSelectedRestaurant}
          isUVMode={isUVMode}
        />

        {/* Bottom Sheet Deslizante con Ficha del Restaurante Seleccionado */}
        <section className="relative z-20 w-full ocean-glass-card rounded-t-2xl px-space-md pt-2.5 pb-20 border-t border-outline-variant/30 mt-auto transition-all shadow-2xl">
          <div className="w-10 h-1 bg-outline-variant/60 rounded-full mx-auto mb-2.5 cursor-grab" />

          {/* Fila Principal: Nombre y Puntuación */}
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex-1 pr-1">
              <h2 className="font-headline-lg-mobile text-[22px] text-on-surface tracking-tight leading-tight">
                {selectedRestaurant.name}
              </h2>
              <p className="font-body-sm text-[12px] text-secondary font-light mt-0.5">
                {selectedRestaurant.tagline}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/60 border border-primary/40 shadow-[0_0_12px_rgba(123,153,160,0.25)]">
                <span
                  className="material-symbols-outlined text-primary text-[16px]"
                  data-icon="verified_user"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <span className="font-metric-display text-[18px] leading-none text-on-surface font-semibold tracking-tight">
                  {selectedRestaurant.grade}
                </span>
              </div>
              <span className="font-label-caps text-[8px] text-tertiary-fixed-dim mt-0.5 tracking-wider uppercase">
                {selectedRestaurant.auditCycle}
              </span>
            </div>
          </div>

          {/* Barra de Metadatos */}
          <div className="flex items-center gap-2 text-outline font-label-md text-[11.5px] pb-2.5 border-b border-outline-variant/20 mb-2.5">
            <span className="flex items-center gap-1 text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[13px]" data-icon="restaurant">
                restaurant
              </span>
              {selectedRestaurant.cuisine}
            </span>
            <span className="text-outline-variant">•</span>
            <span>{selectedRestaurant.subCuisine}</span>
            <span className="text-outline-variant">•</span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]" data-icon="location_on">
                location_on
              </span>
              {selectedRestaurant.location}
            </span>
          </div>

          {/* Grilla Bento de 4 Métricas Clave */}
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <div className="p-2 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[8.5px] text-outline uppercase tracking-wider">
                  Pureza de Superficies
                </div>
                <div className="font-metric-sm text-[14px] text-on-surface font-medium mt-0.5">
                  {selectedRestaurant.metrics.surfacePurity} / 100
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/80 text-[18px]" data-icon="sanitizer">
                sanitizer
              </span>
            </div>

            <div className="p-2 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[8.5px] text-outline uppercase tracking-wider">
                  Cadena de Frío
                </div>
                <div className="font-metric-sm text-[14px] text-on-surface font-medium mt-0.5">
                  {selectedRestaurant.metrics.coldChain}
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/80 text-[18px]" data-icon="thermostat">
                thermostat
              </span>
            </div>

            <div className="p-2 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[8.5px] text-outline uppercase tracking-wider">
                  Calidad del Aire
                </div>
                <div className="font-metric-sm text-[14px] text-on-surface font-medium mt-0.5">
                  {selectedRestaurant.metrics.airQuality}
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/80 text-[18px]" data-icon="air">
                air
              </span>
            </div>

            <div className="p-2 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[8.5px] text-outline uppercase tracking-wider">
                  Infracciones Sanitarias
                </div>
                <div className="font-metric-sm text-[14px] text-primary font-medium mt-0.5">
                  {selectedRestaurant.metrics.infractions} Reportadas
                </div>
              </div>
              <span
                className="material-symbols-outlined text-primary text-[18px]"
                data-icon="check_circle"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2">
            <Link
              href={`/restaurant/${selectedRestaurant.id}`}
              className="flex-1 py-2.5 px-3 rounded-full bg-primary-container text-on-primary-container font-label-md text-[12.5px] font-semibold text-center flex items-center justify-center gap-1.5 hover:shadow-[0_0_16px_rgba(166,192,198,0.4)] transition-all active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[16px]" data-icon="assignment_turned_in">
                assignment_turned_in
              </span>
              <span>Ver Dossier Sanitario</span>
            </Link>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="py-2.5 px-3.5 rounded-full bg-surface-container/60 border border-outline-variant/40 text-on-surface font-label-md text-[12.5px] font-medium hover:border-primary transition-all active:scale-95 duration-150 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]" data-icon="add">
                add
              </span>
              <span>Auditar</span>
            </button>
          </div>
        </section>
      </main>

      <BottomNavBar onOpenAudit={() => setIsAuditModalOpen(true)} />

      <QuickAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        restaurantName={selectedRestaurant.name}
        restaurantLocation={selectedRestaurant.location}
      />

      {/* Modal de Filtros Interactivo */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedLevel={activeFilter}
        onSelectLevel={setActiveFilter}
        maxDistance={maxDistance}
        onSelectDistance={setMaxDistance}
        onlyVerifiedReceipt={onlyVerifiedReceipt}
        onToggleVerifiedReceipt={setOnlyVerifiedReceipt}
        zeroInfractionsOnly={zeroInfractionsOnly}
        onToggleZeroInfractions={setZeroInfractionsOnly}
        onReset={handleResetFilters}
      />
    </>
  );
}
