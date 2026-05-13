import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RupPackage } from './useSirupData';

export interface AiResult {
  score:    number;
  notes:    string;
  kategori: string;
}

export function useAiAnalyze() {
  const [loading, setLoading]       = useState(false);
  const [error,   setError]         = useState<string | null>(null);
  const [result,  setResult]        = useState<AiResult | null>(null);

  const analyze = async (paket: RupPackage): Promise<AiResult | null> => {
    setLoading(true);
    setError(null);
    setResult(null);

    const { data, error: fnErr } = await supabase.functions.invoke('ai-analyze', {
      body: { kode_rup: paket.kode_rup, paket },
    });

    setLoading(false);

    if (fnErr) {
      setError(fnErr.message);
      return null;
    }

    const r = data as AiResult;
    setResult(r);
    return r;
  };

  return { analyze, loading, error, result };
}
