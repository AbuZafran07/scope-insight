import { Bookmark, BookmarkCheck, Calendar, MapPin } from 'lucide-react';
import type { RupPackage } from '@/hooks/useSirupData';

interface PackageCardProps {
  pkg:      RupPackage;
  selected: boolean;
  onSelect: (pkg: RupPackage) => void;
  onBookmark: (kode_rup: string, current: boolean) => void;
}

function fmtRupiah(v: number): string {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9)  return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6)  return `Rp ${(v / 1e6).toFixed(0)}Jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function urgency(pkg: RupPackage): 'hot' | 'warm' | 'normal' | 'none' {
  if (!pkg.tanggal_pemilihan_selesai) return 'none';
  const days = Math.ceil(
    (new Date(pkg.tanggal_pemilihan_selesai).getTime() - Date.now()) / 86_400_000,
  );
  if (days <= 0)  return 'none';
  if (days <= 14) return 'hot';
  if (days <= 30) return 'warm';
  return 'normal';
}

const urgencyBorder: Record<string, string> = {
  hot:    'border-l-accent-red',
  warm:   'border-l-accent-amber',
  normal: 'border-l-accent-green',
  none:   'border-l-border',
};

const urgencyDot: Record<string, string> = {
  hot:    'bg-accent-red',
  warm:   'bg-accent-amber',
  normal: 'bg-accent-green',
  none:   'bg-muted',
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return null;
  const color =
    score >= 80 ? 'text-accent-green-light' :
    score >= 60 ? 'text-accent-amber' :
    score >= 40 ? 'text-muted-foreground' :
                  'text-accent-red/70';
  return (
    <span className={`text-[10px] font-mono font-semibold ${color}`}>
      AI {score}
    </span>
  );
}

function MetodeBadge({ metode }: { metode: string | null }) {
  if (!metode) return null;
  const short =
    metode.includes('Tender')           ? 'Tender' :
    metode.includes('Langsung')         ? 'PL' :
    metode.includes('Seleksi')          ? 'Seleksi' :
    metode.includes('e-Purchasing')     ? 'e-Purch' :
    metode.slice(0, 8);
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded bg-card-2 border border-border text-muted-foreground">
      {short}
    </span>
  );
}

export function PackageCard({ pkg, selected, onSelect, onBookmark }: PackageCardProps) {
  const u = urgency(pkg);

  return (
    <button
      onClick={() => onSelect(pkg)}
      className={`w-full text-left group border-l-4 ${urgencyBorder[u]} rounded-r-md px-3 py-2.5 transition-colors
        ${selected
          ? 'bg-accent-green/10 border-r border-t border-b border-accent-green/20'
          : 'hover:bg-card-2 border-r border-t border-b border-transparent hover:border-border'
        }`}
    >
      <div className="flex items-start justify-between gap-2">
        {/* Title */}
        <p className={`text-xs font-medium leading-snug line-clamp-2 ${selected ? 'text-foreground' : 'text-foreground/90'}`}>
          {pkg.nama_paket}
        </p>

        {/* Bookmark */}
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(pkg.kode_rup, pkg.is_bookmarked); }}
          className="shrink-0 mt-0.5 text-muted-foreground hover:text-accent-amber transition-colors"
        >
          {pkg.is_bookmarked
            ? <BookmarkCheck className="h-3.5 w-3.5 text-accent-amber" />
            : <Bookmark className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      {/* Sub-info row */}
      <div className="mt-1.5 flex items-center flex-wrap gap-x-3 gap-y-1">
        <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">
          {pkg.nama_satker ?? pkg.nama_instansi ?? '—'}
        </span>
        <span className={`text-[10px] font-mono font-semibold text-accent-blue`}>
          {fmtRupiah(pkg.pagu ?? 0)}
        </span>
      </div>

      {/* Tags row */}
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${urgencyDot[u]}`} />
        {pkg.nama_provinsi && (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5" />
            {pkg.nama_provinsi}
          </span>
        )}
        {pkg.tanggal_pemilihan_selesai && (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Calendar className="h-2.5 w-2.5" />
            {new Date(pkg.tanggal_pemilihan_selesai).toLocaleDateString('id-ID', {
              day: '2-digit', month: 'short',
            })}
          </span>
        )}
        <MetodeBadge metode={pkg.metode_pengadaan} />
        <ScoreBadge score={pkg.ai_score} />
      </div>
    </button>
  );
}
