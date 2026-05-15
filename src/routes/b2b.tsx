import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AppShell } from '@/components/layout/AppShell';
import { FilterSidebarB2B } from '@/components/b2b/FilterSidebarB2B';
import { ProspectCard } from '@/components/b2b/ProspectCard';
import { RightPanelB2B } from '@/components/b2b/RightPanelB2B';
import { MapClientWrapper } from '@/components/map/MapClientWrapper';
import { useB2bData, type B2bFilters, type B2bProspect, type SyncParams } from '@/hooks/useB2bData';
import type { ProvinceData, ProspectPin } from '@/components/map/IndonesiaMap';
import { LayoutList, Loader2, Map as MapIcon } from 'lucide-react';

export const Route = createFileRoute('/b2b')({
  head: () => ({
    meta: [
      { title: 'B2B — Prospek Swasta | PengadaanScope' },
      {
        name: 'description',
        content: 'Mode B2B: prospek perusahaan swasta dari Google Places — pest control, hotel, F&B, pabrik, distributor.',
      },
    ],
  }),
  component: B2BPage,
});

const SEKTOR_ORDER = ['pest_control', 'hotel', 'fnb', 'klinik', 'pabrik', 'distributor', 'lainnya'];

const SEKTOR_LABEL: Record<string, string> = {
  pest_control: 'Pest Control',
  hotel:        'Hotel',
  fnb:          'F&B',
  klinik:       'Klinik / RS',
  pabrik:       'Pabrik / Industri',
  distributor:  'Distributor',
  lainnya:      'Lainnya',
};

function B2BPage() {
  const [filters,  setFilters]  = useState<B2bFilters>({});
  const [selected, setSelected] = useState<B2bProspect | null>(null);
  const [view,     setView]     = useState<'list' | 'map'>('list');

  const {
    prospects, total, loading, syncing, error,
    sync, reload,
    updateStatus, toggleBookmark, saveEmailDraft,
  } = useB2bData(filters);

  const handleFilterChange = useCallback((patch: Partial<B2bFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      // Remove undefined keys to keep filtersKey stable
      Object.keys(next).forEach((k) => {
        if ((next as Record<string, unknown>)[k] === undefined)
          delete (next as Record<string, unknown>)[k];
      });
      return next;
    });
    setSelected(null);
  }, []);

  const handleStatusChange = useCallback(async (id: number, status: string) => {
    await updateStatus(id, status);
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }, [updateStatus]);

  const handleBookmark = useCallback(async (id: number, current: boolean) => {
    await toggleBookmark(id, current);
    setSelected((prev) => (prev?.id === id ? { ...prev, is_bookmarked: !current } : prev));
  }, [toggleBookmark]);

  const handleEmailSaved = useCallback((id: number, email: string) => {
    setSelected((prev) => (prev?.id === id ? { ...prev, email_draft: email } : prev));
  }, []);

  // Group prospects by sektor
  const grouped = useMemo(() => {
    const map = new Map<string, B2bProspect[]>();
    for (const p of prospects) {
      const key = p.sektor || 'lainnya';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    // Sort groups by SEKTOR_ORDER
    return SEKTOR_ORDER
      .filter((k) => map.has(k))
      .map((k) => ({ sektor: k, items: map.get(k)! }));
  }, [prospects]);

  // KPI counts
  const kpiCounts = useMemo(() => ({
    total:       total,
    dihubungi:   prospects.filter((p) => p.status === 'dihubungi').length,
    negosiasi:   prospects.filter((p) => p.status === 'negosiasi').length,
    deal:        prospects.filter((p) => p.status === 'deal').length,
    bookmarked:  prospects.filter((p) => p.is_bookmarked).length,
  }), [prospects, total]);

  // Province data for choropleth (aggregate by provinsi)
  const provinceData = useMemo(() => {
    const result: Record<string, ProvinceData> = {};
    for (const p of prospects) {
      if (!p.provinsi) continue;
      result[p.provinsi] ??= { count: 0, value: 0 };
      result[p.provinsi].count++;
    }
    return result;
  }, [prospects]);

  // Prospect pins for individual markers
  const pins = useMemo<ProspectPin[]>(() =>
    prospects
      .filter((p) => p.lat !== null && p.lng !== null)
      .map((p) => ({
        id:     p.id,
        lat:    p.lat!,
        lng:    p.lng!,
        nama:   p.nama,
        sektor: p.sektor,
        status: p.status,
        rating: p.rating,
      })),
    [prospects],
  );

  return (
    <AppShell
      kpis={[
        { label: 'Total Prospek',  value: kpiCounts.total.toLocaleString('id-ID'),      accent: 'teal' },
        { label: 'Dihubungi',      value: kpiCounts.dihubungi.toLocaleString('id-ID'),  accent: 'amber' },
        { label: 'Negosiasi',      value: kpiCounts.negosiasi.toLocaleString('id-ID'),  accent: 'blue' },
        { label: 'Deal',           value: kpiCounts.deal.toLocaleString('id-ID'),       accent: 'green' },
        { label: 'Bookmarked',     value: kpiCounts.bookmarked.toLocaleString('id-ID'), accent: 'red' },
      ]}
    >
      {/* Filter Sidebar */}
      <FilterSidebarB2B
        filters={filters}
        onChange={handleFilterChange}
        onSync={sync}
        syncing={syncing}
        total={total}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* View toggle bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card shrink-0">
          <div className="text-[10px] text-muted-foreground">
            {loading
              ? 'Memuat…'
              : `${total.toLocaleString('id-ID')} prospek · ${grouped.length} sektor`
            }
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] transition-colors ${
                view === 'list'
                  ? 'bg-accent-teal/15 text-accent-teal'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutList className="h-3 w-3" /> List
            </button>
            <button
              onClick={() => setView('map')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] transition-colors ${
                view === 'map'
                  ? 'bg-accent-teal/15 text-accent-teal'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapIcon className="h-3 w-3" /> Peta
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 min-h-0 flex">
          {view === 'map' ? (
            <MapClientWrapper
              data={provinceData}
              mode="b2b"
              prospects={pins}
              onPinSelect={(id) => {
                const p = prospects.find((x) => x.id === id);
                if (p) setSelected(p);
              }}
            />
          ) : (
            <div className="flex-1 overflow-y-auto">
              {loading && (
                <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground text-xs">
                  <Loader2 className="h-4 w-4 animate-spin" /> Memuat prospek…
                </div>
              )}

              {error && (
                <div className="mx-4 mt-4 p-3 rounded-md bg-accent-red/10 border border-accent-red/20 text-xs text-accent-red">
                  {error}
                </div>
              )}

              {!loading && !error && prospects.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-center px-8">
                  <p className="text-sm font-medium text-foreground/60">Belum ada prospek</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Gunakan "Cari Google Places" di sidebar untuk mengambil data bisnis.
                  </p>
                </div>
              )}

              {!loading && grouped.map(({ sektor, items }) => (
                <div key={sektor}>
                  {/* Sektor header */}
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm px-4 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      {SEKTOR_LABEL[sektor] ?? sektor}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {items.length}
                    </span>
                  </div>

                  {/* Cards grid */}
                  <div className="p-3 grid grid-cols-1 gap-2">
                    {items.map((p) => (
                      <ProspectCard
                        key={p.id}
                        prospect={p}
                        selected={selected?.id === p.id}
                        onSelect={(prospect) => setSelected((prev) => prev?.id === prospect.id ? null : prospect)}
                        onBookmark={handleBookmark}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Right Panel */}
          {selected && (
            <RightPanelB2B
              prospect={selected}
              onClose={() => setSelected(null)}
              onBookmark={handleBookmark}
              onStatusChange={handleStatusChange}
              onEmailSaved={handleEmailSaved}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}
