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
  isUVMode?: boolean;
}

export function InteractiveMap({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Inicializar MapLibre con estilo claro y limpio 2D Carto Voyager (estilo Google Maps / inDrive)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [selectedRestaurant.lng, selectedRestaurant.lat],
      zoom: 14.5,
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Actualizar marcadores con icono de cubiertos de restaurante (estilo Google Maps)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Limpiar marcadores antiguos
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    restaurants.forEach((restaurant) => {
      const isSelected = restaurant.id === selectedRestaurant.id;

      // Elemento HTML del marcador
      const el = document.createElement("div");
      el.className =
        "cursor-pointer group flex flex-col items-center justify-center p-1 -m-1 transition-transform select-none";

      if (isSelected) {
        // Marcador activo: Etiqueta nítida sin puntos previos + Pin destacado con cubiertos
        el.innerHTML = `
          <div class="mb-1 px-3 py-1 rounded-full bg-slate-900 text-white shadow-xl flex items-center gap-1.5 whitespace-nowrap border border-slate-700 animate-in fade-in zoom-in-95 duration-200">
            <span class="text-[11px] font-semibold tracking-tight text-white">${restaurant.shortName}</span>
            <span class="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-teal-500 text-slate-950">${restaurant.grade}</span>
          </div>
          <div class="relative flex items-center justify-center">
            <div class="w-10 h-10 rounded-full bg-teal-600/30 flex items-center justify-center animate-ping absolute"></div>
            <div class="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
              <span class="material-symbols-outlined text-[19px]">restaurant</span>
            </div>
            <div class="absolute -bottom-1.5 w-2.5 h-2.5 rotate-45 bg-teal-600 border-r-2 border-b-2 border-white z-0"></div>
          </div>
        `;
      } else {
        // Marcador no seleccionado: Píldora limpia estilo Google Maps / inDrive con cubiertos y puntaje
        el.innerHTML = `
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-200/90 shadow-md hover:scale-105 hover:shadow-lg transition-all duration-150">
            <span class="material-symbols-outlined text-[15px] text-teal-600">restaurant</span>
            <span class="text-[11px] font-bold text-slate-900">${restaurant.grade}</span>
          </div>
          <span class="mt-0.5 text-[9.5px] font-medium text-slate-700 bg-white/95 px-1.5 py-0.5 rounded shadow-sm border border-slate-200/80 whitespace-nowrap max-w-[120px] truncate">
            ${restaurant.shortName}
          </span>
        `;
      }

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRestaurant(restaurant);
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([restaurant.lng, restaurant.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [restaurants, selectedRestaurant, onSelectRestaurant]);

  // Al cambiar restaurante seleccionado desde afuera (ej. filtros o clic en pin), centrar con compensación de sheet inferior
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    map.flyTo({
      center: [selectedRestaurant.lng, selectedRestaurant.lat],
      zoom: 15,
      padding: { bottom: 120, top: 0, left: 0, right: 0 },
      speed: 1.2,
      curve: 1.4,
      essential: true,
    });
  }, [selectedRestaurant.id]);

  return (
    <div className="relative w-full h-full min-h-[360px] flex-1 overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
