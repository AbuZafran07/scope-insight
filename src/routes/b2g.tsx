import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { FilterSidebar } from '@/components/b2g/FilterSidebar';
import { PackageCard } from '@/components/b2g/PackageCard';
import { RightPanel } from '@/components/b2g/RightPanel';
import { useSirupData, type RupPackage, type SirupFilters } from '@/hooks/useSirupData';
import { ChevronLeft, ChevronRight, Database, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/b2g')({
  head: () => ({
    meta: [
      { title: 'B2G — Pengadaan Pemerintah | PengadaanScope' },
      {
        name: 'description',
        content:
          'Mode B2G: peluang pengadaan pemerintah dari SIRUP LKPP TA 2026 untuk supplier alkes, pest control & lab.',
      },
    ],
  }),
  component: B2GPage,
});

// Daftar 34 provinsi — urutan alfabet
const PROVINSI_LIST = [
  'Aceh','Bali','Bangka-Belitung','Banten','Bengkulu','Gorontalo',
  'Jakarta Raya','Jambi','Jawa Barat','Jawa Tengah','Jawa Timur',
  'Kalimantan Barat','Kalimantan Selatan','Kalimantan Tengah',
  'Kalimantan Timur','Kalimantan Utara','Kepulauan Riau','Lampung',
  'Maluku','Maluku Utara','Nusa Tenggara Barat','Nusa Tenggara Timur',
  'Papua','Papua Barat','Riau','Sulawesi Barat','Sulawesi Selatan',
  'Sulawesi Tengah','Sulawesi Tenggara','Sulawesi Utara',
  'Sumatera Barat','Sumatera Selatan','Sumatera Utara','Yogyakarta',
];

function fmtRupiah(v: number): string {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `Rp ${(v / 1e9).toFixed(1)}M`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function B2GPage() {
  const [filters, setFilters] = useState<SirupFilters>({});
  const [selected, setSelected] = useState<RupPackage | null>(null);

  const { packages, total, totalPages, loading, syncing, error, page, setPage, sync, toggleBookmark } =
    useSirupData(filters);

  const handleFilterChange = useCallback((partial: Partial<SirupFilters>) => {
    setFilters((f) => ({ ...f, ...partial }));
    setSelected(null);
  }, []);

  const handleSync = useCallback(() => {
    sync({ keyword: filters.keyword, provinsi: filters.provinsi });
  }, [filters, sync]);

  // KPI values derived from current page data
  const kpiData = useMemo(() => {
    const totalPagu = packages.reduce((s, p) => s + p.pagu, 0);
    const hot  = packages.filter((p) => (p.ai_score ?? 0) >= 80).length;
    const warm = packages.filter((p) => (p.ai_score ?? 0) >= 60 && (p.ai_score ?? 0) < 80).length;
    const ready = packages.filter((p) => p.status_aktif === 'Aktif').length;
    return { totalPagu, hot, warm, ready };
  }, [packages]);

  const handleScoreUpdate = useCallback((kode_rup: string, score: number, notes: string) => {
    // Reflect AI score change without re-fetching
    if (selected?.kode_rup === kode_rup) {
      setSelected((s) => s ? { ...s, ai_score: score, ai_notes: notes } : null);
    }
  }, [selected]);

  return (
    <AppShell
      kpis={[
        {
          label: 'Total Paket Relevan',
          value: total.toLocaleString('id-ID'),
          hint:  'Sesuai filter aktif',
          accent: 'green',
        },
        {
          label: 'Est. Nilai Pagu',
          value: fmtRupiah(kpiData.totalPagu),
          hint:  'Halaman ini',
          accent: 'blue',
        },
        {
          label: 'Siap Tender',
          value: String(kpiData.ready),
          hint:  'Status Aktif',
          accent: 'amber',
        },
        {
          label: 'Relevansi Tinggi',
          value: String(kpiData.hot),
          hint:  'AI Score ≥ 80',
          accent: 'red',
        },
        {
          label: 'Relevansi Sedang',
          value: String(kpiData.warm),
          hint:  'AI Score 60–79',
          accent: 'teal',
        },
      ]}
    >
      {/* Filter sidebar */}
      <FilterSidebar
        filters={filters}
        onChange={handleFilterChange}
        onSync={handleSync}
        syncing={syncing}
        total={total}
        provinsiList={PROVINSI_LIST}
      />

      {/* Package list */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-r border-border">
        {/* List header */}
        <div className="px-3 py-2 border-b border-border bg-card flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {total > 0
              ? `Menampilkan ${page * 50 + 1}–${Math.min((page + 1) * 50, total)} dari ${total.toLocaleString('id-ID')} paket`
              : 'Belum ada data'}
          </span>
          {syncing && (
            <span className="flex items-center gap-1 text-[10px] text-accent-green-light">
              <Loader2 className="h-3 w-3 animate-spin" />
              Sinkron SIRUP LKPP…
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-3 text-xs text-accent-red border-b border-border">
            {error}
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && packages.length === 0 ? (
            <div className="flex-1 grid place-items-center py-20 text-muted-foreground text-xs">
              <Loader2 className="h-5 w-5 animate-spin mb-2" />
              Memuat…
            </div>
          ) : packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
              <Database className="h-8 w-8 text-muted-foreground/40" />
              <div className="text-sm font-medium text-foreground">Belum ada paket</div>
              <p className="text-xs text-muted-foreground max-w-xs">
                Klik <strong>Sinkron</strong> di sidebar untuk mengambil data terbaru dari SIRUP LKPP TA 2026.
              </p>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="px-4 py-1.5 rounded border border-accent-green/40 bg-accent-green/10 text-accent-green-light text-xs hover:bg-accent-green/20 transition-colors disabled:opacity-50"
              >
                Sinkron Sekarang
              </button>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {packages.map((pkg) => (
                <PackageCard
                  key={pkg.kode_rup}
                  pkg={pkg}
                  selected={selected?.kode_rup === pkg.kode_rup}
                  onSelect={setSelected}
                  onBookmark={toggleBookmark}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-3 py-2 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <span className="text-[10px] text-muted-foreground">
              Hal {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right panel — hanya tampil jika ada paket yang dipilih */}
      {selected && (
        <RightPanel
          pkg={selected}
          onClose={() => setSelected(null)}
          onBookmark={toggleBookmark}
          onScoreUpdate={handleScoreUpdate}
        />
      )}
    </AppShell>
  );
}
