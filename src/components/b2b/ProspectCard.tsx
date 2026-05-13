import { Bookmark, BookmarkCheck, Globe, MapPin, Phone, Star } from 'lucide-react';
import type { B2bProspect } from '@/hooks/useB2bData';

interface ProspectCardProps {
  prospect:    B2bProspect;
  selected:    boolean;
  onSelect:    (p: B2bProspect) => void;
  onBookmark:  (id: number, current: boolean) => void;
}

export const SEKTOR_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pest_control: { label: 'Pest Control', bg: 'bg-accent-amber/15',       text: 'text-accent-amber' },
  hotel:        { label: 'Hotel',        bg: 'bg-accent-blue/15',        text: 'text-accent-blue' },
  fnb:          { label: 'F&B',          bg: 'bg-accent-green/15',       text: 'text-accent-green-light' },
  klinik:       { label: 'Klinik',       bg: 'bg-accent-red/15',         text: 'text-accent-red' },
  pabrik:       { label: 'Pabrik',       bg: 'bg-card-2 border border-border', text: 'text-muted-foreground' },
  distributor:  { label: 'Distributor',  bg: 'bg-accent-teal/15',        text: 'text-accent-teal' },
  lainnya:      { label: 'Lainnya',      bg: 'bg-card-2 border border-border', text: 'text-muted-foreground' },
};

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  baru:         { label: 'Baru',         bg: 'bg-accent-blue/15',   text: 'text-accent-blue' },
  dihubungi:    { label: 'Dihubungi',    bg: 'bg-accent-amber/15',  text: 'text-accent-amber' },
  negosiasi:    { label: 'Negosiasi',    bg: 'bg-purple-500/15',    text: 'text-purple-400' },
  deal:         { label: 'Deal ✓',       bg: 'bg-accent-green/15',  text: 'text-accent-green-light' },
  tidak_sesuai: { label: 'Tidak Sesuai', bg: 'bg-muted',            text: 'text-muted-foreground' },
};

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-[9px] text-muted-foreground">—</span>;
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-2.5 w-2.5 ${
            i < full          ? 'fill-accent-amber text-accent-amber' :
            i === full && half ? 'fill-accent-amber/50 text-accent-amber' :
                                 'text-muted-foreground/30'
          }`}
        />
      ))}
      <span className="text-[9px] font-mono text-accent-amber ml-0.5">{rating.toFixed(1)}</span>
    </span>
  );
}

export function ProspectCard({ prospect: p, selected, onSelect, onBookmark }: ProspectCardProps) {
  const sektor = SEKTOR_CONFIG[p.sektor] ?? SEKTOR_CONFIG.lainnya;
  const status = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.baru;

  return (
    <button
      onClick={() => onSelect(p)}
      className={`w-full text-left rounded-md px-3 py-3 transition-colors border
        ${selected
          ? 'bg-accent-teal/10 border-accent-teal/30'
          : 'bg-card border-border hover:bg-card-2 hover:border-border/80'
        }`}
    >
      {/* Top row: name + bookmark */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs font-semibold leading-snug line-clamp-1 ${selected ? 'text-foreground' : 'text-foreground/90'}`}>
          {p.nama}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onBookmark(p.id, p.is_bookmarked); }}
          className="shrink-0 text-muted-foreground hover:text-accent-amber transition-colors"
        >
          {p.is_bookmarked
            ? <BookmarkCheck className="h-3.5 w-3.5 text-accent-amber" />
            : <Bookmark className="h-3.5 w-3.5" />
          }
        </button>
      </div>

      {/* Rating + reviews */}
      <div className="mt-1.5 flex items-center gap-2">
        <StarRating rating={p.rating} />
        {(p.total_reviews ?? 0) > 0 && (
          <span className="text-[9px] text-muted-foreground">
            ({(p.total_reviews ?? 0).toLocaleString('id-ID')} ulasan)
          </span>
        )}
      </div>

      {/* Kota + phone/website indicators */}
      <div className="mt-1.5 flex items-center gap-3 flex-wrap">
        {p.kota && (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <MapPin className="h-2.5 w-2.5" />
            {p.kota}
          </span>
        )}
        {p.telepon && (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Phone className="h-2.5 w-2.5" />
            Ada
          </span>
        )}
        {p.website && (
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <Globe className="h-2.5 w-2.5" />
            Website
          </span>
        )}
      </div>

      {/* Sektor + Status badges */}
      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${sektor.bg} ${sektor.text}`}>
          {sektor.label}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>
    </button>
  );
}
