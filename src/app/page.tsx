"use client";

import { useState, useEffect } from "react";
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
  const [selectedCity, setSelectedCity] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(10);
  const [onlyVerifiedReceipt, setOnlyVerifiedReceipt] = useState(false);
  const [zeroInfractionsOnly, setZeroInfractionsOnly] = useState(false);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isUVMode, setIsUVMode] = useState(false);
  const [sheetState, setSheetState] = useState<"peek" | "collapsed" | "expanded">("peek");

  // Filtrado compuesto con ciudad
  const displayedRestaurants = MOCK_RESTAURANTS.filter((r) => {
    if (selectedCity !== "all" && r.city !== selectedCity && !r.city.includes(selectedCity)) {
      return false;
    }
    if (activeFilter !== "all" && r.level !== activeFilter) return false;
    if (zeroInfractionsOnly && r.metrics.infractions > 0) return false;
    return true;
  });

  // Sincronización para evitar restaurante fantasma si el actual es filtrado
  useEffect(() => {
    if (
      displayedRestaurants.length > 0 &&
      !displayedRestaurants.some((r) => r.id === selectedRestaurant.id)
    ) {
      setSelectedRestaurant(displayedRestaurants[0]);
    }
  }, [displayedRestaurants, selectedRestaurant.id]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    if (city === "all") {
      setSelectedRestaurant(MOCK_RESTAURANTS[0]);
    } else {
      const firstInCity =
        MOCK_RESTAURANTS.find((r) => r.city === city || r.city.includes(city)) ||
        MOCK_RESTAURANTS[0];
      setSelectedRestaurant(firstInCity);
    }
  };

  const handleResetFilters = () => {
    setActiveFilter("all");
    setSelectedCity("all");
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
        {/* Controles de Filtros Flotantes Superiores: Selector de Ciudades */}
        <div className="absolute top-3 left-0 right-0 z-20 px-space-md pointer-events-none">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 pointer-events-auto">
            {[
              { id: "all", label: "Toda Colombia" },
              { id: "Santa Marta", label: "Santa Marta" },
              { id: "Bogotá", label: "Bogotá" },
              { id: "Medellín", label: "Medellín" },
            ].map((city) => (
              <button
                key={city.id}
                onClick={() => handleCityChange(city.id)}
                className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border backdrop-blur-md shadow-md ${
                  selectedCity === city.id
                    ? "bg-primary-container text-on-primary-container border-primary/50 font-bold"
                    : "bg-surface-container-high/90 text-on-surface-variant border-outline-variant/40"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]" data-icon="location_on">
                  location_on
                </span>
                <span>{city.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón Flotante Fijo e Inamovible: Modo Luz Negra UV */}
        <button
          onClick={() => setIsUVMode(!isUVMode)}
          className={`absolute top-14 right-3 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md text-[11.5px] border backdrop-blur-xl shadow-xl transition-all active:scale-95 ${
            isUVMode
              ? "bg-purple-950/90 text-purple-200 border-purple-400 shadow-[0_0_16px_rgba(168,85,247,0.6)]"
              : "bg-surface-container-high/90 text-on-surface-variant border-outline-variant/50 hover:border-purple-400/50"
          }`}
          title="Alternar Modo Luz Negra UV"
        >
          <span className="material-symbols-outlined text-[15px] text-purple-300" data-icon="flare">
            flare
          </span>
          <span className="font-semibold">{isUVMode ? "UV ON" : "Luz UV"}</span>
        </button>

        {/* Mapa Libre GL con soporte táctil, rotación y zoom */}
        <InteractiveMap
          restaurants={displayedRestaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={(rest) => {
            setSelectedRestaurant(rest);
            setSheetState("peek");
          }}
          isUVMode={isUVMode}
        />

        {/* Bottom Sheet Colapsable Multiestado (Dock 72px / Vista Previa 220px / Detalle Expandido) */}
        <section
          className={`relative z-20 w-full ocean-glass-card rounded-t-2xl px-space-md border-t border-outline-variant/30 mt-auto transition-all duration-300 shadow-2xl ${
            sheetState === "collapsed"
              ? "pt-2 pb-16"
              : sheetState === "expanded"
              ? "pt-2 pb-20 max-h-[72vh] overflow-y-auto"
              : "pt-2.5 pb-20"
          }`}
        >
          {/* Tirador Táctil Superior Interactivo */}
          <div
            onClick={() =>
              setSheetState(sheetState === "collapsed" ? "peek" : "collapsed")
            }
            className="w-full pt-1 pb-2 flex flex-col justify-center items-center cursor-pointer group"
            title={
              sheetState === "collapsed"
                ? "Toca para expandir ficha"
                : "Toca para replegar a modo mapa libre"
            }
          >
            <div className="w-12 h-1 bg-outline-variant/70 rounded-full group-hover:bg-primary transition-colors" />
            <span className="text-[9px] font-label-caps text-outline group-hover:text-primary mt-1 tracking-wider uppercase">
              {sheetState === "collapsed" ? "▲ Toca para ver detalles" : "▼ Replegar mapa"}
            </span>
          </div>

          {/* VISTA COLAPSADA (MINI-DOCK): 100% visibilidad del mapa */}
          {sheetState === "collapsed" ? (
            <div
              onClick={() => setSheetState("peek")}
              className="flex items-center justify-between cursor-pointer py-1"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-secondary-container/80 flex items-center justify-center text-primary border border-primary/40 shrink-0">
                  <span className="material-symbols-outlined text-[17px]">restaurant</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[15px] text-on-surface font-semibold leading-tight">
                    {selectedRestaurant.shortName}
                  </h3>
                  <span className="text-[11px] text-outline block">
                    {selectedRestaurant.city} • {selectedRestaurant.cuisine}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 rounded-full bg-secondary-container/60 border border-primary/40 shadow-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    verified_user
                  </span>
                  <span className="font-metric-display text-[15px] font-bold text-on-surface leading-none">
                    {selectedRestaurant.grade}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSheetState("peek");
                  }}
                  className="w-7 h-7 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary-container"
                  aria-label="Expandir tarjeta"
                >
                  <span className="material-symbols-outlined text-[17px]">expand_less</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Fila Principal: Nombre y Puntuación */}
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div className="flex-1 pr-1">
                  <h2 className="font-headline-lg-mobile text-[21px] text-on-surface tracking-tight leading-tight">
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
              <div className="flex items-center gap-2 text-outline font-label-md text-[11px] pb-2 border-b border-outline-variant/20 mb-2">
                <span className="flex items-center gap-1 text-on-surface-variant font-medium">
                  <span className="material-symbols-outlined text-[13px]" data-icon="restaurant">
                    restaurant
                  </span>
                  {selectedRestaurant.cuisine}
                </span>
                <span className="text-outline-variant">•</span>
                <span>{selectedRestaurant.subCuisine}</span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-0.5 truncate">
                  <span className="material-symbols-outlined text-[13px]" data-icon="location_on">
                    location_on
                  </span>
                  {selectedRestaurant.location}
                </span>
              </div>

              {/* Descripción adicional si está en estado expandido */}
              {sheetState === "expanded" && (
                <p className="text-[12px] text-on-surface-variant leading-relaxed mb-3 p-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30">
                  {selectedRestaurant.description}
                </p>
              )}

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
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="py-2.5 px-3.5 rounded-full bg-surface-container/60 border border-outline-variant/40 text-on-surface font-label-md text-[12.5px] font-medium hover:border-primary transition-all active:scale-95 duration-150 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[15px]" data-icon="add">
                    add
                  </span>
                  <span>Auditar</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSheetState(sheetState === "expanded" ? "peek" : "expanded")
                  }
                  className="p-2 rounded-full bg-surface-container/60 border border-outline-variant/40 text-outline hover:text-primary transition-all active:scale-95"
                  title={sheetState === "expanded" ? "Mostrar menos" : "Ver más detalles"}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {sheetState === "expanded" ? "unfold_less" : "unfold_more"}
                  </span>
                </button>
              </div>
            </>
          )}
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
