import { NextResponse } from "next/server";
import { getRestaurantsWithFallback } from "@/lib/supabase/server";

export interface PinGeoJSONFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: {
    id: string;
    name: string;
    shortName: string;
    grade: number;
    level: string;
    city: string;
  };
}

export interface PinGeoJSONCollection {
  type: "FeatureCollection";
  features: PinGeoJSONFeature[];
}

/**
 * Route Handler GeoJSON ultra-compacto para los pines del mapa.
 * Se sirve desde el CDN Edge con caché perimetral (s-maxage=300, stale-while-revalidate=600)
 * para garantizar $0.00 USD en invocaciones serverless y lecturas de base de datos.
 */
export async function GET() {
  const restaurants = await getRestaurantsWithFallback();

  const geojson: PinGeoJSONCollection = {
    type: "FeatureCollection",
    features: restaurants.map((r) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [r.lng, r.lat],
      },
      properties: {
        id: r.id,
        name: r.name,
        shortName: r.shortName,
        grade: r.grade,
        level: r.level,
        city: r.city,
      },
    })),
  };

  return NextResponse.json(geojson, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
