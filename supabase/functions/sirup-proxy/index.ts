// Edge Function: sirup-proxy
// Mencoba fetch dari SIRUP LKPP. Jika gagal/tidak tersedia (umum karena LKPP
// tidak menyediakan public JSON API yang stabil), fallback ke sample data
// realistis agar UI tetap bisa diisi. Upsert ke rup_packages.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const SIRUP_URL = 'https://sirup.lkpp.go.id/sirup/ro/publiRUPPenyediaByParam';

interface RupRow {
  kode_rup: string;
  nama_paket: string;
  nama_instansi: string | null;
  nama_satker: string | null;
  nama_provinsi: string | null;
  nama_kabupaten: string | null;
  jenis_pengadaan: string | null;
  metode_pengadaan: string | null;
  sumber_dana: string | null;
  pagu: number;
  status_aktif: string;
  tanggal_pemilihan_mulai: string | null;
  tanggal_pemilihan_selesai: string | null;
  tanggal_pekerjaan_mulai: string | null;
  tanggal_pekerjaan_selesai: string | null;
  tahun_anggaran: number;
  uraian_pekerjaan: string | null;
  raw_data: unknown;
}

function clean(p: Record<string, unknown>, tahun: number): RupRow | null {
  const kode = String(p.kodeRUP ?? p.kodeRup ?? p.kode_rup ?? '').trim();
  const nama = String(p.namaPaket ?? p.nama_paket ?? '').trim();
  if (!kode || !nama) return null;
  const d = (v: unknown) => {
    if (!v) return null;
    const dt = new Date(String(v));
    return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
  };
  return {
    kode_rup: kode,
    nama_paket: nama,
    nama_instansi: String(p.namaInstansi ?? p.nama_instansi ?? '').trim() || null,
    nama_satker: String(p.namaSatker ?? p.nama_satker ?? '').trim() || null,
    nama_provinsi: String(p.namaProvinsi ?? p.nama_provinsi ?? '').trim() || null,
    nama_kabupaten: String(p.namaKabupaten ?? p.nama_kabupaten ?? '').trim() || null,
    jenis_pengadaan: String(p.jenisPengadaan ?? p.jenis_pengadaan ?? '').trim() || null,
    metode_pengadaan: String(p.metodePengadaan ?? p.metode_pengadaan ?? '').trim() || null,
    sumber_dana: String(p.sumberDana ?? p.sumber_dana ?? '').trim() || null,
    pagu: Math.round(Number(p.pagu ?? 0)) || 0,
    status_aktif: String(p.statusAktif ?? p.status ?? 'Aktif').trim(),
    tanggal_pemilihan_mulai: d(p.tanggalPemilihanMulai ?? p.tanggal_pemilihan_mulai),
    tanggal_pemilihan_selesai: d(p.tanggalAkhirPemilihan ?? p.tanggalPemilihanSelesai ?? p.tanggal_pemilihan_selesai),
    tanggal_pekerjaan_mulai: d(p.tanggalPekerjaanMulai ?? p.tanggal_pekerjaan_mulai),
    tanggal_pekerjaan_selesai: d(p.tanggalPekerjaanSelesai ?? p.tanggal_pekerjaan_selesai),
    tahun_anggaran: Number(p.tahunAnggaran ?? tahun) || tahun,
    uraian_pekerjaan: String(p.uraianPekerjaan ?? p.uraian_pekerjaan ?? '').trim() || null,
    raw_data: p,
  };
}

// ---------------- Sample seed (fallback) ----------------
const PROVINSI = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten',
  'Sumatera Utara', 'Sumatera Selatan', 'Riau', 'Lampung', 'Bali',
  'Kalimantan Timur', 'Sulawesi Selatan', 'Sulawesi Utara', 'Papua',
];
const INSTANSI = [
  'Dinas Kesehatan', 'RSUD', 'Dinas Lingkungan Hidup', 'Puskesmas',
  'Balai Laboratorium Kesehatan', 'BPBD', 'Dinas Pertanian',
];
const PAKET_TEMPLATES = [
  { n: 'Pengadaan Alat Kesehatan', j: 'Barang', kat: 'Alkes' },
  { n: 'Pengadaan Sprayer Fogging', j: 'Barang', kat: 'Pest Control' },
  { n: 'Belanja Insektisida & Larvasida', j: 'Barang', kat: 'Pest Control' },
  { n: 'Pengadaan Reagen Laboratorium', j: 'Barang', kat: 'Laboratorium' },
  { n: 'Pengadaan Mikroskop & Centrifuge', j: 'Barang', kat: 'Laboratorium' },
  { n: 'Jasa Fogging Demam Berdarah', j: 'Jasa Lainnya', kat: 'Pest Control' },
  { n: 'Pengadaan APD & Masker Medis', j: 'Barang', kat: 'Alkes' },
  { n: 'Pengadaan Tempat Tidur Pasien', j: 'Barang', kat: 'Alkes' },
  { n: 'Belanja Alat Pemeriksaan Laboratorium PCR', j: 'Barang', kat: 'Laboratorium' },
  { n: 'Pengadaan Mesin Fogging ULV', j: 'Barang', kat: 'Pest Control' },
];
const METODE = ['Tender', 'Pengadaan Langsung', 'e-Purchasing', 'Tender Cepat'];
const SUMBER = ['APBD', 'APBN', 'DAK', 'BLUD'];

function seedSample(tahun: number, provinsiFilter: string, n = 80): RupRow[] {
  const rows: RupRow[] = [];
  for (let i = 0; i < n; i++) {
    const t = PAKET_TEMPLATES[i % PAKET_TEMPLATES.length];
    const prov = provinsiFilter || PROVINSI[i % PROVINSI.length];
    const inst = INSTANSI[i % INSTANSI.length];
    const pagu = Math.round((50 + Math.random() * 4950) * 1_000_000); // 50jt - 5M
    const month = 1 + (i % 10);
    const start = `${tahun}-${String(month).padStart(2, '0')}-05`;
    const end = `${tahun}-${String(month).padStart(2, '0')}-25`;
    rows.push({
      kode_rup: `SAMPLE-${tahun}-${String(i + 1).padStart(5, '0')}`,
      nama_paket: `${t.n} ${prov} ${tahun}`,
      nama_instansi: `${inst} Provinsi ${prov}`,
      nama_satker: `Satker ${inst}`,
      nama_provinsi: prov,
      nama_kabupaten: null,
      jenis_pengadaan: t.j,
      metode_pengadaan: METODE[i % METODE.length],
      sumber_dana: SUMBER[i % SUMBER.length],
      pagu,
      status_aktif: 'Aktif',
      tanggal_pemilihan_mulai: start,
      tanggal_pemilihan_selesai: end,
      tanggal_pekerjaan_mulai: end,
      tanggal_pekerjaan_selesai: `${tahun}-12-31`,
      tahun_anggaran: tahun,
      uraian_pekerjaan: `Sample data — ${t.kat}. Kategori: ${t.n}.`,
      raw_data: { source: 'sample', kategori: t.kat },
    });
  }
  return rows;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      keyword = '',
      provinsi = '',
      limit = 100,
      offset = 0,
      tahunAnggaran = 2026,
    } = body as Record<string, never>;

    let packages: RupRow[] = [];
    let source = 'sirup';
    let sirupError: string | null = null;

    // Coba SIRUP LKPP (sering tidak available / butuh auth)
    try {
      const params = new URLSearchParams({
        tahunAnggaran: String(tahunAnggaran),
        limit: String(Math.min(Number(limit), 200)),
        offset: String(Number(offset)),
      });
      if (keyword) params.set('keyword', keyword);
      if (provinsi) params.set('namaProvinsi', provinsi);

      const sirupRes = await fetch(`${SIRUP_URL}?${params.toString()}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'PengadaanScope/1.0' },
        signal: AbortSignal.timeout(15_000),
      });

      if (sirupRes.ok) {
        const ct = sirupRes.headers.get('content-type') ?? '';
        if (ct.includes('application/json')) {
          const raw = await sirupRes.json();
          const list: Record<string, unknown>[] =
            raw?.data?.daftarPaket ?? raw?.data?.paket ?? raw?.data ?? raw?.daftarPaket ?? raw ?? [];
          if (Array.isArray(list)) {
            packages = list
              .map((p) => clean(p, Number(tahunAnggaran)))
              .filter((x): x is RupRow => x !== null);
          }
        } else {
          sirupError = `SIRUP returned non-JSON (${ct})`;
        }
      } else {
        sirupError = `SIRUP HTTP ${sirupRes.status}`;
      }
    } catch (e) {
      sirupError = `SIRUP fetch failed: ${(e as Error).message}`;
    }

    // Fallback ke sample data jika SIRUP gagal / kosong
    if (packages.length === 0) {
      source = 'sample';
      packages = seedSample(Number(tahunAnggaran), String(provinsi || ''), Number(limit) || 80);
    }

    // Upsert ke Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    const { error: upsertErr } = await supabase
      .from('rup_packages')
      .upsert(packages, { onConflict: 'kode_rup', ignoreDuplicates: false });

    if (upsertErr) {
      console.error('[sirup-proxy] upsert error:', upsertErr.message);
      return new Response(
        JSON.stringify({ error: 'Upsert failed', details: upsertErr.message, source, sirupError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({
        synced: packages.length,
        source,
        sirupError,
        note: source === 'sample'
          ? 'SIRUP LKPP API tidak tersedia / tidak menyediakan public JSON. Menggunakan sample data agar UI bisa diuji.'
          : undefined,
      }),
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
