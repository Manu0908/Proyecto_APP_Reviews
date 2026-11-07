"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { FilterModal } from "@/components/common/FilterModal";
import { InstallAppModal } from "@/components/common/InstallAppModal";
import {
  RestaurantSheet,
  OpenSheetLevel,
  SHEET_FULL_HEIGHT,
  SHEET_PEEK_HEIGHT,
} from "@/components/map/RestaurantSheet";
import { useOneTimeHint } from "@/hooks/useOneTimeHint";
import { Restaurant } from "@/types";
import {
  calculateHaversineDistanceKm,
  DEFAULT_REFERENCE_COORDS,
} from "@/lib/geo";

/** Evento tipado estricto para instalación nativa PWA (prohibido el uso de `any`). */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

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

export interface MapViewClientProps {
  restaurants: Restaurant[];
  initialSearchQuery?: string;
  initialLevel?: string;
  initialMaxDistance?: number;
  initialVerifiedOnly?: boolean;
  initialZeroInfractions?: boolean;
}

export function MapViewClient({
  restaurants,
  initialSearchQuery = "",
  initialLevel = "all",
  initialMaxDistance = 10,
  initialVerifiedOnly = false,
  initialZeroInfractions = false,
}: MapViewClientProps) {
  // null = ningún restaurante abierto → bandeja oculta
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [sheetLevel, setSheetLevel] = useState<OpenSheetLevel>("peek");
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeFilter, setActiveFilter] = useState(initialLevel);
  const [maxDistance, setMaxDistance] = useState(initialMaxDistance);
  const [onlyVerifiedReceipt, setOnlyVerifiedReceipt] =
    useState(initialVerifiedOnly);
  const [zeroInfractionsOnly, setZeroInfractionsOnly] = useState(
    initialZeroInfractions
  );

  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [canInstallNatively, setCanInstallNatively] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Escuchar evento PWA beforeinstallprompt para instalación directa
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setCanInstallNatively(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  // Sincroniza el estado de filtros y búsqueda con la URL (searchParams)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (activeFilter !== "all") params.set("level", activeFilter);
    if (maxDistance !== 10) params.set("dist", String(maxDistance));
    if (onlyVerifiedReceipt) params.set("verified", "1");
    if (zeroInfractionsOnly) params.set("zero", "1");

    const queryString = params.toString();
    const nextUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [
    searchQuery,
    activeFilter,
    maxDistance,
    onlyVerifiedReceipt,
    zeroInfractionsOnly,
  ]);

  const handleInstallClick = useCallback(() => {
    if (deferredPromptRef.current) {
      void deferredPromptRef.current.prompt();
      void deferredPromptRef.current.userChoice.then(() => {
        deferredPromptRef.current = null;
        setCanInstallNatively(false);
      });
    } else {
      setIsInstallModalOpen(true);
    }
  }, []);

  // Minitutorial inicial: indica al usuario que toque un restaurante en el mapa
  const [selectHintPending, dismissSelectHint] = useOneTimeHint(
    "hint:select-restaurant:v1"
  );

  // Filtrado por búsqueda y filtros; memoizado para no recrear los marcadores en cada render
  const displayedRestaurants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (q) {
        const haystack = [r.name, r.shortName, r.cuisine, r.city, r.location]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (activeFilter !== "all" && r.level !== activeFilter) return false;
      if (zeroInfractionsOnly && r.metrics.infractions > 0) return false;
      if (onlyVerifiedReceipt) {
        const hasVerifiedReview = r.reviews?.some(
          (rev) => rev.hasVerifiedReceipt
        );
        const hasOfficialCert = !r.accreditation
          .toLowerCase()
          .includes("comunitaria");
        if (!hasVerifiedReview && !hasOfficialCert) return false;
      }
      if (maxDistance < 10) {
        const distKm = calculateHaversineDistanceKm(DEFAULT_REFERENCE_COORDS, {
          lat: r.lat,
          lng: r.lng,
        });
        if (distKm > maxDistance) return false;
      }
      return true;
    });
  }, [
    restaurants,
    searchQuery,
    activeFilter,
    zeroInfractionsOnly,
    onlyVerifiedReceipt,
    maxDistance,
  ]);

  // Si la búsqueda/filtros ocultan el restaurante abierto, o si sus datos se actualizaron, sincronizar
  useEffect(() => {
    if (!selectedRestaurant) return;
    const updatedMatch = displayedRestaurants.find(
      (r) => r.id === selectedRestaurant.id
    );
    if (!updatedMatch) {
      setSelectedRestaurant(null);
    } else if (updatedMatch !== selectedRestaurant) {
      setSelectedRestaurant(updatedMatch);
    }
  }, [displayedRestaurants, selectedRestaurant]);

  const handleSelectRestaurant = useCallback(
    (restaurant: Restaurant) => {
      dismissSelectHint();
      // Si la bandeja estaba cerrada, abre en nivel 1; si estaba abierta, conserva el nivel actual
      setSelectedRestaurant((prev) => {
        if (prev === null) setSheetLevel("peek");
        return restaurant;
      });
    },
    [dismissSelectHint]
  );

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
    setSearchQuery("");
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
        onInstallClick={handleInstallClick}
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

        {/* Minitutorial inicial al entrar a la app cuando no hay restaurante seleccionado */}
        {selectHintPending && selectedRestaurant === null && isMapLoaded && (
          <div className="absolute top-3 inset-x-0 z-20 flex justify-center pointer-events-none animate-fade-in">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-container-high/95 border border-primary/40 text-on-surface text-[12px] font-medium shadow-xl backdrop-blur-md">
              <span className="material-symbols-outlined text-[16px] text-primary">
                touch_app
              </span>
              <span>Toca cualquier restaurante en el mapa para explorar</span>
            </div>
          </div>
        )}

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
        restaurantId={selectedRestaurant?.id}
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

      {/* Modal de descarga / instalación PWA */}
      <InstallAppModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        canInstallNatively={canInstallNatively}
        onNativeInstall={() => {
          if (deferredPromptRef.current) {
            void deferredPromptRef.current.prompt();
          }
        }}
      />
    </div>
  );
}
