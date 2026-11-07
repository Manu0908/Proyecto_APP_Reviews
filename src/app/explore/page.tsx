"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { FilterModal } from "@/components/common/FilterModal";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { Restaurant, BiosecurityLevel } from "@/types";

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [maxDistance, setMaxDistance] = useState(10);
  const [onlyVerifiedReceipt, setOnlyVerifiedReceipt] = useState(false);
  const [zeroInfractionsOnly, setZeroInfractionsOnly] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [auditTarget, setAuditTarget] = useState<Restaurant | null>(null);

  // Filtrado reactivo en español
  const filteredRestaurants = MOCK_RESTAURANTS.filter((r) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      r.shortName.toLowerCase().includes(q) ||
      r.cuisine.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedFilter !== "all" && r.level !== selectedFilter) return false;
    if (zeroInfractionsOnly && r.metrics.infractions > 0) return false;
    return true;
  });

  const handleReset = () => {
    setSelectedFilter("all");
    setMaxDistance(10);
    setOnlyVerifiedReceipt(false);
    setZeroInfractionsOnly(false);
    setSearchQuery("");
  };

  const levelBadges: Record<BiosecurityLevel, { label: string; style: string }> = {
    alerta: {
      label: "Nivel 1: Alerta Sanitaria",
      style: "bg-red-950/60 text-rose-300 border-rose-600/40",
    },
    filtrado: {
      label: "Nivel 2: Filtrado",
      style: "bg-orange-950/60 text-orange-300 border-orange-500/40",
    },
    antiseptico: {
      label: "Nivel 3: Antiséptico",
      style: "bg-teal-950/60 text-teal-300 border-teal-500/40",
    },
    esterilizado: {
      label: "Nivel 4: Esterilizado",
      style: "bg-purple-950/60 text-purple-300 border-purple-400/40",
    },
    aseptico: {
      label: "Nivel 5: Aséptico",
      style: "bg-secondary-container/60 text-primary border-primary/40",
    },
  };

  return (
    <>
      <TopAppBar
        title="Directorio Sanitario"
        subtitle="Exploración Bio-Auditada"
        onFilterClick={() => setIsFilterModalOpen(true)}
      />

      <main className="flex-1 flex flex-col px-space-md pt-3 pb-24 gap-4">
        {/* Barra de Búsqueda */}
        <div className="relative flex items-center">
          <span
            className="material-symbols-outlined text-outline absolute left-3.5 text-[20px]"
            data-icon="search"
          >
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, especialidad o zona..."
            className="w-full bg-surface-container-low/90 border border-outline-variant/40 rounded-full pl-11 pr-4 py-2.5 text-body-sm text-[13px] text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]" data-icon="close">
                close
              </span>
            </button>
          )}
        </div>

        {/* Carrusel de Filtros de Bioseguridad */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`shrink-0 px-3 py-1 rounded-full text-label-md text-[12px] font-medium border transition-all ${
              selectedFilter === "all"
                ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30"
            }`}
          >
            Todos ({MOCK_RESTAURANTS.length})
          </button>
          <button
            onClick={() => setSelectedFilter("aseptico")}
            className={`shrink-0 px-3 py-1 rounded-full text-label-md text-[12px] font-medium border transition-all ${
              selectedFilter === "aseptico"
                ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30"
            }`}
          >
            Aséptico
          </button>
          <button
            onClick={() => setSelectedFilter("esterilizado")}
            className={`shrink-0 px-3 py-1 rounded-full text-label-md text-[12px] font-medium border transition-all ${
              selectedFilter === "esterilizado"
                ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30"
            }`}
          >
            Esterilizado
          </button>
          <button
            onClick={() => setSelectedFilter("antiseptico")}
            className={`shrink-0 px-3 py-1 rounded-full text-label-md text-[12px] font-medium border transition-all ${
              selectedFilter === "antiseptico"
                ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30"
            }`}
          >
            Antiséptico
          </button>
          <button
            onClick={() => setSelectedFilter("filtrado")}
            className={`shrink-0 px-3 py-1 rounded-full text-label-md text-[12px] font-medium border transition-all ${
              selectedFilter === "filtrado"
                ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30"
            }`}
          >
            Filtrado
          </button>
          <button
            onClick={() => setSelectedFilter("alerta")}
            className={`shrink-0 px-3 py-1 rounded-full text-label-md text-[12px] font-medium border transition-all ${
              selectedFilter === "alerta"
                ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                : "bg-surface-container-high/70 text-on-surface-variant border-outline-variant/30"
            }`}
          >
            Alerta Sanitaria
          </button>
        </div>

        {/* Contador de Resultados */}
        <div className="flex items-center justify-between text-outline text-[10.5px] font-label-caps tracking-wider px-1">
          <span>{filteredRestaurants.length} RESTAURANTES EVALUADOS</span>
          <span>ORDENADO POR HIGIENE</span>
        </div>

        {/* Lista de Tarjetas */}
        <div className="flex flex-col gap-3">
          {filteredRestaurants.map((restaurant) => {
            const badge = levelBadges[restaurant.level];

            return (
              <div
                key={restaurant.id}
                className="glass-card rounded-2xl p-3.5 border border-outline-variant/30 flex flex-col gap-2.5 transition-all hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-outline-variant/30">
                      <Image
                        src={restaurant.heroImage}
                        alt={restaurant.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div>
                      <h2 className="font-headline-sm text-[16.5px] text-on-surface leading-tight">
                        {restaurant.name}
                      </h2>
                      <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">
                        {restaurant.cuisine} • {restaurant.location}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span
                          className={`font-label-caps text-[9px] px-2 py-0.5 rounded-full border ${badge.style}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chip Concéntrico de Puntuación */}
                  <div className="shrink-0 flex flex-col items-end">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/60 border border-primary/40 shadow-sm">
                      <span
                        className="material-symbols-outlined text-primary text-[15px]"
                        data-icon="verified_user"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified_user
                      </span>
                      <span className="font-metric-display text-[16px] text-on-surface font-semibold leading-none">
                        {restaurant.grade}
                      </span>
                    </div>
                    <span className="font-label-caps text-[8px] text-outline mt-1 tracking-wider">
                      SCORE / 100
                    </span>
                  </div>
                </div>

                {/* Métricas Resumidas */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline-variant/20 text-center">
                  <div className="bg-surface-container-low/60 p-1.5 rounded-lg">
                    <span className="font-label-caps text-[8.5px] text-outline block">
                      SUP. LIMPIA
                    </span>
                    <span className="font-metric-sm text-[12px] text-on-surface font-medium">
                      {restaurant.metrics.surfacePurity}%
                    </span>
                  </div>
                  <div className="bg-surface-container-low/60 p-1.5 rounded-lg">
                    <span className="font-label-caps text-[8.5px] text-outline block">
                      CADENA FRÍO
                    </span>
                    <span className="font-metric-sm text-[12px] text-on-surface font-medium truncate">
                      {restaurant.metrics.coldChain.split(" ")[0]}
                    </span>
                  </div>
                  <div className="bg-surface-container-low/60 p-1.5 rounded-lg">
                    <span className="font-label-caps text-[8.5px] text-outline block">
                      INFRACCIONES
                    </span>
                    <span className="font-metric-sm text-[12px] text-primary font-medium">
                      {restaurant.metrics.infractions}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/restaurant/${restaurant.id}`}
                    className="flex-1 py-2 px-3 rounded-full bg-surface-container-high/80 border border-outline-variant/40 hover:border-primary/50 text-on-surface text-[12px] font-label-md text-center transition-colors active:scale-95"
                  >
                    Ver Ficha
                  </Link>
                  <button
                    onClick={() => setAuditTarget(restaurant)}
                    className="py-2 px-3 rounded-full bg-primary-container text-on-primary-container text-[12px] font-label-md font-semibold flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]" data-icon="add">
                      add
                    </span>
                    <span>Auditar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BottomNavBar
        onOpenAudit={() => setAuditTarget(MOCK_RESTAURANTS[0])}
      />

      <QuickAuditModal
        isOpen={!!auditTarget}
        onClose={() => setAuditTarget(null)}
        restaurantName={auditTarget?.name}
        restaurantLocation={auditTarget?.location}
      />

      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        selectedLevel={selectedFilter}
        onSelectLevel={setSelectedFilter}
        maxDistance={maxDistance}
        onSelectDistance={setMaxDistance}
        onlyVerifiedReceipt={onlyVerifiedReceipt}
        onToggleVerifiedReceipt={setOnlyVerifiedReceipt}
        zeroInfractionsOnly={zeroInfractionsOnly}
        onToggleZeroInfractions={setZeroInfractionsOnly}
        onReset={handleReset}
      />
    </>
  );
}
