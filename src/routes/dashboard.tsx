import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { MapClientWrapper } from '@/components/map/MapClientWrapper';
import type { ProvinceData } from '@/components/map/IndonesiaMap';

export const Route = createFileRoute('/dashboard')({
  head: () => ({
    meta: [
      { title: 'Dashboard — PengadaanScope' },
      {
        name: 'description',
        content:
          'Dashboard intelijen peluang bisnis nasional: peta interaktif paket pengadaan & prospek swasta.',
      },
    ],
  }),
  component: DashboardPage,
});

// Sample data — akan digantikan data real dari Supabase di TAHAP 3
const MOCK_B2G: Record<string, ProvinceData> = {
  'Jawa Timur': { count: 312, value: 48_500_000_000 },
  'Jawa Barat': { count: 289, value: 41_200_000_000 },
  'Jawa Tengah': { count: 245, value: 35_700_000_000 },
  'Sumatera Utara': { count: 187, value: 27_300_000_000 },
  'Sulawesi Selatan': { count: 143, value: 19_800_000_000 },
  'Kalimantan Timur': { count: 128, value: 22_100_000_000 },
  Aceh: { count: 98, value: 13_400_000_000 },
  'Sumatera Selatan': { count: 87, value: 11_200_000_000 },
  Bali: { count: 76, value: 9_800_000_000 },
  'Nusa Tenggara Timur': { count: 64, value: 7_600_000_000 },
  'Kalimantan Barat': { count: 55, value: 6_900_000_000 },
  Papua: { count: 49, value: 8_200_000_000 },
  'Sulawesi Tengah': { count: 41, value: 5_100_000_000 },
  Lampung: { count: 38, value: 4_700_000_000 },
  Riau: { count: 34, value: 4_200_000_000 },
};

function sumValue(data: Record<string, ProvinceData>): number {
  return Object.values(data).reduce((s, d) => s + d.value, 0);
}

function sumCount(data: Record<string, ProvinceData>): number {
  return Object.values(data).reduce((s, d) => s + d.count, 0);
}

function fmtRupiah(v: number): string {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function DashboardPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const displayData = MOCK_B2G;
  const total = sumCount(displayData);
  const totalVal = sumValue(displayData);
  const hot = Object.values(displayData).filter((d) => d.count >= 100).length;
  const warm = Object.values(displayData).filter(
    (d) => d.count >= 50 && d.count < 100,
  ).length;

  const filteredList = Object.entries(displayData)
    .filter(([name]) => name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b[1].count - a[1].count);

  return (
    <AppShell
      kpis={[
        {
          label: 'Total Paket B2G',
          value: total.toLocaleString('id-ID'),
          hint: 'Semua provinsi · sample',
          accent: 'green',
        },
        {
          label: 'Est. Total Pagu',
          value: fmtRupiah(totalVal),
          hint: 'Potensi pasar',
          accent: 'blue',
        },
        {
          label: 'Prospek Panas',
          value: String(hot),
          hint: '≥ 100 paket',
          accent: 'red',
        },
        {
          label: 'Prospek Hangat',
          value: String(warm),
          hint: '50–99 paket',
          accent: 'amber',
        },
        {
          label: 'Provinsi Aktif',
          value: String(Object.keys(displayData).length),
          hint: 'Dari 34 provinsi',
          accent: 'teal',
        },
      ]}
    >
      {/* Sidebar filter */}
      <aside className="w-[265px] shrink-0 border-r border-border bg-card overflow-y-auto flex flex-col">
        <div className="p-3 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Filter Provinsi
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari provinsi…"
            className="w-full bg-card-2 border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-green"
          />
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredList.map(([name, prov]) => (
            <button
              key={name}
              onClick={() => setSelected(selected === name ? null : name)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                selected === name
                  ? 'bg-accent-green/15 border border-accent-green/30 text-foreground'
                  : 'hover:bg-card-2 text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-xs font-medium truncate">{name}</span>
              <span
                className={`text-[10px] font-mono shrink-0 ml-2 ${
                  selected === name ? 'text-accent-green-light' : 'text-muted-foreground'
                }`}
              >
                {prov.count.toLocaleString('id-ID')}
              </span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="p-3 border-t border-border bg-card-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Provinsi dipilih
            </div>
            <div className="text-sm font-semibold text-foreground">{selected}</div>
            <div className="mt-1 flex gap-3">
              <div>
                <div className="text-[10px] text-muted-foreground">Paket</div>
                <div className="text-xs font-mono text-accent-green-light">
                  {displayData[selected]?.count.toLocaleString('id-ID') ?? '—'}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Nilai</div>
                <div className="text-xs font-mono text-accent-blue">
                  {displayData[selected]
                    ? fmtRupiah(displayData[selected].value)
                    : '—'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="mt-2 text-[10px] text-muted-foreground hover:text-foreground"
            >
              Hapus pilihan ×
            </button>
          </div>
        )}
      </aside>

      {/* Map */}
      <MapClientWrapper
        data={displayData}
        selected={selected}
        onProvSelected={(prov) =>
          setSelected((prev) => (prev === prov ? null : prov))
        }
        mode="b2g"
      />
    </AppShell>
  );
}
