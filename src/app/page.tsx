"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { FilterModal } from "@/components/common/FilterModal";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { Restaurant } from "@/types";

// Skeleton de carga estilo YouTube / Shimmer profesional
function MapSkeletonLoader() {
  return (
    <div className="absolute inset-0 z-30 bg-surface flex flex-col justify-between p-4 pointer-events-none animate-in fade-in duration-300">
      {/* Barra de búsqueda skeleton */}
      <div className="w-full h-11 rounded-full bg-surface-container-high/80 animate-pulse border border-outline-variant/30 flex items-center px-4 gap-3">
        <div className="w-5 h-5 rounded-full bg-outline-variant/40" />
        <div className="h-3.5 bg-outline-variant/30 rounded w-1/2" />
      </div>

      {/* Pines skeleton flotantes en el centro */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-secondary-container/60 border-2 border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">
              restaurant
            </span>
          </div>
          <div className="h-2.5 bg-outline-variant/40 rounded w-20" />
        </div>
      </div>

      {/* Dock skeleton inferior */}
      <div className="w-full h-24 rounded-t-2xl bg-surface-container-high/90 border-t border-outline-variant/30 p-4 space-y-2 animate-pulse mb-12">
        <div className="w-12 h-1 bg-outline-variant/50 rounded-full mx-auto" />
        <div className="flex justify-between items-center pt-1">
          <div className="space-y-1.5 w-2/3">
            <div className="h-4 bg-outline-variant/50 rounded w-3/4" />
            <div className="h-3 bg-outline-variant/30 rounded w-1/2" />
          </div>
          <div className="w-12 h-8 rounded-full bg-outline-variant/40" />
        </div>
      </div>
    </div>
  );
}

const InteractiveMap = dynamic(
  () =>
    import("@/components/map/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => <MapSkeletonLoader />,
  }
);

export default function MapPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant>(
    MOCK_RESTAURANTS[0]
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(10);
  const [onlyVerifiedReceipt, setOnlyVerifiedReceipt] = useState(false);
  const [zeroInfractionsOnly, setZeroInfractionsOnly] = useState(false);

  // Niveles del Bottom Sheet: 1 = Mini-dock (88px), 2 = Ficha rápida (250px), 3 = Ficha completa (82vh)
  const [sheetLevel, setSheetLevel] = useState<1 | 2 | 3>(1);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Control de arrastre táctil (drag gestures)
  const touchStartY = useRef<number | null>(null);

  // Simulación de carga inicial suave (evita parpadeos o saltos abruptos)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapLoaded(true);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filtrado reactivo en vivo por búsqueda y filtros de bioseguridad
  const displayedRestaurants = MOCK_RESTAURANTS.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = r.name.toLowerCase().includes(q);
      const matchesShort = r.shortName.toLowerCase().includes(q);
      const matchesCuisine = r.cuisine.toLowerCase().includes(q);
      const matchesCity = r.city.toLowerCase().includes(q);
      const matchesLocation = r.location.toLowerCase().includes(q);
      if (!matchesName && !matchesShort && !matchesCuisine && !matchesCity && !matchesLocation) {
        return false;
      }
    }
    if (activeFilter !== "all" && r.level !== activeFilter) return false;
    if (zeroInfractionsOnly && r.metrics.infractions > 0) return false;
    return true;
  });

  // Sincronización para asegurar que siempre haya un restaurante válido
  useEffect(() => {
    if (
      displayedRestaurants.length > 0 &&
      !displayedRestaurants.some((r) => r.id === selectedRestaurant.id)
    ) {
      setSelectedRestaurant(displayedRestaurants[0]);
    }
  }, [displayedRestaurants, selectedRestaurant.id]);

  const handleResetFilters = () => {
    setActiveFilter("all");
    setMaxDistance(10);
    setOnlyVerifiedReceipt(false);
    setZeroInfractionsOnly(false);
  };

  // Manejo de gestos táctiles con umbrales de arrastre (swipe up / swipe down)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    // Arrastre hacia arriba (swipe up)
    if (deltaY < -35) {
      setSheetLevel((prev) => (prev === 1 ? 2 : 3));
    }
    // Arrastre hacia abajo (swipe down)
    else if (deltaY > 35) {
      setSheetLevel((prev) => (prev === 3 ? 2 : 1));
    }

    touchStartY.current = null;
  };

  return (
    <>
      {/* Barra de Búsqueda Superior de Ancho Completo (Estilo Google Maps / inDrive) */}
      <TopAppBar
        isSearchMode={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar restaurantes, cafés, zonas en Colombia..."
        onFilterClick={() => setIsFilterModalOpen(true)}
      />

      {/* Canvas del Mapa y Bottom Sheet Draggable */}
      <main className="relative w-full h-[calc(100vh-120px)] flex flex-col justify-between overflow-hidden bg-surface">
        {!isMapLoaded && <MapSkeletonLoader />}

        {/* Mapa 2D MapLibre con estilo claro Carto Voyager */}
        <InteractiveMap
          restaurants={displayedRestaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={(rest) => {
            setSelectedRestaurant(rest);
            // Al hacer clic en un pin, la bandeja aparece en Nivel 1 (modo compacto)
            setSheetLevel(1);
          }}
        />

        {/* =========================================================================
            BOTTOM SHEET DE 3 NIVELES CON ARRASTRE TÁCTIL (Draggable Sheet)
            - Nivel 1: Mini-dock compacto (88px)
            - Nivel 2: Ficha rápida con acciones 'Calificar' y 'Ver Ficha' (250px)
            - Nivel 3: Detalle sanitario completo con botón de retroceso (82vh)
            ========================================================================= */}
        <section
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative z-20 w-full bg-surface-container-lowest/95 backdrop-blur-xl rounded-t-3xl px-4 border-t border-outline-variant/30 mt-auto transition-all duration-300 ease-out shadow-[0_-8px_30px_rgba(0,0,0,0.12)] flex flex-col ${
            sheetLevel === 1
              ? "h-[92px] pb-16"
              : sheetLevel === 2
              ? "h-[255px] pb-16"
              : "h-[82vh] pb-20 overflow-hidden"
          }`}
        >
          {/* Tirador Táctil Superior (Drag Handle con hit-area accesible de 36px) */}
          <div
            onClick={() => {
              setSheetLevel((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
            }}
            className="w-full pt-2.5 pb-2 flex flex-col justify-center items-center cursor-pointer select-none group"
            title="Desliza o toca para cambiar el nivel de la ficha"
          >
            <div className="w-12 h-1.5 bg-outline-variant/70 rounded-full group-hover:bg-primary transition-colors" />
            <div className="flex items-center gap-1 text-[10px] font-label-caps text-outline group-hover:text-primary mt-1 tracking-wider uppercase">
              {sheetLevel === 1 && (
                <>
                  <span>Desliza para opinar y ver opciones</span>
                  <span className="material-symbols-outlined text-[13px]">expand_less</span>
                </>
              )}
              {sheetLevel === 2 && (
                <>
                  <span>Desliza para ver ficha completa</span>
                  <span className="material-symbols-outlined text-[13px]">expand_less</span>
                </>
              )}
              {sheetLevel === 3 && (
                <>
                  <span>Desliza hacia abajo para replegar</span>
                  <span className="material-symbols-outlined text-[13px]">expand_more</span>
                </>
              )}
            </div>
          </div>

          {/* -----------------------------------------------------------------
              NIVEL 1: MINI-DOCK (Resumen esencial: Nombre, Dirección y Puntuación)
              ----------------------------------------------------------------- */}
          {sheetLevel === 1 && (
            <div
              onClick={() => setSheetLevel(2)}
              className="flex items-center justify-between cursor-pointer py-1 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 text-teal-700 flex items-center justify-center border border-teal-500/30 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    restaurant
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-[16px] text-on-surface font-semibold leading-snug">
                    {selectedRestaurant.shortName}
                  </h3>
                  <p className="text-[12px] text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">
                      location_on
                    </span>
                    <span className="truncate max-w-[190px]">
                      {selectedRestaurant.location || selectedRestaurant.city}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="px-3 py-1 rounded-full bg-teal-50 text-teal-900 border border-teal-200 shadow-sm flex items-center gap-1">
                  <span className="text-teal-600 font-bold text-[13px]">★</span>
                  <span className="font-metric-display text-[15px] font-bold leading-none">
                    {selectedRestaurant.grade}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSheetLevel(2);
                  }}
                  className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary hover:bg-primary-container"
                  aria-label="Subir a opciones"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    expand_less
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              NIVEL 2: FICHA RÁPIDA (Acciones claras: 'Calificar' y 'Ver Ficha')
              ----------------------------------------------------------------- */}
          {sheetLevel === 2 && (
            <div className="flex flex-col justify-between flex-1 py-1 animate-in fade-in duration-200">
              {/* Encabezado limpio */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-headline-sm text-[19px] text-on-surface font-bold leading-snug">
                    {selectedRestaurant.name}
                  </h2>
                  <p className="text-[12px] text-outline flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">
                      location_on
                    </span>
                    <span>{selectedRestaurant.location}</span>
                    <span>•</span>
                    <span>{selectedRestaurant.cuisine}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-teal-50 text-teal-900 border border-teal-200 shadow-sm shrink-0">
                  <span className="text-teal-600 font-bold text-[14px]">★</span>
                  <span className="font-metric-display text-[17px] font-bold leading-none">
                    {selectedRestaurant.grade}
                  </span>
                </div>
              </div>

              {/* Conteo de opiniones y resumen de comensales */}
              <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/30 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  reviews
                </span>
                <span>
                  {selectedRestaurant.reviews.length > 0
                    ? `${selectedRestaurant.reviews.length} opiniones verificadas de comensales`
                    : "Sé el primero en calificar este local"}
                </span>
              </div>

              {/* Botones de Acción Directos y Destacados */}
              <div className="flex items-center gap-2 pt-1 pb-2">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="flex-1 py-2.5 px-4 rounded-full bg-primary text-on-primary font-label-md text-[13px] font-semibold text-center flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]" data-icon="rate_review">
                    rate_review
                  </span>
                  <span>Calificar / Opinar</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSheetLevel(3)}
                  className="flex-1 py-2.5 px-4 rounded-full bg-surface-container-high border border-outline-variant/60 text-on-surface font-label-md text-[13px] font-medium text-center flex items-center justify-center gap-1.5 hover:border-primary active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[17px]" data-icon="info">
                    info
                  </span>
                  <span>Ver Ficha Completa</span>
                </button>
              </div>
            </div>
          )}

          {/* -----------------------------------------------------------------
              NIVEL 3: DETALLE COMPLETO (Historial, Higiene y botón de Volver)
              ----------------------------------------------------------------- */}
          {sheetLevel === 3 && (
            <div className="flex flex-col flex-1 overflow-hidden animate-in fade-in duration-200">
              {/* Barra de cabecera con botón de Volver al Mapa */}
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 mb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSheetLevel(1)}
                    className="flex items-center gap-1 text-[12.5px] font-semibold text-primary px-3 py-1 rounded-full bg-primary-container/70 border border-primary/30 hover:bg-primary-container active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      arrow_downward
                    </span>
                    <span>Volver al mapa</span>
                  </button>
                  <span className="text-[12px] text-outline font-medium">
                    Ficha del Local
                  </span>
                </div>

                <Link
                  href={`/restaurant/${selectedRestaurant.id}`}
                  className="text-[12px] font-semibold text-primary underline"
                >
                  Abrir vista completa
                </Link>
              </div>

              {/* Contenido scrolleable del Nivel 3 */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3.5 pr-1 pb-16">
                <div>
                  <h2 className="font-headline-sm text-[20px] text-on-surface font-bold">
                    {selectedRestaurant.name}
                  </h2>
                  <p className="text-[12.5px] text-outline mt-0.5">
                    {selectedRestaurant.location} • {selectedRestaurant.city}
                  </p>
                </div>

                {/* Métricas sanitarias trasladadas aquí */}
                <div>
                  <h4 className="text-[11px] font-label-caps uppercase tracking-wider text-outline mb-2">
                    Detalles Sanitarios y de Bioseguridad
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-surface-container-high/70 border border-outline-variant/40 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-label-caps text-outline uppercase">
                          Pureza Superficies
                        </div>
                        <div className="text-[14px] font-bold text-on-surface mt-0.5">
                          {selectedRestaurant.metrics.surfacePurity} / 100
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[19px]">
                        sanitizer
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-container-high/70 border border-outline-variant/40 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-label-caps text-outline uppercase">
                          Cadena de Frío
                        </div>
                        <div className="text-[14px] font-bold text-on-surface mt-0.5">
                          {selectedRestaurant.metrics.coldChain}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[19px]">
                        thermostat
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-container-high/70 border border-outline-variant/40 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-label-caps text-outline uppercase">
                          Calidad del Aire
                        </div>
                        <div className="text-[14px] font-bold text-on-surface mt-0.5">
                          {selectedRestaurant.metrics.airQuality}
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-primary text-[19px]">
                        air
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-container-high/70 border border-outline-variant/40 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] font-label-caps text-outline uppercase">
                          Infracciones
                        </div>
                        <div className="text-[14px] font-bold text-teal-700 mt-0.5">
                          {selectedRestaurant.metrics.infractions} Reportadas
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-teal-600 text-[19px]">
                        check_circle
                      </span>
                    </div>
                  </div>
                </div>

                {/* Descripción comunitaria */}
                <p className="text-[12.5px] text-on-surface-variant leading-relaxed p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  {selectedRestaurant.description}
                </p>

                {/* Botón rápido para auditar desde Nivel 3 */}
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="w-full py-3 px-4 rounded-full bg-primary text-on-primary font-label-md text-[13.5px] font-semibold text-center flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    rate_review
                  </span>
                  <span>Calificar o Dejar Reseña</span>
                </button>
              </div>
            </div>
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
