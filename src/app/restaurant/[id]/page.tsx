import { getRestaurantByIdWithFallback } from "@/lib/supabase/server";
import { MOCK_RESTAURANTS } from "@/data/mockData";
import { RestaurantDetailClient } from "@/features/restaurants/RestaurantDetailClient";

/**
 * Incremental Static Regeneration (ISR) cada 3600 segundos (1 hora).
 * Sirve las fichas de restaurantes desde el Edge CDN con 0 invocaciones repetitivas.
 */
export const revalidate = 3600;

export function generateStaticParams() {
  return MOCK_RESTAURANTS.map((r) => ({ id: r.id }));
}

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurant = await getRestaurantByIdWithFallback(id);

  return <RestaurantDetailClient restaurant={restaurant} />;
}
