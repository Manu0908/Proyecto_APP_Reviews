"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { FilterModal } from "@/components/common/FilterModal";
import {
  RestaurantSheet,
  OpenSheetLevel,
  SHEET_FULL_HEIGHT,
  SHEET_PEEK_HEIGHT,
} from "@/components/map/RestaurantSheet";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { Restaurant } from "@/types";

/** Skeleton con barrido de luz mientras el mapa carga (evita ver estados intermedios). */
function MapSkeleton() {
  return (
    <div
      className="absolute inset-0 z-10 bg-surface-container-lowest overflow-hidden pointer-events-none"
      aria-label="Cargando mapa"
      role="status"
    >
      <div className="absolute inset-0 grid grid-cols-3 gap-px opacity-40">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-surface-container-low" />
        ))}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-surface-container-high border border-outline-variant/50" />
          <div className="h-2.5 w-20 rounded bg-surface-container-high" />
        </div>
      </div>
      <div className="absolute inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-shimmer" />
    </div>
  );
}

const InteractiveMap = dynamic(
  () =>
    import("@/components/map/InteractiveMap").then((mod) => mod.InteractiveMap),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export default function MapPage() {
  // null = ningún restaurante abierto → bandeja oculta
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [sheetLevel, setSheetLevel] = useState<OpenSheetLevel>("peek");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [maxDistance, setMaxDistance] = useState(10);
  const [onlyVerifiedReceipt, setOnlyVerifiedReceipt] = useState(false);
  const [zeroInfractionsOnly, setZeroInfractionsOnly] = useState(false);

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Filtrado por búsqueda y filtros; memoizado para no recrear los marcadores en cada render
  const displayedRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_RESTAURANTS.filter((r) => {
      if (q) {
        const haystack = [r.name, r.shortName, r.cuisine, r.city, r.location]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeFilter !== "all" && r.level !== activeFilter) return false;
      if (zeroInfractionsOnly && r.metrics.infractions > 0) return false;
      return true;
    });
  }, [searchQuery, activeFilter, zeroInfractionsOnly]);

  // Si la búsqueda/filtros ocultan el restaurante abierto, se cierra la bandeja
  useEffect(() => {
    if (
      selectedRestaurant &&
      !displayedRestaurants.some((r) => r.id === selectedRestaurant.id)
    ) {
      setSelectedRestaurant(null);
    }
  }, [displayedRestaurants, selectedRestaurant]);

  const handleSelectRestaurant = useCallback((restaurant: Restaurant) => {
    // Si la bandeja estaba cerrada, abre en nivel 1; si estaba abierta, conserva el nivel actual
    setSelectedRestaurant((prev) => {
      if (prev === null) setSheetLevel("peek");
      return restaurant;
    });
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedRestaurant(null);
  }, []);

  const handleMapLoad = useCallback(() => {
    setIsMapLoaded(true);
  }, []);

  const handleResetFilters = () => {
    setActiveFilter("all");
    setMaxDistance(10);
    setOnlyVerifiedReceipt(false);
    setZeroInfractionsOnly(false);
  };

  const sheetVisibleHeight =
    selectedRestaurant === null
      ? 0
      : sheetLevel === "full"
      ? SHEET_FULL_HEIGHT
      : SHEET_PEEK_HEIGHT;

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Barra de búsqueda superior de ancho completo */}
      <TopAppBar
        isSearchMode={true}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Buscar restaurantes, cafés, zonas..."
        onFilterClick={() => setIsFilterModalOpen(true)}
      />

      {/* Área del mapa: ocupa exactamente el espacio entre la barra superior y la navegación inferior */}
      <main className="relative flex-1 min-h-0 mb-[var(--bottom-nav-h)] overflow-hidden">
        <InteractiveMap
          restaurants={displayedRestaurants}
          selectedRestaurant={selectedRestaurant}
          onSelectRestaurant={handleSelectRestaurant}
          onMapClick={handleCloseSheet}
          onLoad={handleMapLoad}
          bottomPadding={sheetVisibleHeight}
        />

        {!isMapLoaded && <MapSkeleton />}

        {displayedRestaurants.length === 0 && (
          <div className="absolute top-3 inset-x-0 z-20 flex justify-center pointer-events-none animate-fade-in">
            <span className="px-3 py-1.5 rounded-full bg-surface-container-high/95 border border-outline-variant/50 text-[12px] text-on-surface-variant shadow-lg">
              Sin resultados para tu búsqueda
            </span>
          </div>
        )}

        <RestaurantSheet
          restaurant={selectedRestaurant}
          level={sheetLevel}
          onLevelChange={setSheetLevel}
          onClose={handleCloseSheet}
          onRate={() => setIsAuditModalOpen(true)}
        />
      </main>

      <BottomNavBar />

      <QuickAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        restaurantName={selectedRestaurant?.name}
        restaurantLocation={selectedRestaurant?.location}
      />

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
    </div>
  );
}
