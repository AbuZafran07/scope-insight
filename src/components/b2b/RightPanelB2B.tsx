import {
  Bookmark, BookmarkCheck, Bot, ChevronRight, ClipboardCopy,
  ExternalLink, Globe, Loader2, MapPin, Phone, Star, X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { B2bProspect } from '@/hooks/useB2bData';
import { STATUS_CONFIG, SEKTOR_CONFIG } from './ProspectCard';

interface RightPanelB2BProps {
  prospect:       B2bProspect;
  onClose:        () => void;
  onBookmark:     (id: number, current: boolean) => void;
  onStatusChange: (id: number, status: string) => void;
  onEmailSaved:   (id: number, email: string) => void;
}

const STATUS_KEYS = ['baru', 'dihubungi', 'negosiasi', 'deal', 'tidak_sesuai'] as const;

function StarRow({ rating }: { rating: number | null }) {
  if (rating === null) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const half   = !filled && i < rating;
        return (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${
              filled ? 'fill-accent-amber text-accent-amber' :
              half   ? 'fill-accent-amber/50 text-accent-amber' :
                       'text-muted-foreground/20'
            }`}
          />
        );
      })}
      <span className="text-xs font-mono text-accent-amber">{rating.toFixed(1)}</span>
    </span>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-20 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs text-foreground leading-relaxed">{children}</span>
    </div>
  );
}

export function RightPanelB2B({
  prospect: p, onClose, onBookmark, onStatusChange, onEmailSaved,
}: RightPanelB2BProps) {
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError,   setDraftError]   = useState<string | null>(null);
  const [emailText,    setEmailText]    = useState(p.email_draft ?? '');
  const [catatan,      setCatatan]      = useState(p.catatan ?? '');
  const [copied,       setCopied]       = useState(false);
  const catatanTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync local state when prospect prop changes
  useEffect(() => {
    setEmailText(p.email_draft ?? '');
    setCatatan(p.catatan ?? '');
    setDraftError(null);
  }, [p.id]);

  const sektor = SEKTOR_CONFIG[p.sektor] ?? SEKTOR_CONFIG.lainnya;

  const handleGenerateEmail = async () => {
    setDraftLoading(true);
    setDraftError(null);
    const { data, error } = await supabase.functions.invoke('email-draft', {
      body: {
        prospect_id: p.id,
        nama:        p.nama,
        sektor:      p.sektor,
        kota:        p.kota,
        website:     p.website,
        rating:      p.rating,
      },
    });
    setDraftLoading(false);
    if (error) {
      setDraftError(error.message);
      return;
    }
    const text = (data as { email: string })?.email ?? '';
    setEmailText(text);
    onEmailSaved(p.id, text);
  };

  const handleCopyEmail = () => {
    if (!emailText) return;
    navigator.clipboard.writeText(emailText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSaveEmail = async () => {
    if (!emailText) return;
    await supabase.from('b2b_prospects').update({ email_draft: emailText }).eq('id', p.id);
    onEmailSaved(p.id, emailText);
  };

  const handleCatatanChange = (val: string) => {
    setCatatan(val);
    clearTimeout(catatanTimer.current);
    catatanTimer.current = setTimeout(async () => {
      await supabase.from('b2b_prospects').update({ catatan: val }).eq('id', p.id);
    }, 800);
  };

  return (
    <aside className="w-[340px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
          <ChevronRight className="h-3 w-3" />
          Detail Prospek
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onBookmark(p.id, p.is_bookmarked)}
            className="text-muted-foreground hover:text-accent-amber"
          >
            {p.is_bookmarked
              ? <BookmarkCheck className="h-3.5 w-3.5 text-accent-amber" />
              : <Bookmark className="h-3.5 w-3.5" />
            }
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Hero: nama + rating + sektor */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground leading-snug">{p.nama}</p>
          <div className="mt-2 flex items-center gap-3 flex-wrap">
            <StarRow rating={p.rating} />
            {p.total_reviews > 0 && (
              <span className="text-[10px] text-muted-foreground">
                {p.total_reviews.toLocaleString('id-ID')} ulasan
              </span>
            )}
          </div>
          <div className="mt-2">
            <span className={`text-[9px] px-2 py-0.5 rounded font-medium ${sektor.bg} ${sektor.text}`}>
              {sektor.label}
            </span>
          </div>
        </div>

        {/* Info rows */}
        <div className="px-4 py-4 space-y-3 border-b border-border">
          {p.kota && (
            <InfoRow label="Kota">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {p.kota}{p.provinsi ? `, ${p.provinsi}` : ''}
              </span>
            </InfoRow>
          )}
          {p.alamat && <InfoRow label="Alamat">{p.alamat}</InfoRow>}
          {p.telepon && (
            <InfoRow label="Telepon">
              <a
                href={`tel:${p.telepon}`}
                className="flex items-center gap-1 text-accent-blue hover:underline"
              >
                <Phone className="h-3 w-3" />
                {p.telepon}
              </a>
            </InfoRow>
          )}
          {p.website && (
            <InfoRow label="Website">
              <a
                href={p.website.startsWith('http') ? p.website : `https://${p.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-accent-blue hover:underline truncate max-w-[200px]"
              >
                <Globe className="h-3 w-3 shrink-0" />
                {p.website.replace(/^https?:\/\/(www\.)?/, '')}
                <ExternalLink className="h-2.5 w-2.5 shrink-0" />
              </a>
            </InfoRow>
          )}
        </div>

        {/* Status */}
        <div className="px-4 py-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Status Prospek
          </div>
          <div className="flex flex-wrap gap-1.5">
            {STATUS_KEYS.map((key) => {
              const cfg     = STATUS_CONFIG[key];
              const active  = p.status === key;
              return (
                <button
                  key={key}
                  onClick={() => onStatusChange(p.id, key)}
                  className={`text-[10px] px-2 py-1 rounded font-medium transition-colors ${
                    active
                      ? `${cfg.bg} ${cfg.text} ring-1 ring-current`
                      : 'bg-card-2 text-muted-foreground hover:bg-border hover:text-foreground'
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Catatan */}
        <div className="px-4 py-4 border-b border-border">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Catatan
          </div>
          <textarea
            value={catatan}
            onChange={(e) => handleCatatanChange(e.target.value)}
            placeholder="Tulis catatan tentang prospek ini…"
            rows={3}
            className="w-full bg-card-2 border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-teal resize-none"
          />
        </div>

        {/* Email Draft */}
        <div className="px-4 py-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Draft Email Penawaran
          </div>

          <button
            onClick={handleGenerateEmail}
            disabled={draftLoading}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-accent-teal/30 bg-accent-teal/10 text-accent-teal text-xs font-medium hover:bg-accent-teal/20 transition-colors disabled:opacity-50"
          >
            {draftLoading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Membuat draft…</>
              : <><Bot className="h-3.5 w-3.5" /> {emailText ? 'Buat Ulang Email' : 'Buat Draft Email AI'}</>
            }
          </button>

          {draftError && (
            <p className="mt-2 text-[10px] text-accent-red">{draftError}</p>
          )}

          {emailText && (
            <div className="mt-3 space-y-2">
              <textarea
                value={emailText}
                onChange={(e) => setEmailText(e.target.value)}
                onBlur={handleSaveEmail}
                rows={10}
                className="w-full bg-card-2 border border-border rounded-md px-3 py-2 text-[11px] text-foreground/90 leading-relaxed focus:outline-none focus:border-accent-teal resize-none"
              />
              <button
                onClick={handleCopyEmail}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                <ClipboardCopy className="h-3 w-3" />
                {copied ? 'Tersalin!' : 'Copy Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
