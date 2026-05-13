-- Tabel paket pengadaan dari SIRUP LKPP
CREATE TABLE public.rup_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kode_rup TEXT NOT NULL UNIQUE,
  nama_paket TEXT NOT NULL,
  nama_instansi TEXT,
  nama_satker TEXT,
  nama_provinsi TEXT,
  nama_kabupaten TEXT,
  jenis_pengadaan TEXT,
  metode_pengadaan TEXT,
  sumber_dana TEXT,
  pagu NUMERIC,
  status_aktif TEXT,
  tanggal_pemilihan_mulai DATE,
  tanggal_pemilihan_selesai DATE,
  tanggal_pekerjaan_mulai DATE,
  tanggal_pekerjaan_selesai DATE,
  tahun_anggaran INTEGER NOT NULL DEFAULT 2026,
  uraian_pekerjaan TEXT,
  ai_score INTEGER,
  ai_reasoning TEXT,
  ai_category TEXT,
  is_bookmarked BOOLEAN NOT NULL DEFAULT false,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_rup_tahun ON public.rup_packages(tahun_anggaran);
CREATE INDEX idx_rup_provinsi ON public.rup_packages(nama_provinsi);
CREATE INDEX idx_rup_jenis ON public.rup_packages(jenis_pengadaan);
CREATE INDEX idx_rup_status ON public.rup_packages(status_aktif);
CREATE INDEX idx_rup_ai_score ON public.rup_packages(ai_score DESC NULLS LAST);
CREATE INDEX idx_rup_pagu ON public.rup_packages(pagu DESC NULLS LAST);
CREATE INDEX idx_rup_bookmarked ON public.rup_packages(is_bookmarked) WHERE is_bookmarked = true;

ALTER TABLE public.rup_packages ENABLE ROW LEVEL SECURITY;

-- Data SIRUP adalah data publik dari LKPP, dapat dibaca semua orang
CREATE POLICY "Public read access to rup_packages"
  ON public.rup_packages FOR SELECT
  USING (true);

-- Hanya server (service role) yang boleh insert/update/delete via edge function
CREATE POLICY "Authenticated can update bookmark"
  ON public.rup_packages FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Cache untuk hasil AI
CREATE TABLE public.ai_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  cache_type TEXT NOT NULL,
  result JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_cache_key ON public.ai_cache(cache_key);
CREATE INDEX idx_ai_cache_expires ON public.ai_cache(expires_at);

ALTER TABLE public.ai_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ai_cache"
  ON public.ai_cache FOR SELECT
  USING (true);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_rup_packages_updated_at
  BEFORE UPDATE ON public.rup_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();