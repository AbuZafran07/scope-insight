
CREATE TABLE IF NOT EXISTS public.b2b_prospects (
  id              BIGSERIAL    PRIMARY KEY,
  place_id        TEXT         UNIQUE NOT NULL,
  nama            TEXT         NOT NULL,
  alamat          TEXT,
  telepon         TEXT,
  website         TEXT,
  rating          NUMERIC(3,1),
  total_reviews   INTEGER      DEFAULT 0,
  lat             NUMERIC(10,6),
  lng             NUMERIC(10,6),
  sektor          TEXT         NOT NULL DEFAULT 'lainnya',
  kota            TEXT,
  provinsi        TEXT,
  status          TEXT         NOT NULL DEFAULT 'baru',
  catatan         TEXT,
  email_draft     TEXT,
  ai_notes        TEXT,
  is_bookmarked   BOOLEAN      NOT NULL DEFAULT FALSE,
  synced_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_b2b_sektor   ON public.b2b_prospects (sektor);
CREATE INDEX IF NOT EXISTS idx_b2b_status   ON public.b2b_prospects (status);
CREATE INDEX IF NOT EXISTS idx_b2b_kota     ON public.b2b_prospects (kota);
CREATE INDEX IF NOT EXISTS idx_b2b_provinsi ON public.b2b_prospects (provinsi);
CREATE INDEX IF NOT EXISTS idx_b2b_rating   ON public.b2b_prospects (rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_b2b_bookmark ON public.b2b_prospects (is_bookmarked) WHERE is_bookmarked = TRUE;

DROP TRIGGER IF EXISTS trg_b2b_updated_at ON public.b2b_prospects;
CREATE TRIGGER trg_b2b_updated_at
  BEFORE UPDATE ON public.b2b_prospects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.b2b_prospects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read b2b_prospects"  ON public.b2b_prospects;
DROP POLICY IF EXISTS "Public write b2b_prospects" ON public.b2b_prospects;

CREATE POLICY "Public read b2b_prospects"
  ON public.b2b_prospects FOR SELECT USING (true);

CREATE POLICY "Public write b2b_prospects"
  ON public.b2b_prospects FOR ALL USING (true) WITH CHECK (true);
