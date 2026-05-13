-- TAHAP 4: Tabel prospek swasta B2B dari Google Places
CREATE TABLE IF NOT EXISTS public.b2b_prospects (
  id              BIGSERIAL    PRIMARY KEY,
  place_id        TEXT         UNIQUE NOT NULL,
  nama            TEXT         NOT NULL,
  alamat          TEXT,
  telepon         TEXT,
  website         TEXT,
  rating          NUMERIC(3,1) CHECK (rating BETWEEN 0 AND 5),
  total_reviews   INTEGER      DEFAULT 0,
  lat             NUMERIC(10,6),
  lng             NUMERIC(10,6),
  sektor          TEXT         NOT NULL DEFAULT 'lainnya',
  kota            TEXT,
  provinsi        TEXT,
  -- Status prospek — diubah manual oleh user
  status          TEXT         NOT NULL DEFAULT 'baru',
  catatan         TEXT,
  email_draft     TEXT,
  ai_notes        TEXT,
  is_bookmarked   BOOLEAN      NOT NULL DEFAULT FALSE,
  synced_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_sektor       ON public.b2b_prospects (sektor);
CREATE INDEX IF NOT EXISTS idx_b2b_status       ON public.b2b_prospects (status);
CREATE INDEX IF NOT EXISTS idx_b2b_kota         ON public.b2b_prospects (kota);
CREATE INDEX IF NOT EXISTS idx_b2b_provinsi     ON public.b2b_prospects (provinsi);
CREATE INDEX IF NOT EXISTS idx_b2b_rating       ON public.b2b_prospects (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_b2b_bookmark     ON public.b2b_prospects (is_bookmarked) WHERE is_bookmarked = TRUE;

CREATE TRIGGER trg_b2b_updated_at
  BEFORE UPDATE ON public.b2b_prospects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.b2b_prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_b2b"  ON public.b2b_prospects
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "anon_write_b2b" ON public.b2b_prospects
  FOR ALL    TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_b2b" ON public.b2b_prospects
  FOR ALL    TO service_role USING (true) WITH CHECK (true);
