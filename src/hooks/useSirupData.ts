import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type RupPackage = Database['public']['Tables']['rup_packages']['Row'];

export interface SirupFilters {
  keyword?:      string;
  provinsi?:     string;
  jenis?:        string[];
  status?:       string[];
  instansi?:     string;
  paguMin?:      number | null;
  paguMax?:      number | null;
  aiScoreMin?:   number | null;
  bookmarked?:   boolean;
  tahunAnggaran?: number;
}

const PAGE_SIZE = 50;

export function useSirupData(filters: SirupFilters = {}) {
  const [packages, setPackages]   = useState<RupPackage[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(0);
  // Freeze filters stringification to detect real changes
  const filtersKey = JSON.stringify(filters);
  const prevKey    = useRef('');

  const load = useCallback(async (pg = page) => {
    setLoading(true);
    setError(null);

    let q = supabase
      .from('rup_packages')
      .select('*', { count: 'exact' })
      .eq('tahun_anggaran', filters.tahunAnggaran ?? 2026)
      .order('ai_score',  { ascending: false, nullsFirst: false })
      .order('pagu',      { ascending: false })
      .range(pg * PAGE_SIZE, (pg + 1) * PAGE_SIZE - 1);

    if (filters.keyword)          q = q.ilike('nama_paket',    `%${filters.keyword}%`);
    if (filters.provinsi)         q = q.eq  ('nama_provinsi',   filters.provinsi);
    if (filters.instansi)         q = q.ilike('nama_instansi', `%${filters.instansi}%`);
    if (filters.jenis?.length)    q = q.in  ('jenis_pengadaan', filters.jenis);
    if (filters.status?.length)   q = q.in  ('status_aktif',    filters.status);
    if (filters.paguMin != null)  q = q.gte ('pagu',            filters.paguMin);
    if (filters.paguMax != null)  q = q.lte ('pagu',            filters.paguMax);
    if (filters.aiScoreMin != null) q = q.gte('ai_score',       filters.aiScoreMin);
    if (filters.bookmarked)       q = q.eq  ('is_bookmarked',   true);

    const { data, error: err, count } = await q;
    if (err) {
      setError(err.message);
    } else {
      setPackages(data ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [filtersKey, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset page when filters change
  useEffect(() => {
    if (filtersKey !== prevKey.current) {
      prevKey.current = filtersKey;
      setPage(0);
      load(0);
    } else {
      load(page);
    }
  }, [filtersKey, page]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Sinkron data baru dari SIRUP LKPP via edge function sirup-proxy */
  const sync = useCallback(async (params: {
    keyword?:      string;
    provinsi?:     string;
    limit?:        number;
    tahunAnggaran?: number;
  } = {}) => {
    setSyncing(true);
    setError(null);
    const { error: fnErr } = await supabase.functions.invoke('sirup-proxy', {
      body: {
        keyword:       params.keyword       ?? filters.keyword  ?? '',
        provinsi:      params.provinsi      ?? filters.provinsi ?? '',
        limit:         params.limit         ?? 100,
        offset:        0,
        tahunAnggaran: params.tahunAnggaran ?? filters.tahunAnggaran ?? 2026,
      },
    });
    if (fnErr) setError(fnErr.message);
    setSyncing(false);
    await load(0);
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Toggle bookmark */
  const toggleBookmark = useCallback(async (kode_rup: string, current: boolean) => {
    await supabase
      .from('rup_packages')
      .update({ is_bookmarked: !current })
      .eq('kode_rup', kode_rup);
    setPackages((prev) =>
      prev.map((p) =>
        p.kode_rup === kode_rup ? { ...p, is_bookmarked: !current } : p,
      ),
    );
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return {
    packages,
    total,
    totalPages,
    loading,
    syncing,
    error,
    page,
    setPage,
    sync,
    reload:         () => load(page),
    toggleBookmark,
  };
}
