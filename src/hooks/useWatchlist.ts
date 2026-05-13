import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type WatchlistB2G = Database['public']['Tables']['rup_packages']['Row'];
export type WatchlistB2B = Database['public']['Tables']['b2b_prospects']['Row'];

export function useWatchlist() {
  const [b2gItems, setB2gItems] = useState<WatchlistB2G[]>([]);
  const [b2bItems, setB2bItems] = useState<WatchlistB2B[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [b2gRes, b2bRes] = await Promise.all([
      supabase
        .from('rup_packages')
        .select('*')
        .eq('is_bookmarked', true)
        .order('pagu', { ascending: false, nullsFirst: false }),
      supabase
        .from('b2b_prospects')
        .select('*')
        .eq('is_bookmarked', true)
        .order('rating', { ascending: false, nullsFirst: false }),
    ]);
    if (b2gRes.error) setError(b2gRes.error.message);
    if (b2bRes.error) setError(b2bRes.error.message);
    setB2gItems(b2gRes.data ?? []);
    setB2bItems(b2bRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const unbookmarkB2G = useCallback(async (kode_rup: string) => {
    await supabase.from('rup_packages').update({ is_bookmarked: false }).eq('kode_rup', kode_rup);
    setB2gItems((prev) => prev.filter((p) => p.kode_rup !== kode_rup));
  }, []);

  const unbookmarkB2B = useCallback(async (id: number) => {
    await supabase.from('b2b_prospects').update({ is_bookmarked: false }).eq('id', id);
    setB2bItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    b2gItems, b2bItems,
    loading, error,
    reload: load,
    unbookmarkB2G, unbookmarkB2B,
  };
}
