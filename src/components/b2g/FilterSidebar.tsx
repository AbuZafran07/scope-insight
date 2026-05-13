import { ChevronDown, ChevronRight, RefreshCw, Search } from 'lucide-react';
import { useState } from 'react';
import type { SirupFilters } from '@/hooks/useSirupData';

interface FilterSidebarProps {
  filters:     SirupFilters;
  onChange:    (f: Partial<SirupFilters>) => void;
  onSync:      () => void;
  syncing:     boolean;
  total:       number;
  provinsiList: string[];
}

const JENIS_OPTIONS = ['Barang', 'Jasa Lainnya', 'Jasa Konsultansi', 'Konstruksi'];
const STATUS_OPTIONS = ['Aktif', 'Selesai', 'Draf'];

const PAGU_PRESETS = [
  { label: 'Semua',       min: null, max: null },
  { label: '< 50Jt',      min: null, max: 50_000_000 },
  { label: '50Jt–500Jt',  min: 50_000_000, max: 500_000_000 },
  { label: '500Jt–5M',    min: 500_000_000, max: 5_000_000_000 },
  { label: '> 5M',        min: 5_000_000_000, max: null },
];

const AI_PRESETS = [
  { label: 'Semua',  min: null },
  { label: '≥ 80',   min: 80 },
  { label: '≥ 65',   min: 65 },
  { label: '≥ 40',   min: 40 },
];

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {title}
        {open
          ? <ChevronDown className="h-3 w-3" />
          : <ChevronRight className="h-3 w-3" />
        }
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function FilterSidebar({
  filters, onChange, onSync, syncing, total, provinsiList,
}: FilterSidebarProps) {
  return (
    <aside className="w-[265px] shrink-0 border-r border-border bg-card flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-foreground">Filter B2G</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {total.toLocaleString('id-ID')} paket
          </div>
        </div>
        <button
          onClick={onSync}
          disabled={syncing}
          title="Sinkron dari SIRUP LKPP"
          className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded border border-border bg-card-2 text-muted-foreground hover:text-foreground hover:border-accent-green transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${syncing ? 'animate-spin' : ''}`} />
          Sinkron
        </button>
      </div>

      {/* Keyword search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <input
            value={filters.keyword ?? ''}
            onChange={(e) => onChange({ keyword: e.target.value || undefined })}
            placeholder="Cari nama paket…"
            className="w-full pl-7 pr-3 py-2 bg-card-2 border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-green"
          />
        </div>
      </div>

      {/* Provinsi */}
      <Section title="Provinsi">
        <select
          value={filters.provinsi ?? ''}
          onChange={(e) => onChange({ provinsi: e.target.value || undefined })}
          className="w-full bg-card-2 border border-border rounded-md px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-accent-green"
        >
          <option value="">Semua Provinsi</option>
          {provinsiList.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </Section>

      {/* Jenis Pengadaan */}
      <Section title="Jenis Pengadaan">
        <div className="space-y-1.5">
          {JENIS_OPTIONS.map((j) => {
            const checked = filters.jenis?.includes(j) ?? false;
            return (
              <label key={j} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const cur = filters.jenis ?? [];
                    onChange({ jenis: checked ? cur.filter((x) => x !== j) : [...cur, j] });
                  }}
                  className="accent-accent-green h-3 w-3"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground">{j}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Status */}
      <Section title="Status Aktif" defaultOpen={false}>
        <div className="space-y-1.5">
          {STATUS_OPTIONS.map((s) => {
            const checked = filters.status?.includes(s) ?? false;
            return (
              <label key={s} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const cur = filters.status ?? [];
                    onChange({ status: checked ? cur.filter((x) => x !== s) : [...cur, s] });
                  }}
                  className="accent-accent-green h-3 w-3"
                />
                <span className="text-xs text-muted-foreground group-hover:text-foreground">{s}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Nilai Pagu */}
      <Section title="Nilai Pagu" defaultOpen={false}>
        <div className="space-y-1">
          {PAGU_PRESETS.map((p) => {
            const active =
              (filters.paguMin ?? null) === p.min &&
              (filters.paguMax ?? null) === p.max;
            return (
              <button
                key={p.label}
                onClick={() => onChange({ paguMin: p.min ?? undefined, paguMax: p.max ?? undefined })}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  active
                    ? 'bg-accent-green/15 text-accent-green-light'
                    : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* AI Score */}
      <Section title="Relevansi AI" defaultOpen={false}>
        <div className="space-y-1">
          {AI_PRESETS.map((p) => {
            const active = (filters.aiScoreMin ?? null) === p.min;
            return (
              <button
                key={p.label}
                onClick={() => onChange({ aiScoreMin: p.min ?? undefined })}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                  active
                    ? 'bg-accent-green/15 text-accent-green-light'
                    : 'text-muted-foreground hover:bg-card-2 hover:text-foreground'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Instansi */}
      <Section title="Instansi" defaultOpen={false}>
        <input
          value={filters.instansi ?? ''}
          onChange={(e) => onChange({ instansi: e.target.value || undefined })}
          placeholder="Cari instansi…"
          className="w-full bg-card-2 border border-border rounded-md px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-green"
        />
      </Section>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset */}
      {Object.keys(filters).length > 0 && (
        <div className="p-3 border-t border-border">
          <button
            onClick={() => onChange({ keyword: undefined, provinsi: undefined, jenis: undefined, status: undefined, instansi: undefined, paguMin: undefined, paguMax: undefined, aiScoreMin: undefined })}
            className="w-full text-[10px] text-muted-foreground hover:text-foreground py-1"
          >
            Reset semua filter
          </button>
        </div>
      )}
    </aside>
  );
}
