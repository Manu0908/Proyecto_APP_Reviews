-- ==============================================================================
-- PROYECTO RESEÑAS — MIGRACIÓN INICIAL REPRODUCIBLE (KISS & YAGNI: 4 TABLAS)
-- Motor: PostgreSQL 15+ con PostGIS y Row Level Security (Zero-Trust)
-- ==============================================================================

-- 0. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ==============================================================================
-- 1. TABLA: profiles (Perfiles de inspectores ciudadanos y propietarios)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'citizen_inspector'
    CHECK (role IN ('citizen_inspector', 'verified_owner', 'moderator')),
  total_audits INTEGER NOT NULL DEFAULT 0 CHECK (total_audits >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 2. TABLA: restaurants (Establecimientos con geometría PostGIS e índice GiST)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (LENGTH(TRIM(name)) >= 2),
  cuisine TEXT NOT NULL DEFAULT 'Cocina General',
  address TEXT NOT NULL CHECK (LENGTH(TRIM(address)) >= 5),
  city TEXT NOT NULL DEFAULT 'Santa Marta',
  geom GEOMETRY(Point, 4326) NOT NULL,
  biosecurity_score NUMERIC(4,1) NOT NULL DEFAULT 100.0
    CHECK (biosecurity_score >= 0.0 AND biosecurity_score <= 100.0),
  biosecurity_level TEXT NOT NULL DEFAULT 'excelente'
    CHECK (biosecurity_level IN ('excelente', 'favorable', 'alerta', 'aseptico', 'esterilizado', 'antiseptico', 'filtrado')),
  has_critical_veto BOOLEAN NOT NULL DEFAULT FALSE,
  total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  hero_image TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_geom
  ON public.restaurants USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_restaurants_city
  ON public.restaurants (city);

-- ==============================================================================
-- 3. TABLA: reviews (Auditorías ciudadanas con ponderación 40/35/15/10)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Los 4 pilares del motor de bioseguridad (escala 1.0 a 5.0):
  -- 1. Nivel Crítico (Baños, agua potable, plagas): 40%
  score_critical NUMERIC(2,1) NOT NULL CHECK (score_critical >= 1.0 AND score_critical <= 5.0),
  -- 2. Nivel Operativo (Personal y manipulación): 35%
  score_operational NUMERIC(2,1) NOT NULL CHECK (score_operational >= 1.0 AND score_operational <= 5.0),
  -- 3. Nivel Utensilios (Vajilla, cubiertos, cristalería): 15%
  score_utensils NUMERIC(2,1) NOT NULL CHECK (score_utensils >= 1.0 AND score_utensils <= 5.0),
  -- 4. Nivel Salón (Comedor, mesas, ventilación): 10%
  score_dining NUMERIC(2,1) NOT NULL CHECK (score_dining >= 1.0 AND score_dining <= 5.0),

  selected_chips TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT,
  has_verified_receipt BOOLEAN NOT NULL DEFAULT FALSE,
  owner_reply TEXT,
  owner_reply_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Regla anti-difamación: si la puntuación crítica activa el veto sanitario (<= 2.0),
  -- se exige obligatoriamente un comentario descriptivo de al menos 30 caracteres.
  CONSTRAINT chk_anti_defamation_comment CHECK (
    score_critical > 2.0 OR (comment IS NOT NULL AND LENGTH(TRIM(comment)) >= 30)
  )
);

CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id
  ON public.reviews (restaurant_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id
  ON public.reviews (user_id);

-- ==============================================================================
-- 4. TABLA: review_photos (Evidencia fotográfica comprimida en WebP < 150 KB)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.review_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  size_bytes INTEGER NOT NULL DEFAULT 0 CHECK (size_bytes >= 0 AND size_bytes <= 204800),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_photos_review_id
  ON public.review_photos (review_id);

-- ==============================================================================
-- 5. MOTOR TRANSACCIONAL DE BIOSEGURIDAD (FÓRMULA 40/35/15/10 + VETO SANITARIO)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_restaurant_biosecurity()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_target_restaurant_id UUID;
  v_count INTEGER;
  v_avg_critical NUMERIC;
  v_avg_operational NUMERIC;
  v_avg_utensils NUMERIC;
  v_avg_dining NUMERIC;
  v_has_veto BOOLEAN := FALSE;
  v_weighted_score NUMERIC(4,1);
  v_level TEXT := 'excelente';
BEGIN
  v_target_restaurant_id := COALESCE(NEW.restaurant_id, OLD.restaurant_id);

  SELECT
    COUNT(*),
    AVG(score_critical),
    AVG(score_operational),
    AVG(score_utensils),
    AVG(score_dining),
    BOOL_OR(score_critical <= 2.0)
  INTO
    v_count,
    v_avg_critical,
    v_avg_operational,
    v_avg_utensils,
    v_avg_dining,
    v_has_veto
  FROM public.reviews
  WHERE restaurant_id = v_target_restaurant_id;

  IF v_count > 0 THEN
    -- Fórmula Ponderada Oficial:
    -- ((Crítico * 0.40) + (Operativo * 0.35) + (Utensilios * 0.15) + (Salón * 0.10)) * 20.0
    v_weighted_score := ROUND(
      (
        (v_avg_critical * 0.40) +
        (v_avg_operational * 0.35) +
        (v_avg_utensils * 0.15) +
        (v_avg_dining * 0.10)
      ) * 20.0,
      1
    );

    -- Regla de Veto Sanitario:
    -- Si alguna auditoría reporta score_critical <= 2.0, el puntaje global se trunca
    -- a un máximo de 45.0 y el nivel se degrada automáticamente a 'alerta'.
    IF v_has_veto THEN
      v_weighted_score := LEAST(v_weighted_score, 45.0);
      v_level := 'alerta';
    ELSIF v_weighted_score >= 95.0 THEN
      v_level := 'aseptico';
    ELSIF v_weighted_score >= 80.0 THEN
      v_level := 'esterilizado';
    ELSIF v_weighted_score >= 70.0 THEN
      v_level := 'antiseptico';
    ELSIF v_weighted_score >= 60.0 THEN
      v_level := 'filtrado';
    ELSE
      v_level := 'alerta';
    END IF;

    UPDATE public.restaurants
    SET
      biosecurity_score = v_weighted_score,
      biosecurity_level = v_level,
      has_critical_veto = v_has_veto,
      total_reviews = v_count
    WHERE id = v_target_restaurant_id;
  ELSE
    UPDATE public.restaurants
    SET
      biosecurity_score = 100.0,
      biosecurity_level = 'aseptico',
      has_critical_veto = FALSE,
      total_reviews = 0
    WHERE id = v_target_restaurant_id;
  END IF;

  IF TG_OP = 'INSERT' AND NEW.user_id IS NOT NULL THEN
    UPDATE public.profiles
    SET total_audits = total_audits + 1
    WHERE id = NEW.user_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_biosecurity_score ON public.reviews;

CREATE TRIGGER trg_sync_biosecurity_score
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_restaurant_biosecurity();

-- ==============================================================================
-- 6. POLÍTICAS ROW LEVEL SECURITY (RLS ZERO-TRUST)
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_photos ENABLE ROW LEVEL SECURITY;

-- 6.1. Políticas para profiles
CREATE POLICY "profiles_select_public"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 6.2. Políticas para restaurants
CREATE POLICY "restaurants_select_public"
  ON public.restaurants FOR SELECT
  USING (true);

CREATE POLICY "restaurants_insert_authenticated"
  ON public.restaurants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "restaurants_update_owner"
  ON public.restaurants FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 6.3. Políticas para reviews
CREATE POLICY "reviews_select_public"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "reviews_insert_authenticated"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_author_or_owner"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = reviews.restaurant_id AND r.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = reviews.restaurant_id AND r.owner_id = auth.uid()
    )
  );

-- 6.4. Políticas para review_photos
CREATE POLICY "review_photos_select_public"
  ON public.review_photos FOR SELECT
  USING (true);

CREATE POLICY "review_photos_insert_author"
  ON public.review_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reviews rev
      WHERE rev.id = review_photos.review_id AND rev.user_id = auth.uid()
    )
  );
