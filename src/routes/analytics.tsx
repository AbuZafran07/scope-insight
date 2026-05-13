import { createFileRoute } from '@tanstack/react-router';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { AppShell } from '@/components/layout/AppShell';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { Loader2, TrendingUp } from 'lucide-react';

export const Route = createFileRoute('/analytics')({
  head: () => ({
    meta: [
      { title: 'Analytics — PengadaanScope' },
      { name: 'description', content: 'Grafik & ringkasan nasional pengadaan pemerintah & prospek swasta.' },
    ],
  }),
  component: AnalyticsPage,
});

// ── Design tokens ────────────────────────────────────────────────
const C = {
  blue:   '#388bfd',
  green:  '#3fb950',
  amber:  '#d29922',
  red:    '#da3633',
  teal:   '#1d9e75',
  purple: '#a78bfa',
  gray:   '#7d8590',
  bg:     '#161d28',
  border: 'rgba(255,255,255,0.12)',
};

const PIE_COLORS = [C.blue, C.green, C.amber, C.teal, C.purple, C.red];

const TOOLTIP_STYLE = {
  contentStyle: { background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6, fontSize: 11, color: '#e6edf3' },
  itemStyle: { color: '#e6edf3' },
  cursor: { fill: 'rgba(255,255,255,0.04)' },
};

const TICK_STYLE = { fill: C.gray, fontSize: 10 };
const GRID_STYLE = { stroke: 'rgba(255,255,255,0.06)' };

const SEKTOR_LABEL: Record<string, string> = {
  pest_control: 'Pest Ctrl', hotel: 'Hotel', fnb: 'F&B',
  klinik: 'Klinik', pabrik: 'Pabrik', distributor: 'Distrib.', lainnya: 'Lainnya',
};

function fmtRupiah(v: number): string {
  if (v >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6)  return `${(v / 1e6).toFixed(0)}Jt`;
  return v.toLocaleString('id-ID');
}

// ── Chart card wrapper ────────────────────────────────────────────
function Card({
  title, subtitle, children, className = '',
}: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-lg p-4 flex flex-col ${className}`}>
      <div className="mb-3">
        <div className="text-xs font-semibold text-foreground">{title}</div>
        {subtitle && <div className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</div>}
      </div>
      {children}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────
function AnalyticsPage() {
  const { data, loading, error } = useAnalyticsData();

  if (loading) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat data analytics…
        </div>
      </AppShell>
    );
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-accent-red text-sm">{error ?? 'Gagal memuat data.'}</p>
        </div>
      </AppShell>
    );
  }

  const { kpi } = data;

  return (
    <AppShell
      kpis={[
        { label: 'Total Paket B2G',   value: kpi.totalPaket.toLocaleString('id-ID'),   accent: 'green' },
        { label: 'Est. Total Pagu',   value: `Rp ${fmtRupiah(kpi.totalPagu)}`,          accent: 'blue' },
        { label: 'Total Prospek B2B', value: kpi.totalProspek.toLocaleString('id-ID'),  accent: 'teal' },
        { label: 'Deal B2B',          value: kpi.dealCount.toLocaleString('id-ID'),      accent: 'amber' },
        {
          label: 'Avg Rating B2B',
          value: kpi.avgRating !== null ? kpi.avgRating.toFixed(2) : '—',
          accent: 'red',
        },
      ]}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {/* Empty state */}
        {kpi.totalPaket === 0 && kpi.totalProspek === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground/60">Belum ada data untuk dianalisis</p>
            <p className="text-xs text-muted-foreground mt-1">
              Sync paket B2G dari SIRUP LKPP dan/atau tambah prospek B2B terlebih dahulu.
            </p>
          </div>
        )}

        {(kpi.totalPaket > 0 || kpi.totalProspek > 0) && (
          <div className="grid grid-cols-2 gap-4">

            {/* ── Chart 1: Top 10 Provinsi ─────────────────────── */}
            <Card title="Top 10 Provinsi by Total Pagu" subtitle="B2G · Rupiah">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.provChart} layout="vertical" margin={{ left: 8, right: 32 }}>
                    <CartesianGrid horizontal={false} {...GRID_STYLE} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => fmtRupiah(v)}
                      tick={TICK_STYLE}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      tick={{ ...TICK_STYLE, fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number) => [`Rp ${fmtRupiah(v)}`, 'Total Pagu']}
                    />
                    <Bar dataKey="pagu" fill={C.blue} radius={[0, 3, 3, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* ── Chart 2: Jenis Pengadaan ─────────────────────── */}
            <Card title="Distribusi Jenis Pengadaan" subtitle="B2G · Jumlah paket">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.jenisChart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      outerRadius={100}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''
                      }
                      labelLine={false}
                    >
                      {data.jenisChart.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number) => [v.toLocaleString('id-ID'), 'Paket']}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 10, color: C.gray }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* ── Chart 3: Tren Bulanan (full width) ───────────── */}
            <Card title="Tren Paket Pengadaan per Bulan" subtitle="B2G · Jumlah paket berdasarkan tanggal mulai pemilihan" className="col-span-2">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.trendChart} margin={{ left: -8, right: 8 }}>
                    <defs>
                      <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.green} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis dataKey="month" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number) => [v.toLocaleString('id-ID'), 'Paket']}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke={C.green}
                      strokeWidth={2}
                      fill="url(#gradGreen)"
                      dot={false}
                      activeDot={{ r: 4, fill: C.green }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* ── Chart 4: Top 10 Instansi ─────────────────────── */}
            <Card title="Top 10 Instansi" subtitle="B2G · Jumlah paket">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.instansiChart} layout="vertical" margin={{ left: 8, right: 32 }}>
                    <CartesianGrid horizontal={false} {...GRID_STYLE} />
                    <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={140}
                      tick={{ ...TICK_STYLE, fontSize: 9 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number) => [v.toLocaleString('id-ID'), 'Paket']}
                    />
                    <Bar dataKey="count" fill={C.amber} radius={[0, 3, 3, 0]} maxBarSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* ── Chart 5: B2B Sektor + Status ─────────────────── */}
            <Card title="Prospek B2B per Sektor & Status" subtitle="B2B · Stacked by status">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.sektorChart.map((d) => ({ ...d, sektor: SEKTOR_LABEL[d.sektor] ?? d.sektor }))}
                    margin={{ left: -8, right: 8 }}
                  >
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis dataKey="sektor" tick={{ ...TICK_STYLE, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number, name: string) => [v, name.replace('_', ' ')]}
                    />
                    <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 9, color: C.gray }} />
                    <Bar dataKey="baru"         stackId="a" fill={C.blue}   maxBarSize={36} name="Baru" />
                    <Bar dataKey="dihubungi"    stackId="a" fill={C.amber}  maxBarSize={36} name="Dihubungi" />
                    <Bar dataKey="negosiasi"    stackId="a" fill={C.purple} maxBarSize={36} name="Negosiasi" />
                    <Bar dataKey="deal"         stackId="a" fill={C.green}  maxBarSize={36} name="Deal" />
                    <Bar dataKey="tidak_sesuai" stackId="a" fill={C.gray}   maxBarSize={36} name="Tdk Sesuai" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* ── Chart 6: Rating Distribution (full width) ────── */}
            <Card title="Distribusi Rating Prospek B2B" subtitle="B2B · Jumlah prospek per rentang rating Google" className="col-span-2">
              <div className="h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ratingChart} margin={{ left: -8, right: 8 }}>
                    <CartesianGrid {...GRID_STYLE} />
                    <XAxis dataKey="range" tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} />
                    <Tooltip
                      {...TOOLTIP_STYLE}
                      formatter={(v: number) => [v.toLocaleString('id-ID'), 'Prospek']}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={60}>
                      {data.ratingChart.map((entry, i) => {
                        const pct = i / (data.ratingChart.length - 1);
                        const fillColor = pct < 0.4 ? C.red : pct < 0.6 ? C.amber : C.green;
                        return <Cell key={i} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        )}
      </div>
    </AppShell>
  );
}
