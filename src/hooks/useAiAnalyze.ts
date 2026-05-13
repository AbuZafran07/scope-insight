import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { scorePackage } from '@/lib/scoring';
import type { RupPackage } from './useSirupData';

export interface AiResult {
  score:    number;
  notes:    string;
  kategori: string;
}

export function useAiAnalyze() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<AiResult | null>(null);

  const analyze = async (paket: RupPackage): Promise<AiResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    // Scoring rule-based lokal — gratis, tanpa API eksternal
    const r = scorePackage(
      paket.nama_paket,
      paket.nama_instansi,
      paket.jenis_pengadaan,
    );

    // Simpan hasil ke Supabase
    const { error: dbErr } = await supabase
      .from('rup_packages')
      .update({
        ai_score:     r.score,
        ai_reasoning: r.notes,
        ai_category:  r.kategori,
      })
      .eq('kode_rup', paket.kode_rup);

    setLoading(false);

    if (dbErr) {
      setError(dbErr.message);
      return null;
    }

    setResult(r);
    return r;
  };

  return { analyze, loading, error, result };
}
