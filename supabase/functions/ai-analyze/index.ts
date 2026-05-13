// Edge Function: ai-analyze
// Scoring relevansi paket pengadaan menggunakan Claude API
// Deploy: supabase functions deploy ai-analyze
// Secret yang harus diset: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface PackageInput {
  kode_rup:        string;
  nama_paket:      string;
  nama_instansi:   string | null;
  nama_satker:     string | null;
  jenis_pengadaan: string | null;
  metode_pengadaan: string | null;
  pagu:            number;
  nama_provinsi:   string | null;
}

interface AnalysisResult {
  score:    number;
  notes:    string;
  kategori: 'alkes' | 'pest_control' | 'lab' | 'sanitasi' | 'lainnya';
}

const SCORING_PROMPT = (p: PackageInput) => `\
Kamu adalah sistem AI scoring relevansi untuk perusahaan supplier alat kesehatan, pest control, dan laboratorium di Indonesia.

Tugas: Analisis paket pengadaan berikut dan beri skor relevansi 0–100.

Kriteria skor:
- 85–100 : Sangat relevan — secara eksplisit menyebut produk/jasa kami (alkes, reagen lab, pest control, desinfektan, sterilisasi, APD, bahan kimia lab, fumigasi)
- 65–84  : Relevan — cakupan kesehatan lingkungan, sanitasi fasilitas, kebersihan gedung/RS
- 40–64  : Kurang relevan — jasa umum, pengadaan yang bisa kami ikuti tapi bukan core
- 0–39   : Tidak relevan — ATK, konstruksi, IT non-medis, makanan, kendaraan

Data paket:
Nama Paket   : ${p.nama_paket}
Instansi     : ${p.nama_instansi ?? '-'}
Satker       : ${p.nama_satker ?? '-'}
Jenis        : ${p.jenis_pengadaan ?? '-'}
Metode       : ${p.metode_pengadaan ?? '-'}
Pagu         : Rp ${p.pagu.toLocaleString('id-ID')}
Provinsi     : ${p.nama_provinsi ?? '-'}

Balas HANYA dengan JSON (tanpa teks lain, tanpa markdown):
{"score":<0-100>,"notes":"<2 kalimat alasan dalam bahasa Indonesia>","kategori":"<alkes|pest_control|lab|sanitasi|lainnya>"}`;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json() as { kode_rup: string; paket: PackageInput };
    const { kode_rup, paket } = body;

    if (!kode_rup || !paket?.nama_paket) {
      return new Response(
        JSON.stringify({ error: 'kode_rup dan paket.nama_paket wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Panggil Claude API langsung (tanpa SDK agar kompatibel dengan Deno Deploy)
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
        'x-api-key':         Deno.env.get('ANTHROPIC_API_KEY')!,
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
        max_tokens: 256,
        messages:   [{ role: 'user', content: SCORING_PROMPT(paket) }],
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.text();
      console.error('[ai-analyze] Claude error:', err);
      return new Response(
        JSON.stringify({ error: 'Claude API error', detail: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const claudeData = await claudeRes.json();
    const rawText: string =
      claudeData?.content?.[0]?.type === 'text' ? claudeData.content[0].text : '{}';

    let result: AnalysisResult = { score: 0, notes: '', kategori: 'lainnya' };
    try {
      // Strip markdown fences jika ada
      const clean = rawText.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();
      result = JSON.parse(clean);
    } catch {
      // Fallback: coba ekstrak score saja dengan regex
      const m = rawText.match(/"score"\s*:\s*(\d+)/);
      if (m) result.score = Math.min(100, Math.max(0, Number(m[1])));
      const n = rawText.match(/"notes"\s*:\s*"([^"]+)"/);
      if (n) result.notes = n[1];
    }

    // Clamp score ke 0–100
    result.score = Math.min(100, Math.max(0, Math.round(result.score)));

    // Update database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    await supabase
      .from('rup_packages')
      .update({
        ai_score:    result.score,
        ai_notes:    result.notes,
        ai_kategori: result.kategori,
        updated_at:  new Date().toISOString(),
      })
      .eq('kode_rup', kode_rup);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[ai-analyze]', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
