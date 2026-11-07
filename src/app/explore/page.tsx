import { getRestaurantsWithFallback } from "@/lib/supabase/server";
import { ExploreDirectoryClient } from "@/features/restaurants/ExploreDirectoryClient";

export const revalidate = 300;

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string;
    level?: string;
    dist?: string;
    verified?: string;
    zero?: string;
  }>;
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const [restaurants, resolvedParams] = await Promise.all([
    getRestaurantsWithFallback(),
    searchParams,
  ]);

  const initialSearchQuery = resolvedParams.q ?? "";
  const initialLevel = resolvedParams.level ?? "all";
  const parsedDist = Number(resolvedParams.dist);
  const initialMaxDistance =
    Number.isFinite(parsedDist) && parsedDist > 0 ? parsedDist : 10;
  const initialVerifiedOnly = resolvedParams.verified === "1";
  const initialZeroInfractions = resolvedParams.zero === "1";

  return (
    <ExploreDirectoryClient
      restaurants={restaurants}
      initialSearchQuery={initialSearchQuery}
      initialLevel={initialLevel}
      initialMaxDistance={initialMaxDistance}
      initialVerifiedOnly={initialVerifiedOnly}
      initialZeroInfractions={initialZeroInfractions}
    />
  );
}
