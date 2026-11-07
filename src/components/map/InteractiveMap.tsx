"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import { Restaurant } from "@/types";
import { COLOMBIA_BOUNDS } from "@/lib/validations/schemas";

// Configurar la URL estática del worker de MapLibre en public para Webpack/Next.js
if (typeof window !== "undefined") {
  maplibregl.setWorkerUrl("/maplibre-gl-worker.js");
}

/** Bounding Box geográfico de Colombia para restringir el paneo innecesario */
const COLOMBIA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [COLOMBIA_BOUNDS.minLng - 2.0, COLOMBIA_BOUNDS.minLat - 2.0],
  [COLOMBIA_BOUNDS.maxLng + 2.0, COLOMBIA_BOUNDS.maxLat + 2.0],
];

const CLUSTER_SOURCE_ID = "restaurants-supercluster";

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

function buildGeoJSON(restaurants: Restaurant[]) {
  return {
    type: "FeatureCollection" as const,
    features: restaurants.map((r) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [r.lng, r.lat] as [number, number],
      },
      properties: {
        id: r.id,
        name: r.name,
        shortName: r.shortName,
        grade: r.grade,
        level: r.level,
      },
    })),
  };
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
  const restaurantsRef = useRef<Restaurant[]>(restaurants);

  // Callbacks en refs: los listeners del mapa y de los marcadores siempre llaman
  // a la versión más reciente sin tener que recrearse en cada render del padre.
  const onSelectRef = useRef(onSelectRestaurant);
  const onMapClickRef = useRef(onMapClick);
  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onSelectRef.current = onSelectRestaurant;
    onMapClickRef.current = onMapClick;
    onLoadRef.current = onLoad;
    restaurantsRef.current = restaurants;
  });

  const selectedId = selectedRestaurant?.id ?? null;
  const selectedLng = selectedRestaurant?.lng ?? null;
  const selectedLat = selectedRestaurant?.lat ?? null;

  // Centro inicial capturado una sola vez (priorizando la ciudad de referencia Santa Marta):
  // cambios posteriores de la lista no reinician el mapa.
  const initialCenterRef = useRef<Restaurant | null>(
    restaurants.find((r) => r.city.toLowerCase().includes("santa marta")) ??
      restaurants[0] ??
      null
  );

  // Inicialización única del mapa
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initialCenter = initialCenterRef.current;
    const styleUrl =
      process.env.NEXT_PUBLIC_CARTO_STYLE_URL ||
      "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

    // Estilo oscuro Carto Dark Matter, bloqueado en 2D, con límites en Colombia
    // y atribución legal ODbL compacta activada.
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: initialCenter
        ? [initialCenter.lng, initialCenter.lat]
        : [-74.2238, 11.1929],
      zoom: initialCenter ? 13 : 5,
      maxBounds: COLOMBIA_MAX_BOUNDS,
      pitch: 0,
      maxPitch: 0,
      bearing: 0,
      dragRotate: false,
      touchPitch: false,
      attributionControl: false,
    });

    map.touchZoomRotate.disableRotation();

    // Atribución legal obligatoria ODbL (OpenStreetMap & CARTO) en formato compacto
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    map.on("load", () => {
      // Fuente GeoJSON con Supercluster en Web Worker para agrupación espacial a gran escala
      if (!map.getSource(CLUSTER_SOURCE_ID)) {
        map.addSource(CLUSTER_SOURCE_ID, {
          type: "geojson",
          data: buildGeoJSON(restaurantsRef.current),
          cluster: true,
          clusterMaxZoom: 9,
          clusterRadius: 45,
        });

        map.addLayer({
          id: "clusters-halo",
          type: "circle",
          source: CLUSTER_SOURCE_ID,
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "rgba(173, 204, 211, 0.22)",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              5,
              26,
              15,
              32,
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(173, 204, 211, 0.5)",
          },
        });
      }

      onLoadRef.current?.();
    });

    map.on("error", () => {
      // Evita que el MapSkeleton bloquee indefinidamente los pines si falla una tesela remota
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

  // Sincronizar fuente Supercluster y marcadores con icono de cubiertos
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    const clusterSource = map.getSource(
      CLUSTER_SOURCE_ID
    ) as maplibregl.GeoJSONSource | undefined;
    if (clusterSource) {
      clusterSource.setData(buildGeoJSON(restaurants));
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    restaurants.forEach((restaurant) => {
      const isSelected = restaurant.id === selectedId;
      const name = escapeHtml(restaurant.shortName);
      const grade = escapeHtml(String(restaurant.grade));

      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute(
        "aria-label",
        `${restaurant.shortName}, puntuación ${restaurant.grade}`
      );
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

  // Si una búsqueda o filtro deja resultados activos pero ninguno es visible en el
  // área actual del mapa (ej. buscar "Bogotá", "Medellín" o "Taganga"), desplazar la
  // cámara al primer resultado para evitar mostrar un mapa vacío.
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || restaurants.length === 0) return;

    const bounds = map.getBounds();
    const hasVisiblePin = restaurants.some((r) =>
      bounds.contains([r.lng, r.lat])
    );

    if (!hasVisiblePin) {
      const target = restaurants[0];
      map.easeTo({
        center: [target.lng, target.lat],
        zoom: 13.5,
        duration: 650,
        essential: true,
      });
    }
  }, [restaurants]);

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
