import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { AppShell } from '@/components/layout/AppShell';
import { RightPanelB2B } from '@/components/b2b/RightPanelB2B';
import { STATUS_CONFIG, SEKTOR_CONFIG } from '@/components/b2b/ProspectCard';
import { useWatchlist, type WatchlistB2G, type WatchlistB2B } from '@/hooks/useWatchlist';
import {
  Bookmark, BookmarkX, Calendar, ChevronRight, Download,
  ExternalLink, Globe, Loader2, MapPin, Phone, Search, Star, X,
} from 'lucide-react';

export const Route = createFileRoute('/watchlist')({
  head: () => ({
    meta: [
      { title: 'Watchlist — PengadaanScope' },
      { name: 'description', content: 'Daftar paket B2G & prospek B2B yang di-bookmark.' },
    ],
  }),
  component: WatchlistPage,
});

type Tab = 'b2g' | 'b2b';

function fmtRupiah(v: number | null): string {
  if (!v) return '—';
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6)  return `Rp ${(v / 1e6).toFixed(0)}Jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function fmtDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── B2G Detail Panel ──────────────────────────────────────────────
function B2GDetailPanel({
  pkg, onClose, onUnbookmark,
}: {
  pkg: WatchlistB2G;
  onClose: () => void;
  onUnbookmark: (kode_rup: string) => void;
}) {
  return (
    <aside className="w-[320px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
          <ChevronRight className="h-3 w-3" /> Detail Paket
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUnbookmark(pkg.kode_rup)}
            title="Hapus bookmark"
            className="text-accent-amber hover:text-muted-foreground transition-colors"
          >
            <BookmarkX className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground leading-snug">{pkg.nama_paket}</p>
          <p className="mt-1 text-lg font-mono font-bold text-accent-blue">{fmtRupiah(pkg.pagu)}</p>
        </div>

        <div className="space-y-2.5">
          {[
            { label: 'Kode RUP',  value: <span className="font-mono text-[11px]">{pkg.kode_rup}</span> },
            { label: 'Instansi',  value: pkg.nama_instansi ?? '—' },
            { label: 'Jenis',     value: pkg.jenis_pengadaan ?? '—' },
            { label: 'Metode',    value: pkg.metode_pengadaan ?? '—' },
            { label: 'Provinsi',  value: pkg.nama_provinsi ? (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {pkg.nama_provinsi}
              </span>
            ) : '—' },
            { label: 'Status',    value: (
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                pkg.status_aktif === 'Aktif' ? 'bg-accent-green/10 text-accent-green-light' : 'bg-muted text-muted-foreground'
              }`}>{pkg.status_aktif ?? '—'}</span>
            ) },
            { label: 'Tahun',     value: String(pkg.tahun_anggaran) },
            { label: 'Mulai',     value: (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {fmtDate(pkg.tanggal_pemilihan_mulai)}
              </span>
            ) },
            { label: 'Selesai',   value: (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {fmtDate(pkg.tanggal_pemilihan_selesai)}
              </span>
            ) },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-20 shrink-0 pt-0.5">{label}</span>
              <span className="text-xs text-foreground leading-relaxed">{value}</span>
            </div>
          ))}
        </div>

        {pkg.ai_score !== null && (
          <div className="p-3 rounded-md bg-card-2 border border-border">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Relevansi AI</div>
            <div className="flex items-center gap-2">
              <span className={`text-xl font-mono font-bold ${
                pkg.ai_score >= 80 ? 'text-accent-green-light' :
                pkg.ai_score >= 60 ? 'text-accent-amber' : 'text-muted-foreground'
              }`}>{pkg.ai_score}</span>
              <span className="text-xs text-muted-foreground">{pkg.ai_reasoning ?? ''}</span>
            </div>
          </div>
        )}

        <a
          href={`https://sirup.lkpp.go.id/sirup/informasipaket/detailPaketPenyedia/${pkg.kode_rup}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          Lihat di SIRUP LKPP
        </a>
      </div>
    </aside>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
function WatchlistPage() {
  const { b2gItems, b2bItems, loading, error, unbookmarkB2G, unbookmarkB2B } = useWatchlist();
  const [tab,         setTab]        = useState<Tab>('b2g');
  const [search,      setSearch]     = useState('');
  const [selB2G,      setSelB2G]     = useState<WatchlistB2G | null>(null);
  const [selB2B,      setSelB2B]     = useState<WatchlistB2B | null>(null);

  // Filtered lists
  const filteredB2G = useMemo(() =>
    b2gItems.filter((p) =>
      !search || p.nama_paket.toLowerCase().includes(search.toLowerCase()) ||
      (p.nama_instansi ?? '').toLowerCase().includes(search.toLowerCase()),
    ), [b2gItems, search]);

  const filteredB2B = useMemo(() =>
    b2bItems.filter((p) =>
      !search || p.nama.toLowerCase().includes(search.toLowerCase()) ||
      (p.kota ?? '').toLowerCase().includes(search.toLowerCase()),
    ), [b2bItems, search]);

  // Export B2G to Excel
  const exportB2G = () => {
    const rows = filteredB2G.map((p) => ({
      'Kode RUP':       p.kode_rup,
      'Nama Paket':     p.nama_paket,
      'Instansi':       p.nama_instansi ?? '',
      'Pagu (Rp)':      p.pagu ?? 0,
      'Jenis':          p.jenis_pengadaan ?? '',
      'Metode':         p.metode_pengadaan ?? '',
      'Provinsi':       p.nama_provinsi ?? '',
      'Status':         p.status_aktif ?? '',
      'AI Score':       p.ai_score ?? '',
      'Tahun Anggaran': p.tahun_anggaran,
      'Mulai Pemilihan': p.tanggal_pemilihan_mulai ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'B2G Watchlist');
    XLSX.writeFile(wb, 'watchlist_b2g.xlsx');
  };

  // Export B2B to Excel
  const exportB2B = () => {
    const rows = filteredB2B.map((p) => ({
      'Nama Perusahaan': p.nama,
      'Sektor':          p.sektor,
      'Kota':            p.kota ?? '',
      'Provinsi':        p.provinsi ?? '',
      'Telepon':         p.telepon ?? '',
      'Website':         p.website ?? '',
      'Rating':          p.rating ?? '',
      'Ulasan':          p.total_reviews,
      'Status Prospek':  p.status,
      'Catatan':         p.catatan ?? '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'B2B Watchlist');
    XLSX.writeFile(wb, 'watchlist_b2b.xlsx');
  };

  const handleUnbookmarkB2G = useCallback(async (kode_rup: string) => {
    await unbookmarkB2G(kode_rup);
    setSelB2G(null);
  }, [unbookmarkB2G]);

  const handleUnbookmarkB2B = useCallback(async (id: number) => {
    await unbookmarkB2B(id);
    setSelB2B(null);
  }, [unbookmarkB2B]);

  const selectedPanel = tab === 'b2g' ? selB2G : selB2B;

  return (
    <AppShell
      kpis={[
        { label: 'B2G Bookmarked', value: b2gItems.length.toLocaleString('id-ID'), accent: 'green' },
        { label: 'B2B Bookmarked', value: b2bItems.length.toLocaleString('id-ID'), accent: 'teal' },
        { label: 'Total Watchlist', value: (b2gItems.length + b2bItems.length).toLocaleString('id-ID'), accent: 'blue' },
        { label: 'Deal B2B', value: b2bItems.filter((p) => p.status === 'deal').length.toString(), accent: 'amber' },
        { label: 'Dihubungi B2B', value: b2bItems.filter((p) => p.status === 'dihubungi').length.toString(), accent: 'red' },
      ]}
    >
      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0">
          {/* Tabs */}
          <div className="flex rounded-md border border-border overflow-hidden">
            {(['b2g', 'b2b'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setSearch(''); setSelB2G(null); setSelB2B(null); }}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  tab === t
                    ? 'bg-accent-green/15 text-accent-green-light'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'b2g' ? `B2G (${b2gItems.length})` : `B2B (${b2bItems.length})`}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tab === 'b2g' ? 'Cari paket atau instansi…' : 'Cari nama atau kota…'}
              className="w-full pl-7 pr-3 py-1.5 bg-card-2 border border-border rounded text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-green"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {tab === 'b2g' ? filteredB2G.length : filteredB2B.length} item
            </span>
            <button
              onClick={tab === 'b2g' ? exportB2G : exportB2B}
              disabled={tab === 'b2g' ? filteredB2G.length === 0 : filteredB2B.length === 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-border bg-card-2 text-[10px] text-muted-foreground hover:text-foreground hover:border-accent-green transition-colors disabled:opacity-40"
            >
              <Download className="h-3 w-3" /> Export Excel
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 flex">
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center h-32 gap-2 text-muted-foreground text-xs">
                <Loader2 className="h-4 w-4 animate-spin" /> Memuat watchlist…
              </div>
            )}
            {error && (
              <div className="mx-4 mt-4 p-3 rounded bg-accent-red/10 border border-accent-red/20 text-xs text-accent-red">
                {error}
              </div>
            )}

            {/* B2G Table */}
            {!loading && tab === 'b2g' && (
              filteredB2G.length === 0 ? (
                <Empty text="Belum ada paket B2G yang di-bookmark." />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border sticky top-0 bg-card z-10">
                      {['Nama Paket', 'Instansi', 'Pagu', 'AI', 'Provinsi', 'Status', ''].map((h) => (
                        <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2.5 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredB2G.map((p) => (
                      <tr
                        key={p.kode_rup}
                        onClick={() => setSelB2G((prev) => prev?.kode_rup === p.kode_rup ? null : p)}
                        className={`border-b border-border/50 cursor-pointer transition-colors ${
                          selB2G?.kode_rup === p.kode_rup
                            ? 'bg-accent-green/10'
                            : 'hover:bg-card-2'
                        }`}
                      >
                        <td className="px-4 py-2.5 max-w-[260px]">
                          <div className="flex items-center gap-1.5">
                            <Bookmark className="h-3 w-3 shrink-0 text-accent-amber" />
                            <span className="truncate font-medium text-foreground/90">{p.nama_paket}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground max-w-[180px] truncate">
                          {p.nama_instansi ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-accent-blue whitespace-nowrap">
                          {fmtRupiah(p.pagu)}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          {p.ai_score !== null ? (
                            <span className={`font-mono text-[11px] ${
                              p.ai_score >= 80 ? 'text-accent-green-light' :
                              p.ai_score >= 60 ? 'text-accent-amber' : 'text-muted-foreground'
                            }`}>{p.ai_score}</span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                          {p.nama_provinsi ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            p.status_aktif === 'Aktif'
                              ? 'bg-accent-green/10 text-accent-green-light'
                              : 'bg-muted text-muted-foreground'
                          }`}>{p.status_aktif ?? '—'}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleUnbookmarkB2G(p.kode_rup); }}
                            title="Hapus bookmark"
                            className="text-muted-foreground hover:text-accent-red transition-colors"
                          >
                            <BookmarkX className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}

            {/* B2B Table */}
            {!loading && tab === 'b2b' && (
              filteredB2B.length === 0 ? (
                <Empty text="Belum ada prospek B2B yang di-bookmark." />
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border sticky top-0 bg-card z-10">
                      {['Nama Perusahaan', 'Sektor', 'Kota', 'Rating', 'Status', 'Kontak', ''].map((h) => (
                        <th key={h} className="text-left text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-2.5 font-medium whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredB2B.map((p) => {
                      const sektor = SEKTOR_CONFIG[p.sektor] ?? SEKTOR_CONFIG.lainnya;
                      const status = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.baru;
                      return (
                        <tr
                          key={p.id}
                          onClick={() => setSelB2B((prev) => prev?.id === p.id ? null : p)}
                          className={`border-b border-border/50 cursor-pointer transition-colors ${
                            selB2B?.id === p.id ? 'bg-accent-teal/10' : 'hover:bg-card-2'
                          }`}
                        >
                          <td className="px-4 py-2.5 max-w-[220px]">
                            <div className="flex items-center gap-1.5">
                              <Bookmark className="h-3 w-3 shrink-0 text-accent-amber" />
                              <span className="truncate font-medium text-foreground/90">{p.nama}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${sektor.bg} ${sektor.text}`}>
                              {sektor.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
                            {p.kota ?? '—'}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            {p.rating !== null ? (
                              <span className="flex items-center gap-1 text-accent-amber">
                                <Star className="h-3 w-3 fill-current" />
                                <span className="font-mono text-[11px]">{Number(p.rating).toFixed(1)}</span>
                              </span>
                            ) : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 whitespace-nowrap">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${status.bg} ${status.text}`}>
                              {status.label}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {p.telepon && <Phone className="h-3 w-3" />}
                              {p.website && <Globe className="h-3 w-3" />}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnbookmarkB2B(p.id); }}
                              title="Hapus bookmark"
                              className="text-muted-foreground hover:text-accent-red transition-colors"
                            >
                              <BookmarkX className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>

          {/* Detail panels */}
          {tab === 'b2g' && selB2G && (
            <B2GDetailPanel
              pkg={selB2G}
              onClose={() => setSelB2G(null)}
              onUnbookmark={handleUnbookmarkB2G}
            />
          )}
          {tab === 'b2b' && selB2B && (
            <RightPanelB2B
              prospect={selB2B}
              onClose={() => setSelB2B(null)}
              onBookmark={(id, current) => {
                if (!current) { handleUnbookmarkB2B(id); }
              }}
              onStatusChange={async (id, status) => {
                const { supabase: sb } = await import('@/integrations/supabase/client');
                await sb.from('b2b_prospects').update({ status }).eq('id', id);
                setSelB2B((prev) => prev?.id === id ? { ...prev, status } : prev);
              }}
              onEmailSaved={(id, email) => {
                setSelB2B((prev) => prev?.id === id ? { ...prev, email_draft: email } : prev);
              }}
            />
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-center px-8">
      <Bookmark className="h-8 w-8 text-muted-foreground/30 mb-3" />
      <p className="text-sm font-medium text-foreground/60">{text}</p>
      <p className="text-xs text-muted-foreground mt-1">Tekan ikon bookmark pada paket atau prospek untuk menambahkan.</p>
    </div>
  );
}
