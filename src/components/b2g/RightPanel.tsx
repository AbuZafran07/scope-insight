import {
  Bookmark, BookmarkCheck, Bot, Calendar, ChevronRight,
  Copy, ExternalLink, Loader2, MapPin, X,
} from 'lucide-react';
import { useState } from 'react';
import type { RupPackage } from '@/hooks/useSirupData';
import { useAiAnalyze } from '@/hooks/useAiAnalyze';

interface RightPanelProps {
  pkg:        RupPackage;
  onClose:    () => void;
  onBookmark: (kode_rup: string, current: boolean) => void;
  onScoreUpdate?: (kode_rup: string, score: number, notes: string) => void;
}

function fmtRupiah(v: number): string {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9)  return `Rp ${(v / 1e9).toFixed(2)}M`;
  if (v >= 1e6)  return `Rp ${(v / 1e6).toFixed(1)}Jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function fmtDate(s: string | null): string {
  if (!s) return '—';
  return new Date(s).toLocaleDateString('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

function daysLeft(s: string | null): number | null {
  if (!s) return null;
  return Math.ceil((new Date(s).getTime() - Date.now()) / 86_400_000);
}

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? '#3fb950' :
    score >= 60 ? '#d29922' :
    score >= 40 ? '#7d8590' :
                  '#da3633';
  const pct = score / 100;
  const r = 20, circ = 2 * Math.PI * r;
  return (
    <div className="relative h-14 w-14 shrink-0">
      <svg viewBox="0 0 48 48" className="h-14 w-14 -rotate-90">
        <circle cx="24" cy="24" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
        <circle
          cx="24" cy="24" r={r} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
        />
      </svg>
      <span
        className="absolute inset-0 grid place-items-center text-xs font-mono font-bold"
        style={{ color }}
      >
        {score}
      </span>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground w-28 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-xs text-foreground leading-relaxed">{value}</span>
    </div>
  );
}

export function RightPanel({ pkg, onClose, onBookmark, onScoreUpdate }: RightPanelProps) {
  const { analyze, loading: aiLoading, result: aiResult, error: aiError } = useAiAnalyze();
  const [localScore, setLocalScore] = useState<number | null>(pkg.ai_score);
  const [localNotes, setLocalNotes] = useState<string | null>(pkg.ai_reasoning);
  const days = daysLeft(pkg.tanggal_pemilihan_selesai);
  const [copied, setCopied]         = useState(false);

  const handleAnalyze = async () => {
    const r = await analyze(pkg);
    if (r) {
      setLocalScore(r.score);
      setLocalNotes(r.notes);
      onScoreUpdate?.(pkg.kode_rup, r.score, r.notes);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${pkg.nama_paket}\n${pkg.nama_instansi ?? ''}\nPagu: ${fmtRupiah(pkg.pagu)}\nKode RUP: ${pkg.kode_rup}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside className="w-[320px] shrink-0 border-l border-border bg-card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider">
          <ChevronRight className="h-3 w-3" />
          Detail Paket
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleCopy} title="Copy info" className="text-muted-foreground hover:text-foreground">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onBookmark(pkg.kode_rup, pkg.is_bookmarked)}
            title="Bookmark"
            className="text-muted-foreground hover:text-accent-amber"
          >
            {pkg.is_bookmarked
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
        {/* Urgency + Pagu hero */}
        <div className="px-4 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground leading-snug">
            {pkg.nama_paket}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-lg font-mono font-bold text-accent-blue">
              {fmtRupiah(pkg.pagu)}
            </span>
            {days !== null && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                days <= 0  ? 'bg-muted text-muted-foreground' :
                days <= 14 ? 'bg-accent-red/15 text-accent-red' :
                days <= 30 ? 'bg-accent-amber/15 text-accent-amber' :
                             'bg-accent-green/10 text-accent-green-light'
              }`}>
                {days <= 0 ? 'Berakhir' : `${days}h lagi`}
              </span>
            )}
          </div>
        </div>

        {/* Detail rows */}
        <div className="px-4 py-4 space-y-3 border-b border-border">
          <Row label="Kode RUP"  value={<span className="font-mono">{pkg.kode_rup}</span>} />
          <Row label="Instansi"  value={pkg.nama_instansi ?? '—'} />
          <Row label="Satker"    value={pkg.nama_satker ?? '—'} />
          <Row label="Jenis"     value={pkg.jenis_pengadaan ?? '—'} />
          <Row label="Metode"    value={pkg.metode_pengadaan ?? '—'} />
          <Row label="Status"    value={
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              pkg.status_aktif === 'Aktif'
                ? 'bg-accent-green/10 text-accent-green-light'
                : 'bg-muted text-muted-foreground'
            }`}>
              {pkg.status_aktif}
            </span>
          } />
          <Row label="Tahun"     value={String(pkg.tahun_anggaran)} />
          {pkg.nama_provinsi && (
            <Row label="Provinsi"  value={
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-muted-foreground" />
                {pkg.nama_provinsi}
              </span>
            } />
          )}
          <Row label="Dibuat"    value={fmtDate(pkg.tanggal_pembuatan)} />
          <Row label="Deadline"  value={
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {fmtDate(pkg.tanggal_akhir_pemilihan)}
            </span>
          } />
        </div>

        {/* AI Scoring */}
        <div className="px-4 py-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
            Scoring Relevansi AI
          </div>

          {localScore !== null ? (
            <div className="flex items-start gap-4">
              <ScoreRing score={localScore} />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-foreground/80 leading-relaxed">
                  {localNotes ?? aiResult?.notes ?? '—'}
                </p>
                {(aiResult?.kategori ?? pkg.ai_kategori) && (
                  <span className="mt-2 inline-block text-[9px] px-1.5 py-0.5 rounded bg-card-2 border border-border text-muted-foreground">
                    {aiResult?.kategori ?? pkg.ai_kategori}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Belum dianalisis. Klik tombol di bawah untuk scoring relevansi.
            </p>
          )}

          {aiError && (
            <p className="mt-2 text-[10px] text-accent-red">{aiError}</p>
          )}

          <button
            onClick={handleAnalyze}
            disabled={aiLoading}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-accent-green/30 bg-accent-green/10 text-accent-green-light text-xs font-medium hover:bg-accent-green/20 transition-colors disabled:opacity-50"
          >
            {aiLoading
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Menganalisis…</>
              : <><Bot className="h-3.5 w-3.5" /> {localScore !== null ? 'Analisis Ulang' : 'Analisis AI'}</>
            }
          </button>

          {copied && (
            <p className="mt-2 text-center text-[10px] text-accent-green-light">Tersalin!</p>
          )}

          <a
            href={`https://sirup.lkpp.go.id/sirup/informasipaket/detailPaketPenyedia/${pkg.kode_rup}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Lihat di SIRUP LKPP
          </a>
        </div>
      </div>
    </aside>
  );
}
