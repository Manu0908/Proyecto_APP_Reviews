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
  /** Restaurante abierto en la bandeja; null si la bandeja está oculta. */
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  /** Clic en una zona vacía del mapa (no en un pin). */
  onMapClick?: () => void;
  /** Se dispara cuando el estilo y las teselas iniciales terminaron de cargar. */
  onLoad?: () => void;
  /** Altura visible de la bandeja inferior, para que el pin no quede tapado. */
  bottomPadding?: number;
}

/** Escapa texto antes de interpolarlo en innerHTML (prevención de XSS). */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function InteractiveMap({
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
  onMapClick,
  onLoad,
  bottomPadding = 0,
}: InteractiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Callbacks en refs: los listeners del mapa y de los marcadores siempre llaman
  // a la versión más reciente sin tener que recrearse en cada render del padre.
  const onSelectRef = useRef(onSelectRestaurant);
  const onMapClickRef = useRef(onMapClick);
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onSelectRef.current = onSelectRestaurant;
    onMapClickRef.current = onMapClick;
    onLoadRef.current = onLoad;
  });

  const selectedId = selectedRestaurant?.id ?? null;
  const selectedLng = selectedRestaurant?.lng ?? null;
  const selectedLat = selectedRestaurant?.lat ?? null;

  // Centro inicial capturado una sola vez: cambios posteriores de la lista no reinician el mapa
  const initialCenterRef = useRef<Restaurant | null>(restaurants[0] ?? null);

  // Inicialización única del mapa
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initialCenter = initialCenterRef.current;

    // Estilo oscuro Carto Dark Matter, bloqueado en 2D (sin inclinación ni rotación)
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: initialCenter
        ? [initialCenter.lng, initialCenter.lat]
        : [-74.2, 4.6],
      zoom: initialCenter ? 13 : 5,
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.touchZoomRotate.disableRotation();

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      onLoadRef.current?.();
    });

    map.on("click", (e) => {
      // Defensa adicional: ignorar clics originados dentro de un marcador
      const target = e.originalEvent.target;
      if (target instanceof Element && target.closest(".maplibregl-marker")) {
        return;
      }
      onMapClickRef.current?.();
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Marcadores: se recrean solo cuando cambia la lista o el restaurante seleccionado
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    restaurants.forEach((restaurant) => {
      const isSelected = restaurant.id === selectedId;
      const name = escapeHtml(restaurant.shortName);
      const grade = escapeHtml(String(restaurant.grade));

      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", `${restaurant.shortName}, puntuación ${restaurant.grade}`);
      el.className =
        "cursor-pointer flex flex-col items-center justify-end min-w-[48px] min-h-[48px] bg-transparent border-0 p-0 select-none";

      if (isSelected) {
        el.innerHTML = `
          <span class="mb-1 px-2.5 py-1 rounded-full bg-[#041016]/95 border border-[#adccd3]/50 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
            <span class="text-[11px] font-semibold text-[#d8e4ee]">${name}</span>
            <span class="text-[10px] font-bold text-[#adccd3]">${grade}</span>
          </span>
          <span class="relative flex items-center justify-center">
            <span class="w-10 h-10 rounded-full beacon-pulse flex items-center justify-center">
              <span class="w-8 h-8 rounded-full bg-[#adccd3] text-[#16353b] flex items-center justify-center shadow-lg border border-white/20">
                <span class="material-symbols-outlined text-[18px]">restaurant</span>
              </span>
            </span>
          </span>
        `;
      } else {
        el.innerHTML = `
          <span class="flex items-center gap-1 px-2 py-1 rounded-full bg-[#152128]/95 border border-[#414849] shadow-lg transition-transform hover:scale-105">
            <span class="material-symbols-outlined text-[15px] text-[#adccd3]">restaurant</span>
            <span class="text-[11px] font-bold text-[#d8e4ee]">${grade}</span>
          </span>
          <span class="mt-0.5 text-[9.5px] font-medium text-[#c1c8c9] bg-[#041016]/85 px-1.5 py-0.5 rounded whitespace-nowrap max-w-[120px] truncate">${name}</span>
        `;
      }

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(restaurant);
      });

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([restaurant.lng, restaurant.lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [restaurants, selectedId]);

  // Centrar en el restaurante seleccionado, dejando libre el espacio de la bandeja
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || selectedLng === null || selectedLat === null) return;
    map.easeTo({
      center: [selectedLng, selectedLat],
      zoom: Math.max(map.getZoom(), 14.5),
      padding: { bottom: bottomPadding, top: 0, left: 0, right: 0 },
      duration: 600,
      essential: true,
    });
  }, [selectedId, selectedLng, selectedLat, bottomPadding]);

  return (
    <div className="absolute inset-0">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
