/**
 * Utilidades geoespaciales puras para parseo de geometrías PostGIS (EWKB Hex, WKT/EWKT y GeoJSON),
 * formateo de coordenadas y cálculo de distancia geodésica Haversine.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Coordenadas de referencia por defecto (Santa Marta / Gaira) */
export const DEFAULT_REFERENCE_COORDS: GeoPoint = {
  lat: 11.1929,
  lng: -74.2238,
};

/**
 * Extrae `{ lat, lng }` desde cualquier representación devuelta por PostGIS / Supabase:
 * 1. Objeto GeoJSON: `{ type: "Point", coordinates: [lng, lat] }`
 * 2. Cadena WKT / EWKT: `"SRID=4326;POINT(-74.2238 11.1929)"` o `"POINT(-74.2238 11.1929)"`
 * 3. Cadena hexadecimal EWKB/WKB de PostGIS (con o sin bandera SRID 0x20000000)
 */
export function parsePostGISPoint(
  geom: unknown,
  fallback: GeoPoint = DEFAULT_REFERENCE_COORDS
): GeoPoint {
  if (!geom) {
    return fallback;
  }

  // 1. Objeto GeoJSON
  if (typeof geom === "object" && geom !== null) {
    const maybeGeo = geom as {
      type?: unknown;
      coordinates?: unknown;
      lat?: unknown;
      lng?: unknown;
    };

    if (
      Array.isArray(maybeGeo.coordinates) &&
      maybeGeo.coordinates.length >= 2 &&
      typeof maybeGeo.coordinates[0] === "number" &&
      typeof maybeGeo.coordinates[1] === "number" &&
      Number.isFinite(maybeGeo.coordinates[0]) &&
      Number.isFinite(maybeGeo.coordinates[1])
    ) {
      return {
        lng: Number(maybeGeo.coordinates[0].toFixed(6)),
        lat: Number(maybeGeo.coordinates[1].toFixed(6)),
      };
    }

    if (
      typeof maybeGeo.lat === "number" &&
      typeof maybeGeo.lng === "number" &&
      Number.isFinite(maybeGeo.lat) &&
      Number.isFinite(maybeGeo.lng)
    ) {
      return {
        lat: Number(maybeGeo.lat.toFixed(6)),
        lng: Number(maybeGeo.lng.toFixed(6)),
      };
    }
  }

  if (typeof geom !== "string") {
    return fallback;
  }

  const trimmed = geom.trim();

  // 2. Cadena WKT / EWKT: "SRID=4326;POINT(-74.2238 11.1929)"
  const wktMatch = trimmed.match(
    /POINT\s*\(\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\s*\)/i
  );
  if (wktMatch) {
    const lng = Number.parseFloat(wktMatch[1]);
    const lat = Number.parseFloat(wktMatch[2]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) {
      return {
        lng: Number(lng.toFixed(6)),
        lat: Number(lat.toFixed(6)),
      };
    }
  }

  // 3. Cadena hexadecimal EWKB / WKB de PostGIS
  if (/^[0-9a-fA-F]{42,}$/.test(trimmed) && trimmed.length % 2 === 0) {
    try {
      const byteCount = trimmed.length / 2;
      const bytes = new Uint8Array(byteCount);
      for (let i = 0; i < byteCount; i++) {
        bytes[i] = Number.parseInt(trimmed.slice(i * 2, i * 2 + 2), 16);
      }
      const view = new DataView(bytes.buffer);
      const littleEndian = bytes[0] === 1;
      const rawType = view.getUint32(1, littleEndian);
      const hasSrid = (rawType & 0x20000000) !== 0;
      const baseType = rawType & 0x0fffffff;

      if (baseType === 1) {
        const coordOffset = hasSrid ? 9 : 5;
        if (byteCount >= coordOffset + 16) {
          const lng = view.getFloat64(coordOffset, littleEndian);
          const lat = view.getFloat64(coordOffset + 8, littleEndian);
          if (Number.isFinite(lng) && Number.isFinite(lat)) {
            return {
              lng: Number(lng.toFixed(6)),
              lat: Number(lat.toFixed(6)),
            };
          }
        }
      }
    } catch {
      return fallback;
    }
  }

  return fallback;
}

/**
 * Formatea un par `{ lat, lng }` en notación legible para la ficha técnica
 * (ej. `"11.1929° N, 74.2238° O"`).
 */
export function formatCoordinatesText(lat: number, lng: number): string {
  const latHemisphere = lat >= 0 ? "N" : "S";
  const lngHemisphere = lng >= 0 ? "E" : "O";
  return `${Math.abs(lat).toFixed(4)}° ${latHemisphere}, ${Math.abs(lng).toFixed(4)}° ${lngHemisphere}`;
}

/**
 * Calcula la distancia geodésica en kilómetros entre dos coordenadas usando la fórmula de Haversine.
 */
export function calculateHaversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)));
  return earthRadiusKm * c;
}
