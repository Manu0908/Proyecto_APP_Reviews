"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { Restaurant } from "@/types";

// Configurar la URL estática del worker de MapLibre en public para Webpack/Next.js
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre-gl-worker.js");
}

interface InteractiveMapProps {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  isUVMode: boolean;
}

export function InteractiveMap({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  isUVMode,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Inicializar MapLibre con estilo libre oscuro Carto Dark Matter
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [selectedRestaurant.lng, selectedRestaurant.lat],
      zoom: 14.5,
      pitch: 35,
      bearing: -10,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true }),
      "top-right"
    );

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Actualizar marcadores cuando cambian los restaurantes o el seleccionado
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Limpiar marcadores antiguos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    restaurants.forEach((restaurant) => {
      const isSelected = restaurant.id === selectedRestaurant.id;

      // Crear elemento HTML personalizado para el pin
      const el = document.createElement("div");
      el.className = "cursor-pointer group flex flex-col items-center";

      const badgeColor =
        restaurant.level === "organico"
          ? "border-amber-600/80 bg-[#1a1208] text-amber-300"
          : restaurant.level === "filtrado"
          ? "border-orange-500/80 bg-[#1f140a] text-orange-300"
          : restaurant.level === "antiseptico"
          ? "border-teal-500/80 bg-[#071f1e] text-teal-300"
          : restaurant.level === "esterilizado"
          ? "border-purple-400/80 bg-[#160d26] text-purple-300"
          : "border-primary bg-secondary-container text-primary";

      if (isSelected) {
        el.innerHTML = `
          <div class="mb-1.5 px-2 py-0.5 rounded-full bg-[#041016]/95 border border-primary/50 shadow-2xl flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_#adccd3]"></span>
            <span class="text-[9.5px] font-semibold tracking-wider text-[#d8e4ee] uppercase">${restaurant.name.split(" ")[0]} • ${restaurant.grade}</span>
          </div>
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-[#7b99a0]/25 beacon-pulse flex items-center justify-center">
              <div class="w-7 h-7 rounded-full bg-[#adccd3] text-[#16353b] flex items-center justify-center font-bold text-[11px] shadow-lg border border-white/20">
                ★
              </div>
            </div>
            <div class="absolute -bottom-1 w-1.5 h-1.5 rotate-45 bg-[#adccd3]"></div>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="w-7 h-7 rounded-full border ${badgeColor} flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <span class="text-[10px] font-semibold">${Math.round(restaurant.grade)}</span>
          </div>
          <span class="mt-0.5 text-[8.5px] font-medium text-[#8b9293] bg-[#041016]/80 px-1 rounded uppercase tracking-wider">${restaurant.name.split(" ")[0]}</span>
        `;
      }

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRestaurant(restaurant);
        map.flyTo({
          center: [restaurant.lng, restaurant.lat],
          zoom: 15,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([restaurant.lng, restaurant.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [restaurants, selectedRestaurant, onSelectRestaurant]);

  // Al cambiar restaurante seleccionado desde afuera (ej. filtros), centrar
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.flyTo({
      center: [selectedRestaurant.lng, selectedRestaurant.lat],
      zoom: 15,
      essential: true,
    });
  }, [selectedRestaurant.id]);

  return (
    <div className="relative w-full h-full min-h-[360px] flex-1 overflow-hidden">
      <div
        ref={mapContainer}
        className={`w-full h-full transition-all duration-700 ${
          isUVMode
            ? "filter hue-rotate-[240deg] contrast-[140%] brightness-[85%]"
            : ""
        }`}
      />
    </div>
  );
}
