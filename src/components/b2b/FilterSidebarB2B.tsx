import { AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Loader2, Search, SearchIcon } from 'lucide-react';
import { useState } from 'react';
import type { B2bFilters, SyncParams, SyncStatus } from '@/hooks/useB2bData';

interface FilterSidebarB2BProps {
  filters:  B2bFilters;
  onChange: (f: Partial<B2bFilters>) => void;
  onSync:   (p: SyncParams) => void;
  syncing:  boolean;
  total:    number;
  lastSync: SyncStatus;
}

const SEKTOR_OPTIONS = [
  { value: 'pest_control', label: 'Pest Control' },
  { value: 'hotel',        label: 'Hotel' },
  { value: 'fnb',          label: 'F&B' },
  { value: 'klinik',       label: 'Klinik / RS' },
  { value: 'pabrik',       label: 'Pabrik / Industri' },
  { value: 'distributor',  label: 'Distributor' },
  { value: 'lainnya',      label: 'Lainnya' },
];

const STATUS_OPTIONS = [
  { value: 'baru',         label: 'Baru' },
  { value: 'dihubungi',    label: 'Dihubungi' },
  { value: 'negosiasi',    label: 'Negosiasi' },
  { value: 'deal',         label: 'Deal' },
  { value: 'tidak_sesuai', label: 'Tidak Sesuai' },
];

const RATING_PRESETS = [
  { label: 'Semua', min: null },
  { label: '≥ 4.5', min: 4.5 },
  { label: '≥ 4.0', min: 4.0 },
  { label: '≥ 3.5', min: 3.5 },
];

function Section({
  title, children, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {title}
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function FilterSidebarB2B({ filters, onChange, onSync, syncing, total, lastSync }: FilterSidebarB2BProps) {
  const [syncKw,   setSyncKw]   = useState('');
  const [syncKota, setSyncKota] = useState('');
  const [syncSek,  setSyncSek]  = useState('pest_control');
  const [syncMax,  setSyncMax]  = useState(20);
  const [syncOpen, setSyncOpen] = useState(true);

  const handleSync = () => {
    if (!syncKw.trim() || !syncKota.trim()) return;
    onSync({ keyword: syncKw.trim(), kota: syncKota.trim(), sektor: syncSek, maxResults: syncMax });
  };

  const fmtTime = (t: number) =>
    new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <aside className="w-[265px] shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="text-xs font-semibold text-foreground">Filter B2B</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {total.toLocaleString('id-ID')} prospek
        </div>
      </div>

      {/* Sync form */}
      <div className="border-b border-border">
        <button
          onClick={() => setSyncOpen((o) => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-[10px] uppercase tracking-wider text-accent-teal hover:text-accent-teal/80"
        >
          <span className="flex items-center gap-1.5">
            <SearchIcon className="h-3 w-3" />
            Cari Google Places
          </span>
          {syncOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        {syncOpen && (
          <div className="px-3 pb-3 space-y-2">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Keyword</label>
              <input
                value={syncKw}
                onChange={(e) => setSyncKw(e.target.value)}
                placeholder="cth: pest control, hotel"
                className="mt-0.5 w-full bg-card-2 border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-teal"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Kota</label>
              <input
                value={syncKota}
                onChange={(e) => setSyncKota(e.target.value)}
                placeholder="cth: Surabaya"
                className="mt-0.5 w-full bg-card-2 border border-border rounded px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-teal"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Sektor</label>
              <select
                value={syncSek}
                onChange={(e) => setSyncSek(e.target.value)}
                className="mt-0.5 w-full bg-card-2 border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent-teal"
              >
                {SEKTOR_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-wider text-muted-foreground">Max hasil</label>
              <select
                value={syncMax}
                onChange={(e) => setSyncMax(Number(e.target.value))}
                className="mt-0.5 w-full bg-card-2 border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent-teal"
              >
                {[10, 20].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing || !syncKw.trim() || !syncKota.trim()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-accent-teal/40 bg-accent-teal/10 text-accent-teal text-xs font-medium hover:bg-accent-teal/20 transition-colors disabled:opacity-50"
            >
              {syncing
                ? <><Loader2 className="h-3 w-3 animate-spin" /> Mencari…</>
                : <><Search className="h-3 w-3" /> Cari & Simpan</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Keyword search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            value={filters.keyword ?? ''}
            onChange={(e) => onChange({ keyword: e.target.value || undefined })}
            placeholder="Cari nama perusahaan…"
            className="w-full pl-7 pr-3 py-2 bg-card-2 border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-teal"
          />
        </div>
      </div>

      {/* Sektor */}
      <Section title="Sektor">
        <div className="space-y-1">
          <button
            onClick={() => onChange({ sektor: undefined })}
            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
              !filters.sektor ? 'bg-accent-teal/15 text-accent-teal' : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
            }`}
          >
            Semua Sektor
          </button>
          {SEKTOR_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange({ sektor: filters.sektor === s.value ? undefined : s.value })}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                filters.sektor === s.value
                  ? 'bg-accent-teal/15 text-accent-teal'
                  : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Status */}
      <Section title="Status Prospek">
        <div className="space-y-1">
          <button
            onClick={() => onChange({ status: undefined })}
            className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
              !filters.status ? 'bg-accent-teal/15 text-accent-teal' : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
            }`}
          >
            Semua Status
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() => onChange({ status: filters.status === s.value ? undefined : s.value })}
              className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                filters.status === s.value
                  ? 'bg-accent-teal/15 text-accent-teal'
                  : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      {/* Kota */}
      <Section title="Kota" defaultOpen={false}>
        <input
          value={filters.kota ?? ''}
          onChange={(e) => onChange({ kota: e.target.value || undefined })}
          placeholder="Cari kota…"
          className="w-full bg-card-2 border border-border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-teal"
        />
      </Section>

      {/* Rating */}
      <Section title="Min Rating" defaultOpen={false}>
        <div className="space-y-1">
          {RATING_PRESETS.map((r) => {
            const active = (filters.ratingMin ?? null) === r.min;
            return (
              <button
                key={r.label}
                onClick={() => onChange({ ratingMin: r.min ?? undefined })}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  active
                    ? 'bg-accent-teal/15 text-accent-teal'
                    : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Bookmark */}
      <Section title="Lainnya" defaultOpen={false}>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.bookmarked ?? false}
            onChange={(e) => onChange({ bookmarked: e.target.checked || undefined })}
            className="accent-accent-teal h-3 w-3"
          />
          <span className="text-xs text-muted-foreground group-hover:text-foreground">
            Hanya Bookmarked
          </span>
        </label>
      </Section>

      <div className="flex-1" />

      {/* Reset */}
      {Object.keys(filters).length > 0 && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => onChange({
              keyword:   undefined, sektor:    undefined, kota:      undefined,
              status:    undefined, ratingMin: undefined, bookmarked: undefined,
            })}
            className="w-full text-[10px] text-muted-foreground hover:text-foreground py-1"
          >
            Reset semua filter
          </button>
        </div>
      )}
    </aside>
  );
}
