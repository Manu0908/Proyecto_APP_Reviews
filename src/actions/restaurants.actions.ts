"use server";

import { revalidatePath } from "next/cache";
import {
  CreateRestaurantInput,
  CreateRestaurantSchema,
} from "@/lib/validations/schemas";
import {
  createServerSupabaseClient,
  recordFallbackRestaurant,
} from "@/lib/supabase/server";

export interface CreateRestaurantResponse {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[]>;
  restaurantId?: string;
  persistedInDatabase?: boolean;
}

/**
 * Server Action para el alta comunitaria de nuevos establecimientos.
 * Valida las coordenadas dentro del territorio colombiano y la integridad de los campos.
 * Si Supabase está configurado y hay sesión, inserta el punto geográfico EPSG:4326 en PostGIS;
 * de lo contrario, registra el establecimiento en el almacén resiliente del servidor.
 */
export async function createRestaurantAction(
  rawInput: CreateRestaurantInput
): Promise<CreateRestaurantResponse> {
  const parsed = CreateRestaurantSchema.safeParse(rawInput);

  if (!parsed.success) {
    return {
      success: false,
      message:
        parsed.error.issues[0]?.message ||
        "Verifica los datos del establecimiento antes de continuar.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const supabase = await createServerSupabaseClient();
  let persistedInDatabase = false;
  let generatedId = `local-${Date.now()}`;

  if (supabase) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const wktPoint = `SRID=4326;POINT(${data.lng} ${data.lat})`;
        const { data: inserted, error } = await supabase
          .from("restaurants")
          .insert({
            name: data.name,
            cuisine: data.cuisine,
            address: data.address,
            city: data.city,
            geom: wktPoint,
            biosecurity_score: 100.0,
            biosecurity_level: "aseptico",
            has_critical_veto: false,
            owner_id: null,
          })
          .select("id")
          .single();

        if (!error && inserted?.id) {
          persistedInDatabase = true;
          generatedId = inserted.id;
        }
      }
    } catch {
      persistedInDatabase = false;
    }
  }

  recordFallbackRestaurant({
    id: generatedId,
    name: data.name,
    cuisine: data.cuisine,
    address: data.address,
    city: data.city,
    lat: data.lat,
    lng: data.lng,
  });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath("/api/map/pins");

  return {
    success: true,
    message: `El establecimiento "${data.name}" fue validado y registrado en el directorio sanitario.`,
    restaurantId: generatedId,
    persistedInDatabase,
  };
}

