-- TAHAP 3: Tabel utama paket pengadaan B2G dari SIRUP LKPP
CREATE TABLE IF NOT EXISTS public.rup_packages (
  id                     BIGSERIAL PRIMARY KEY,
  kode_rup               TEXT        UNIQUE NOT NULL,
  nama_paket             TEXT        NOT NULL,
  nama_satker            TEXT,
  kode_satker            TEXT,
  nama_instansi          TEXT,
  kode_instansi          TEXT,
  nama_provinsi          TEXT,
  kode_provinsi          TEXT,
  pagu                   BIGINT      NOT NULL DEFAULT 0,
  metode_pengadaan       TEXT,
  jenis_pengadaan        TEXT,
  status_aktif           TEXT        NOT NULL DEFAULT 'Aktif',
  tahun_anggaran         INTEGER     NOT NULL DEFAULT 2026,
  tanggal_pembuatan      TIMESTAMPTZ,
  tanggal_akhir_pemilihan TIMESTAMPTZ,
  -- AI scoring dari ai-analyze edge function
  ai_score               SMALLINT    CHECK (ai_score BETWEEN 0 AND 100),
  ai_notes               TEXT,
  ai_kategori            TEXT,
  -- User state
  is_bookmarked          BOOLEAN     NOT NULL DEFAULT FALSE,
  synced_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes untuk filter & sort yang umum dipakai
CREATE INDEX IF NOT EXISTS idx_rup_provinsi   ON public.rup_packages (nama_provinsi);
CREATE INDEX IF NOT EXISTS idx_rup_jenis      ON public.rup_packages (jenis_pengadaan);
CREATE INDEX IF NOT EXISTS idx_rup_status     ON public.rup_packages (status_aktif);
CREATE INDEX IF NOT EXISTS idx_rup_tahun      ON public.rup_packages (tahun_anggaran);
CREATE INDEX IF NOT EXISTS idx_rup_pagu       ON public.rup_packages (pagu DESC);
CREATE INDEX IF NOT EXISTS idx_rup_ai_score   ON public.rup_packages (ai_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_rup_bookmark   ON public.rup_packages (is_bookmarked) WHERE is_bookmarked = TRUE;
CREATE INDEX IF NOT EXISTS idx_rup_instansi   ON public.rup_packages USING gin (to_tsvector('simple', COALESCE(nama_instansi, '')));
CREATE INDEX IF NOT EXISTS idx_rup_nama       ON public.rup_packages USING gin (to_tsvector('simple', COALESCE(nama_paket, '')));

-- Updated_at auto-trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rup_updated_at
  BEFORE UPDATE ON public.rup_packages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security: anon dapat SELECT, service_role dapat semua
ALTER TABLE public.rup_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read" ON public.rup_packages
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "service_write" ON public.rup_packages
  FOR ALL TO service_role USING (true) WITH CHECK (true);
