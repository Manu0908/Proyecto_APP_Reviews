"use client";

import { useState } from "react";
import Link from "next/link";
import { TopAppBar } from "@/components/navigation/TopAppBar";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { QuickAuditModal } from "@/components/audit/QuickAuditModal";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { Restaurant } from "@/types";

export default function MapPage() {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant>(
    MOCK_RESTAURANTS[0]
  );
  const [activeFilter, setActiveFilter] = useState("all");
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isUVMode, setIsUVMode] = useState(false);

  return (
    <>
      {/* Top App Bar */}
      <TopAppBar
        title="Hygiene Index"
        onFilterClick={() =>
          alert("Filtros: Permite filtrar por Aséptico, Distancia y Tipo de Cocina.")
        }
      />

      {/* Main Canvas: Oceanic Minimalist Vector Map */}
      <main className="relative w-full min-h-[calc(100vh-120px)] flex-1 flex flex-col justify-between overflow-hidden pb-20">
        {/* Vector Stylized Nocturnal Ocean Map Background */}
        <div
          className={`absolute inset-0 z-0 overflow-hidden select-none transition-colors duration-500 ${
            isUVMode ? "bg-[#030b0f]" : "bg-surface-container-lowest"
          }`}
        >
          <svg
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isUVMode ? "opacity-90" : "opacity-60"
            }`}
            fill="none"
            viewBox="0 0 420 800"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <radialGradient cx="50%" cy="30%" id="oceanGlow" r="50%">
                <stop
                  offset="0%"
                  stopColor={isUVMode ? "#1a0b2e" : "#152128"}
                  stopOpacity="0.8"
                />
                <stop
                  offset="100%"
                  stopColor={isUVMode ? "#020508" : "#041016"}
                  stopOpacity="1"
                />
              </radialGradient>
              <linearGradient id="waterFlow" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#09151c" />
                <stop
                  offset="50%"
                  stopColor={isUVMode ? "#1e1435" : "#111d24"}
                />
                <stop offset="100%" stopColor="#08141b" />
              </linearGradient>
            </defs>

            {/* Deep background wash */}
            <rect fill="url(#oceanGlow)" height="800" width="420" />

            {/* River / Waterway Curve */}
            <path
              d="M-40 220 C 120 180, 240 310, 460 260 L 460 380 C 260 410, 140 290, -40 320 Z"
              fill="url(#waterFlow)"
              opacity="0.7"
              stroke={isUVMode ? "#4c1d95" : "#1a2e36"}
              strokeWidth="0.8"
            />

            {/* Micro road matrix / Architectural grid */}
            <g
              stroke={isUVMode ? "#2e1065" : "#1b2931"}
              strokeDasharray="2 3"
              strokeWidth="0.75"
            >
              <line x1="20" x2="20" y1="40" y2="760" />
              <line x1="90" x2="90" y1="40" y2="760" />
              <line x1="160" x2="160" y1="40" y2="760" />
              <line x1="230" x2="230" y1="40" y2="760" />
              <line x1="300" x2="300" y1="40" y2="760" />
              <line x1="370" x2="370" y1="40" y2="760" />
              <line x1="0" x2="420" y1="120" y2="120" />
              <line x1="0" x2="420" y1="200" y2="200" />
              <line x1="0" x2="420" y1="340" y2="340" />
              <line x1="0" x2="420" y1="440" y2="440" />
              <line x1="0" x2="420" y1="520" y2="520" />
            </g>

            {/* Secondary Arterials */}
            <path
              d="M40 70 L 160 140 L 320 120 L 390 190"
              fill="none"
              stroke={isUVMode ? "#581c87" : "#25353d"}
              strokeWidth="1.2"
            />
            <path
              d="M20 380 L 140 370 L 260 460 L 390 490"
              fill="none"
              stroke={isUVMode ? "#581c87" : "#25353d"}
              strokeWidth="1.2"
            />
          </svg>

          {/* Ambient Light Spot */}
          <div
            className={`absolute top-[32%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all ${
              isUVMode ? "bg-purple-600/20" : "bg-primary-container/15"
            }`}
          />
        </div>

        {/* Quick Filter Chips & Modo UV Button */}
        <div className="relative z-10 px-space-md pt-3 w-full">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            {/* Toggle Modo UV */}
            <button
              onClick={() => setIsUVMode(!isUVMode)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border ${
                isUVMode
                  ? "bg-purple-900/60 text-purple-200 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]"
                  : "bg-surface-container-high/80 text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
              }`}
            >
              <span className="material-symbols-outlined text-[15px]" data-icon="flare">
                flare
              </span>
              <span>Modo UV {isUVMode ? "ON" : "OFF"}</span>
            </button>

            {/* Chip Aséptico */}
            <button
              onClick={() => setActiveFilter(activeFilter === "aseptico" ? "all" : "aseptico")}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border ${
                activeFilter === "aseptico"
                  ? "bg-primary-container text-on-primary-container border-primary/40 shadow-sm"
                  : "bg-surface-container-high/80 text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
              <span>Grado 100 Aséptico</span>
            </button>

            {/* Chip Omakase */}
            <button
              onClick={() => setActiveFilter(activeFilter === "omakase" ? "all" : "omakase")}
              className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-label-md font-label-md transition-all active:scale-95 border ${
                activeFilter === "omakase"
                  ? "bg-primary-container text-on-primary-container border-primary/40"
                  : "bg-surface-container-high/80 text-on-surface-variant border-outline-variant/30 hover:border-primary/50"
              }`}
            >
              <span>Omakase & Raw Bar</span>
            </button>

            {/* Chip Proximidad */}
            <button
              onClick={() => alert("Mostrando restaurantes a menos de 2 km.")}
              className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface-container-high/80 backdrop-blur-md text-on-surface-variant text-label-md font-label-md border border-outline-variant/30 hover:border-primary/50 transition-all active:scale-95"
            >
              <span>&lt; 2 km</span>
            </button>
          </div>
        </div>

        {/* Dynamic Map Pins Layer (Simulación interactiva) */}
        <div className="relative z-10 flex-1 w-full min-h-[220px]">
          {/* Pin 1: Aura Culinary Lab */}
          <div
            onClick={() => setSelectedRestaurant(MOCK_RESTAURANTS[1])}
            className="absolute top-[20%] left-[22%] -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div
              className={`w-7 h-7 rounded-full bg-surface-container-low border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                selectedRestaurant.id === "aura-lab"
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-primary/30"
              }`}
            >
              <span className="font-metric-sm text-[10px] text-secondary font-semibold">
                98
              </span>
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-label-caps text-[9px] text-outline tracking-wider opacity-80">
              AURA
            </span>
          </div>

          {/* Pin 2: Mizue Omakase */}
          <div
            onClick={() => setSelectedRestaurant(MOCK_RESTAURANTS[2])}
            className="absolute top-[26%] right-[18%] translate-x-1/2 -translate-y-1/2 cursor-pointer group"
          >
            <div
              className={`w-7 h-7 rounded-full bg-surface-container-low border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                selectedRestaurant.id === "mizue-omakase"
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-primary/30"
              }`}
            >
              <span className="font-metric-sm text-[10px] text-secondary font-semibold">
                99
              </span>
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-label-caps text-[9px] text-outline tracking-wider opacity-80">
              MIZUE
            </span>
          </div>

          {/* Pin 3: Le Jardin Sauvage (Nivel Orgánico) */}
          <div
            onClick={() => setSelectedRestaurant(MOCK_RESTAURANTS[3])}
            className="absolute bottom-[28%] left-[25%] -translate-x-1/2 cursor-pointer group"
          >
            <div
              className={`w-7 h-7 rounded-full bg-surface-container-lowest border flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${
                selectedRestaurant.id === "bistro-organico"
                  ? "border-amber-500/80 ring-2 ring-amber-500/30"
                  : "border-amber-700/40"
              }`}
            >
              <span className="font-metric-sm text-[10px] text-amber-300 font-semibold">
                62
              </span>
            </div>
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-label-caps text-[8.5px] text-amber-400/80 tracking-wider">
              SAUVAGE
            </span>
          </div>

          {/* Pin Central Activo: L'Écume Marine */}
          <div
            onClick={() => setSelectedRestaurant(MOCK_RESTAURANTS[0])}
            className="absolute top-[48%] left-[54%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer"
          >
            <div className="mb-2 px-2.5 py-1 rounded-full bg-surface-container-lowest/95 border border-primary/50 backdrop-blur-md shadow-2xl flex items-center gap-1.5 transform hover:-translate-y-0.5 transition-transform">
              <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#adccd3]" />
              <span className="font-label-caps text-on-surface font-semibold tracking-wider text-[10px]">
                MAYFAIR • GRADE {selectedRestaurant.grade}
              </span>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary-container/20 beacon-pulse flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md font-metric-sm text-[11px] font-bold">
                  <span
                    className="material-symbols-outlined text-[14px]"
                    data-icon="verified"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    verified
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-1 w-1.5 h-1.5 rotate-45 bg-primary" />
            </div>
          </div>
        </div>

        {/* Editorial Frosted Inspection Bottom Sheet */}
        <section className="relative z-20 w-full ocean-glass-card rounded-t-2xl px-space-md pt-3 pb-6 border-t border-outline-variant/30 mt-auto transition-all">
          <div className="w-10 h-1 bg-outline-variant/60 rounded-full mx-auto mb-3 cursor-grab" />

          {/* Header Row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 pr-1">
              <h2 className="font-headline-lg-mobile text-[24px] text-on-surface tracking-tight leading-tight">
                {selectedRestaurant.name}
              </h2>
              <p className="font-body-sm text-[12.5px] text-secondary font-light mt-0.5">
                {selectedRestaurant.tagline}
              </p>
            </div>

            {/* Concentric Pristine Grade Seal */}
            <div className="shrink-0 flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-container/60 border border-primary/40 shadow-[0_0_12px_rgba(123,153,160,0.25)]">
                <span
                  className="material-symbols-outlined text-primary text-[17px]"
                  data-icon="verified_user"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <span className="font-metric-display text-[19px] leading-none text-on-surface font-semibold tracking-tight">
                  {selectedRestaurant.grade}
                </span>
              </div>
              <span className="font-label-caps text-[8.5px] text-tertiary-fixed-dim mt-1 tracking-wider uppercase">
                {selectedRestaurant.auditCycle}
              </span>
            </div>
          </div>

          {/* Metadata bar */}
          <div className="flex items-center gap-2 text-outline font-label-md text-[12px] pb-3 border-b border-outline-variant/20 mb-3">
            <span className="flex items-center gap-1 text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-[14px]" data-icon="restaurant">
                restaurant
              </span>
              {selectedRestaurant.cuisine}
            </span>
            <span className="text-outline-variant">•</span>
            <span>{selectedRestaurant.subCuisine}</span>
            <span className="text-outline-variant">•</span>
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]" data-icon="location_on">
                location_on
              </span>
              {selectedRestaurant.location.split(",")[0]}
            </span>
          </div>

          {/* Bento Metrics Row */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[9px] text-outline uppercase tracking-wider">
                  Surface Purity
                </div>
                <div className="font-metric-sm text-[15px] text-on-surface font-medium mt-0.5">
                  {selectedRestaurant.metrics.surfacePurity} / 100
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/80" data-icon="sanitizer">
                sanitizer
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[9px] text-outline uppercase tracking-wider">
                  Cold Chain
                </div>
                <div className="font-metric-sm text-[15px] text-on-surface font-medium mt-0.5">
                  {selectedRestaurant.metrics.coldChain}
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/80" data-icon="thermostat">
                thermostat
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[9px] text-outline uppercase tracking-wider">
                  Air Quality
                </div>
                <div className="font-metric-sm text-[15px] text-on-surface font-medium mt-0.5">
                  {selectedRestaurant.metrics.airQuality}
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/80" data-icon="air">
                air
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between">
              <div>
                <div className="font-label-caps text-[9px] text-outline uppercase tracking-wider">
                  Infractions
                </div>
                <div className="font-metric-sm text-[15px] text-primary font-medium mt-0.5">
                  {selectedRestaurant.metrics.infractions} Violations
                </div>
              </div>
              <span
                className="material-symbols-outlined text-primary"
                data-icon="check_circle"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>
          </div>

          {/* Dual Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href={`/restaurant/${selectedRestaurant.id}`}
              className="flex-1 py-3 px-4 rounded-full bg-primary-container text-on-primary-container font-label-md text-[13px] font-semibold text-center flex items-center justify-center gap-2 hover:shadow-[0_0_16px_rgba(166,192,198,0.4)] transition-all active:scale-95 duration-150"
            >
              <span className="material-symbols-outlined text-[17px]" data-icon="assignment_turned_in">
                assignment_turned_in
              </span>
              <span>Dossier Sanitario Completo</span>
            </Link>

            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="py-3 px-4 rounded-full bg-surface-container/60 border border-outline-variant/40 text-on-surface font-label-md text-[13px] font-medium hover:border-primary transition-all active:scale-95 duration-150 flex items-center justify-center gap-1.5"
            >
              <span>Auditar</span>
              <span className="material-symbols-outlined text-[15px]" data-icon="add">
                add
              </span>
            </button>
          </div>
        </section>
      </main>

      {/* Bottom Nav Bar */}
      <BottomNavBar onOpenAudit={() => setIsAuditModalOpen(true)} />

      {/* Quick Audit Modal */}
      <QuickAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        restaurantName={selectedRestaurant.name}
        restaurantLocation={selectedRestaurant.location}
      />
    </>
  );
}
