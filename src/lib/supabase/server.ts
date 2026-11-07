import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Database, isSupabaseConfigured } from "@/lib/supabase/client";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { BiosecurityLevel, Restaurant, Review } from "@/types";
import {
  BiosecurityPillarsInput,
  calculateAggregateBiosecurityScore,
  calculateBiosecurityScore,
  resolveBiosecurityLevel,
} from "@/features/biosecurity/calculator";
import { formatCoordinatesText, parsePostGISPoint } from "@/lib/geo";

interface RuntimeStore {
  restaurants: Restaurant[];
  pillarHistoryByRestaurant: Record<string, BiosecurityPillarsInput[]>;
}

const globalForRuntimeStore = globalThis as unknown as {
  __PROYECTO_RESENAS_RUNTIME_STORE__?: RuntimeStore;
};

function getRuntimeStore(): RuntimeStore {
  if (!globalForRuntimeStore.__PROYECTO_RESENAS_RUNTIME_STORE__) {
    globalForRuntimeStore.__PROYECTO_RESENAS_RUNTIME_STORE__ = {
      restaurants: structuredClone(MOCK_RESTAURANTS),
      pillarHistoryByRestaurant: {},
    };
  }
  return globalForRuntimeStore.__PROYECTO_RESENAS_RUNTIME_STORE__;
}

/**
 * Registra un nuevo establecimiento en el almacén en memoria del servidor cuando se opera
 * en modo resiliente local (sin credenciales de Supabase o sin sesión autenticada).
 */
export function recordFallbackRestaurant(params: {
  id: string;
  name: string;
  cuisine: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
}): Restaurant {
  const store = getRuntimeStore();
  const shortName = params.name.slice(0, 22);
  const newRestaurant: Restaurant = {
    id: params.id,
    name: params.name,
    shortName,
    tagline: params.cuisine || "Gastronomía Auditada",
    cuisine: params.cuisine || "Cocina General",
    subCuisine: "Establecimiento Registrado",
    city: params.city || "Santa Marta",
    location: params.address,
    coordinatesText: formatCoordinatesText(params.lat, params.lng),
    lng: params.lng,
    lat: params.lat,
    grade: 100.0,
    level: "aseptico",
    auditCycle: "Ciclo #01-COM",
    auditDate: new Date().toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    accreditation: "Auditoría Comunitaria",
    verifiedProtocolHash: `0x${params.id
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 4)
      .toUpperCase()}...${params.id
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(-4)
      .toUpperCase()}`,
    description: `Establecimiento registrado por la comunidad en ${params.address}, ${params.city}.`,
    heroImage:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
    metrics: {
      surfacePurity: 100,
      coldChain: "Verificado",
      airQuality: "Estándar",
      infractions: 0,
    },
    detailedMetrics: structuredClone(MOCK_RESTAURANTS[0].detailedMetrics),
    chronology: [],
    reviews: [],
  };

  store.restaurants = [
    newRestaurant,
    ...store.restaurants.filter((r) => r.id !== params.id),
  ];
  return newRestaurant;
}

/**
 * Registra una auditoría ciudadana en el almacén en memoria del servidor y recalcula
 * la calificación global y nivel sanitario del establecimiento aplicando la fórmula 40/35/15/10
 * y la regla de veto sanitario (BOOL_OR(scoreCritical <= 2.0) -> máx 45.0 y nivel 'alerta').
 */
export function recordFallbackReview(params: {
  restaurantId: string;
  pillars: BiosecurityPillarsInput;
  comment: string;
  hasVerifiedReceipt: boolean;
}): { updatedRestaurant?: Restaurant; review: Review } {
  const store = getRuntimeStore();
  const singleCalc = calculateBiosecurityScore(params.pillars);

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    authorName: "Inspector Comunitario",
    authorRank: "Auditor Ciudadano Verificado",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
    date: "Hace unos instantes",
    score: singleCalc.score,
    comment:
      params.comment.trim() ||
      "Inspección sanitaria completada mediante lista de verificación de 4 pilares.",
    hasVerifiedReceipt: params.hasVerifiedReceipt,
    criteriaRatings: {
      bathrooms: params.pillars.scoreCritical,
      staff: params.pillars.scoreOperational,
      utensils: params.pillars.scoreUtensils,
      hall: params.pillars.scoreDining,
    },
  };

  const history = store.pillarHistoryByRestaurant[params.restaurantId] ?? [];
  const nextHistory = [...history, params.pillars];
  store.pillarHistoryByRestaurant[params.restaurantId] = nextHistory;

  const aggregate = calculateAggregateBiosecurityScore(nextHistory);

  const idx = store.restaurants.findIndex((r) => r.id === params.restaurantId);
  if (idx !== -1) {
    const target = store.restaurants[idx];
    const updated: Restaurant = {
      ...target,
      grade: aggregate.score,
      level: aggregate.level,
      metrics: {
        ...target.metrics,
        surfacePurity: Math.round(aggregate.score),
        infractions: aggregate.hasCriticalVeto
          ? Math.max(1, aggregate.infractionsCount)
          : aggregate.infractionsCount,
      },
      reviews: [newReview, ...(target.reviews ?? [])],
    };
    store.restaurants[idx] = updated;
    return { updatedRestaurant: updated, review: newReview };
  }

  return { review: newReview };
}

/**
 * Crea un cliente tipado de Supabase para el servidor (RSC, Server Actions, Route Handlers).
 * Devuelve `null` de forma segura si `NEXT_PUBLIC_SUPABASE_URL` o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 * no están configuradas en el entorno local.
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database> | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignorado cuando se invoca desde un Server Component puro de solo lectura
          }
        },
      },
    }
  );
}

/**
 * Obtiene el catálogo de restaurantes desde Supabase si está configurado,
 * o aplica un fallback elegante al almacén de restaurantes basado en `MOCK_RESTAURANTS`
 * cuando se ejecuta sin credenciales.
 */
export async function getRestaurantsWithFallback(): Promise<Restaurant[]> {
  const store = getRuntimeStore();
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return store.restaurants;
  }

  try {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("biosecurity_score", { ascending: false })
      .limit(200);

    if (error || !data || data.length === 0) {
      return store.restaurants;
    }

    const mapped: Restaurant[] = data.map((row) => {
      const score = Number(row.biosecurity_score ?? 100);
      const hasVeto = Boolean(row.has_critical_veto);
      const validLevels: BiosecurityLevel[] = [
        "alerta",
        "filtrado",
        "antiseptico",
        "esterilizado",
        "aseptico",
      ];
      const level: BiosecurityLevel = validLevels.includes(
        row.biosecurity_level as BiosecurityLevel
      )
        ? (row.biosecurity_level as BiosecurityLevel)
        : resolveBiosecurityLevel(score, hasVeto);

      // Si coincide con algún restaurante del catálogo semilla, preserva sus métricas enriquecidas
      const seedMatch = store.restaurants.find(
        (m) => m.id === row.id || m.name.toLowerCase() === row.name.toLowerCase()
      );

      if (seedMatch) {
        return {
          ...seedMatch,
          grade: score,
          level,
        };
      }

      const parsedCoords = parsePostGISPoint(row.geom);

      return {
        id: row.id,
        name: row.name,
        shortName: row.name.slice(0, 22),
        tagline: row.cuisine || "Gastronomía Auditada",
        cuisine: row.cuisine || "Cocina General",
        subCuisine: "Establecimiento Registrado",
        city: row.city || "Colombia",
        location: row.address,
        coordinatesText: formatCoordinatesText(
          parsedCoords.lat,
          parsedCoords.lng
        ),
        lng: parsedCoords.lng,
        lat: parsedCoords.lat,
        grade: score,
        level,
        auditCycle: "Ciclo #01-COM",
        auditDate: new Date(row.created_at).toLocaleDateString("es-CO", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        accreditation: "Auditoría Comunitaria",
        verifiedProtocolHash: `0x${row.id.replace(/-/g, "").slice(0, 4).toUpperCase()}...${row.id
          .replace(/-/g, "")
          .slice(-4)
          .toUpperCase()}`,
        description: `Establecimiento registrado por la comunidad en ${row.address}, ${row.city}.`,
        heroImage:
          row.hero_image ||
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop",
        metrics: {
          surfacePurity: Math.round(score),
          coldChain: "Verificado",
          airQuality: "Estándar",
          infractions: hasVeto ? 1 : 0,
        },
        detailedMetrics: MOCK_RESTAURANTS[0].detailedMetrics,
        chronology: [],
        reviews: [],
      };
    });

    return mapped;
  } catch {
    return store.restaurants;
  }
}

/**
 * Obtiene un restaurante por su ID desde Supabase o desde el almacén en memoria como fallback.
 */
export async function getRestaurantByIdWithFallback(
  id: string
): Promise<Restaurant> {
  const all = await getRestaurantsWithFallback();
  return all.find((r) => r.id === id) || all[0] || MOCK_RESTAURANTS[0];
}

