import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type B2bProspect = Database['public']['Tables']['b2b_prospects']['Row'];

export interface B2bFilters {
  keyword?:    string;
  sektor?:     string;
  kota?:       string;
  status?:     string;
  ratingMin?:  number | null;
  bookmarked?: boolean;
}

export interface SyncParams {
  keyword:     string;
  kota:        string;
  sektor:      string;
  provinsi?:   string;
  maxResults?: number;
}

export function useB2bData(filters: B2bFilters = {}) {
  const [prospects, setProspects] = useState<B2bProspect[]>([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [syncing, setSyncing]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const filtersKey = JSON.stringify(filters);
  const prevKey    = useRef('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    let q = supabase
      .from('b2b_prospects')
      .select('*', { count: 'exact' })
      .order('rating',        { ascending: false, nullsFirst: false })
      .order('total_reviews', { ascending: false })
      .limit(500);

    if (filters.keyword)              q = q.ilike('nama',         `%${filters.keyword}%`);
    if (filters.sektor)               q = q.eq   ('sektor',        filters.sektor);
    if (filters.kota)                 q = q.ilike('kota',          `%${filters.kota}%`);
    if (filters.status)               q = q.eq   ('status',        filters.status);
    if (filters.ratingMin != null)    q = q.gte  ('rating',        filters.ratingMin);
    if (filters.bookmarked)           q = q.eq   ('is_bookmarked', true);

    const { data, error: err, count } = await q;
    if (err) {
      setError(err.message);
    } else {
      setProspects(data ?? []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (filtersKey !== prevKey.current) {
      prevKey.current = filtersKey;
    }
    load();
  }, [filtersKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const sync = useCallback(async (params: SyncParams) => {
    setSyncing(true);
    setError(null);
    const { error: fnErr } = await supabase.functions.invoke('places-search', { body: params });
    if (fnErr) setError(fnErr.message);
    setSyncing(false);
    await load();
  }, [load]);

  const updateStatus = useCallback(async (id: number, status: string) => {
    const { error: err } = await supabase
      .from('b2b_prospects')
      .update({ status })
      .eq('id', id);
    if (!err) setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  }, []);

  const updateCatatan = useCallback(async (id: number, catatan: string) => {
    const { error: err } = await supabase
      .from('b2b_prospects')
      .update({ catatan })
      .eq('id', id);
    if (!err) setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, catatan } : p)));
  }, []);

  const saveEmailDraft = useCallback(async (id: number, email_draft: string) => {
    const { error: err } = await supabase
      .from('b2b_prospects')
      .update({ email_draft })
      .eq('id', id);
    if (!err) setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, email_draft } : p)));
  }, []);

  const toggleBookmark = useCallback(async (id: number, current: boolean) => {
    const { error: err } = await supabase
      .from('b2b_prospects')
      .update({ is_bookmarked: !current })
      .eq('id', id);
    if (!err)
      setProspects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_bookmarked: !current } : p)),
      );
  }, []);

  return {
    prospects,
    total,
    loading,
    syncing,
    error,
    sync,
    reload:         load,
    updateStatus,
    updateCatatan,
    saveEmailDraft,
    toggleBookmark,
  };
}
