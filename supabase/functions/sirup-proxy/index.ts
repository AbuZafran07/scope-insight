// Edge Function: sirup-proxy
// Menerima params → fetch SIRUP LKPP → upsert rup_packages → return cleaned JSON
// Deploy: supabase functions deploy sirup-proxy

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SIRUP_URL = 'https://sirup.lkpp.go.id/sirup/ro/publiRUPPenyediaByParam';

// Semua field yang mungkin dikirim SIRUP LKPP (nama field tidak konsisten antar versi)
interface SirupRaw {
  kodeRUP?: string;
  kodeRup?: string;
  namaPaket?: string;
  namaSatker?: string;
  kodeSatker?: string;
  namaInstansi?: string;
  kodeInstansi?: string;
  namaProvinsi?: string;
  kodeProvinsi?: string;
  pagu?: number | string;
  metodePengadaan?: string;
  jenisPengadaan?: string;
  statusAktif?: string;
  status?: string;
  tahunAnggaran?: number | string;
  tanggalPembuatan?: string;
  tanggalAkhirPemilihan?: string;
}

function clean(p: SirupRaw) {
  return {
    kode_rup:               String(p.kodeRUP ?? p.kodeRup ?? '').trim(),
    nama_paket:             String(p.namaPaket ?? '').trim(),
    nama_satker:            String(p.namaSatker ?? '').trim() || null,
    kode_satker:            String(p.kodeSatker ?? '').trim() || null,
    nama_instansi:          String(p.namaInstansi ?? '').trim() || null,
    kode_instansi:          String(p.kodeInstansi ?? '').trim() || null,
    nama_provinsi:          String(p.namaProvinsi ?? '').trim() || null,
    kode_provinsi:          String(p.kodeProvinsi ?? '').trim() || null,
    pagu:                   Math.round(Number(p.pagu ?? 0)),
    metode_pengadaan:       String(p.metodePengadaan ?? '').trim() || null,
    jenis_pengadaan:        String(p.jenisPengadaan ?? '').trim() || null,
    status_aktif:           String(p.statusAktif ?? p.status ?? 'Aktif').trim(),
    tahun_anggaran:         Number(p.tahunAnggaran ?? 2026),
    tanggal_pembuatan:      p.tanggalPembuatan
                              ? new Date(p.tanggalPembuatan).toISOString()
                              : null,
    tanggal_akhir_pemilihan: p.tanggalAkhirPemilihan
                              ? new Date(p.tanggalAkhirPemilihan).toISOString()
                              : null,
    synced_at:              new Date().toISOString(),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      keyword       = '',
      provinsi      = '',
      limit         = 100,
      offset        = 0,
      tahunAnggaran = 2026,
    } = body as {
      keyword?: string;
      provinsi?: string;
      limit?: number;
      offset?: number;
      tahunAnggaran?: number;
    };

    // Build SIRUP query params
    const params = new URLSearchParams({
      tahunAnggaran: String(tahunAnggaran),
      limit:         String(Math.min(Number(limit), 200)),
      offset:        String(Number(offset)),
    });
    if (keyword)  params.set('keyword',      keyword);
    if (provinsi) params.set('kodeProvinsi', provinsi);

    const sirupRes = await fetch(`${SIRUP_URL}?${params.toString()}`, {
      headers: { Accept: 'application/json', 'User-Agent': 'PengadaanScope/1.0' },
      signal: AbortSignal.timeout(20_000),
    });

    if (!sirupRes.ok) {
      return new Response(
        JSON.stringify({ error: 'SIRUP API error', status: sirupRes.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const raw = await sirupRes.json();

    // SIRUP LKPP wraps data in berbagai struktur tergantung versi
    const list: SirupRaw[] =
      raw?.data?.daftarPaket ??
      raw?.data?.paket       ??
      raw?.data              ??
      raw?.daftarPaket       ??
      [];

    const total: number = raw?.data?.total ?? raw?.total ?? list.length;
    const packages = list.filter((p) => p.kodeRUP || p.kodeRup).map(clean);

    // Upsert ke Supabase (service_role sudah di-inject otomatis oleh Supabase)
    if (packages.length > 0) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      const { error: upsertErr } = await supabase
        .from('rup_packages')
        .upsert(packages, { onConflict: 'kode_rup', ignoreDuplicates: false });

      if (upsertErr) console.error('[sirup-proxy] upsert error:', upsertErr.message);
    }

    return new Response(
      JSON.stringify({ total, synced: packages.length, data: packages }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[sirup-proxy]', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
