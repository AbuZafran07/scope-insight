import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProvChart     { name: string; pagu: number; count: number }
export interface JenisChart    { name: string; value: number }
export interface TrendChart    { month: string; count: number }
export interface InstansiChart { name: string; count: number }
export interface SektorChart   { sektor: string; baru: number; dihubungi: number; negosiasi: number; deal: number; tidak_sesuai: number }
export interface RatingChart   { range: string; count: number }

export interface AnalyticsData {
  provChart:     ProvChart[];
  jenisChart:    JenisChart[];
  trendChart:    TrendChart[];
  instansiChart: InstansiChart[];
  sektorChart:   SektorChart[];
  ratingChart:   RatingChart[];
  kpi: {
    totalPaket:   number;
    totalPagu:    number;
    totalProspek: number;
    dealCount:    number;
    avgRating:    number | null;
  };
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export function useAnalyticsData() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [b2gRes, b2bRes] = await Promise.all([
          supabase
            .from('rup_packages')
            .select('nama_provinsi,pagu,jenis_pengadaan,nama_instansi,tanggal_pemilihan_mulai')
            .limit(5000),
          supabase
            .from('b2b_prospects')
            .select('sektor,status,rating')
            .limit(2000),
        ]);

        const b2g = b2gRes.data ?? [];
        const b2b = b2bRes.data ?? [];

        // ---- Chart 1: Top 10 Provinsi by total pagu ----
        const provMap = new Map<string, { pagu: number; count: number }>();
        for (const p of b2g) {
          if (!p.nama_provinsi) continue;
          const cur = provMap.get(p.nama_provinsi) ?? { pagu: 0, count: 0 };
          provMap.set(p.nama_provinsi, { pagu: cur.pagu + (p.pagu ?? 0), count: cur.count + 1 });
        }
        const provChart = [...provMap.entries()]
          .sort((a, b) => b[1].pagu - a[1].pagu)
          .slice(0, 10)
          .map(([name, d]) => ({ name, pagu: d.pagu, count: d.count }))
          .reverse(); // ascending for horizontal bar readability

        // ---- Chart 2: Jenis Pengadaan ----
        const jenisMap = new Map<string, number>();
        for (const p of b2g) {
          const key = p.jenis_pengadaan ?? 'Lainnya';
          jenisMap.set(key, (jenisMap.get(key) ?? 0) + 1);
        }
        const jenisChart = [...jenisMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, value]) => ({ name, value }));

        // ---- Chart 3: Tren bulanan ----
        const monthCounts = Object.fromEntries(MONTHS.map((m) => [m, 0]));
        for (const p of b2g) {
          const d = p.tanggal_pemilihan_mulai;
          if (!d) continue;
          const mo = MONTHS[new Date(d).getMonth()];
          monthCounts[mo]++;
        }
        const trendChart = MONTHS.map((month) => ({ month, count: monthCounts[month] }));

        // ---- Chart 4: Top 10 Instansi ----
        const instMap = new Map<string, number>();
        for (const p of b2g) {
          const key = p.nama_instansi ?? 'Tidak Diketahui';
          instMap.set(key, (instMap.get(key) ?? 0) + 1);
        }
        const instansiChart = [...instMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, count]) => ({ name: name.length > 32 ? name.slice(0, 30) + '…' : name, count }))
          .reverse();

        // ---- Chart 5: B2B Sektor + Status stacked ----
        const STATUSES = ['baru', 'dihubungi', 'negosiasi', 'deal', 'tidak_sesuai'] as const;
        const sektorMap = new Map<string, Record<string, number>>();
        for (const p of b2b) {
          const key = p.sektor || 'lainnya';
          if (!sektorMap.has(key)) {
            sektorMap.set(key, Object.fromEntries(STATUSES.map((s) => [s, 0])));
          }
          const st = (p.status || 'baru') as string;
          sektorMap.get(key)![st] = (sektorMap.get(key)![st] ?? 0) + 1;
        }
        const sektorChart = [...sektorMap.entries()].map(([sektor, counts]) => ({
          sektor,
          baru:         counts.baru         ?? 0,
          dihubungi:    counts.dihubungi    ?? 0,
          negosiasi:    counts.negosiasi    ?? 0,
          deal:         counts.deal         ?? 0,
          tidak_sesuai: counts.tidak_sesuai ?? 0,
        })) as SektorChart[];

        // ---- Chart 6: Rating distribution ----
        const buckets: Record<string, number> = { '< 3.0': 0, '3.0–3.5': 0, '3.5–4.0': 0, '4.0–4.5': 0, '≥ 4.5': 0 };
        for (const p of b2b) {
          if (p.rating === null) continue;
          const r = Number(p.rating);
          if (r < 3)   buckets['< 3.0']++;
          else if (r < 3.5) buckets['3.0–3.5']++;
          else if (r < 4)   buckets['3.5–4.0']++;
          else if (r < 4.5) buckets['4.0–4.5']++;
          else              buckets['≥ 4.5']++;
        }
        const ratingChart = Object.entries(buckets).map(([range, count]) => ({ range, count }));

        // ---- KPI ----
        const totalPagu = b2g.reduce((s, p) => s + (p.pagu ?? 0), 0);
        const dealCount = b2b.filter((p) => p.status === 'deal').length;
        const ratingsArr = b2b.filter((p) => p.rating !== null).map((p) => Number(p.rating));
        const avgRating  = ratingsArr.length
          ? ratingsArr.reduce((s, r) => s + r, 0) / ratingsArr.length
          : null;

        setData({
          provChart, jenisChart, trendChart, instansiChart, sektorChart, ratingChart,
          kpi: { totalPaket: b2g.length, totalPagu, totalProspek: b2b.length, dealCount, avgRating },
        });
      } catch (err) {
        setError(String(err));
      }
      setLoading(false);
    })();
  }, []);

  return { data, loading, error };
}
