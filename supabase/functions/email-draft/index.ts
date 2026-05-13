// Edge Function: email-draft
// Generate draft email penawaran profesional menggunakan Claude API
// Secret: ANTHROPIC_API_KEY (opsional — fallback ke template jika tidak di-set)
// Deploy: supabase functions deploy email-draft

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface EmailDraftInput {
  prospect_id: number;
  nama:        string;
  sektor:      string;
  kota:        string | null;
  website:     string | null;
  rating:      number | null;
}

const EMAIL_PROMPT = (p: EmailDraftInput) => `\
Tulis email penawaran bisnis profesional dalam Bahasa Indonesia untuk perusahaan berikut.

Data perusahaan target:
- Nama perusahaan : ${p.nama}
- Sektor          : ${p.sektor}
- Kota            : ${p.kota ?? '-'}
- Website         : ${p.website ?? '-'}
- Rating Google   : ${p.rating ?? '-'}

Kami dari PT Kemika Indonesia, supplier:
- Alat kesehatan (alkes) dan APD
- Produk pest control & fumigasi profesional
- Reagen dan peralatan laboratorium
- Produk sanitasi & desinfektan

Tulis email yang memenuhi kriteria:
1. Pembuka singkat memperkenalkan kami
2. Jelaskan relevansi produk kami untuk kebutuhan sektor ${p.sektor}
3. Sebutkan 2–3 produk/layanan konkret yang relevan
4. Ajak meeting/demo singkat 30 menit
5. CTA (call-to-action) yang jelas

Panjang: 150–180 kata. Gunakan sapaan "Bapak/Ibu". Format langsung isi email saja (tanpa Subject:, tanpa To:, tanpa From:).`;

function sektorProduk(sektor: string): string {
  const s = sektor.toLowerCase().replace(/[^a-z]/g, '');
  if (s.includes('pest') || s.includes('fumig'))
    return 'produk pest control, rodentisida, dan fumigasi profesional';
  if (s.includes('hotel') || s.includes('hospitality'))
    return 'produk sanitasi, disinfektan, dan alat kebersihan standar hotel';
  if (s.includes('fnb') || s.includes('food') || s.includes('resto') || s.includes('kafe'))
    return 'produk sanitasi food-grade, alat kebersihan dapur, dan desinfektan';
  if (s.includes('klinik') || s.includes('medis') || s.includes('rs') || s.includes('rumahsakit'))
    return 'alat kesehatan, APD, reagen laboratorium, dan sterilisasi';
  if (s.includes('pabrik') || s.includes('industri') || s.includes('manufaktur'))
    return 'produk sanitasi industri, APD, dan bahan kimia kebersihan';
  if (s.includes('distribu') || s.includes('trading'))
    return 'produk alkes, pest control, dan laboratorium untuk re-distribusi';
  return 'alat kesehatan, pest control, dan perlengkapan laboratorium';
}

function generateTemplate(p: EmailDraftInput): string {
  const produk = sektorProduk(p.sektor);
  return `Dengan hormat,

Perkenalkan, kami dari PT Kemika Indonesia — distributor resmi ${produk} yang melayani berbagai sektor industri di seluruh Indonesia.

Kami mengetahui bahwa ${p.nama} bergerak di bidang ${p.sektor} di ${p.kota ?? 'kota Anda'}. Kami percaya produk kami dapat mendukung operasional ${p.sektor} Bapak/Ibu dengan lebih efisien dan hemat biaya.

Yang kami tawarkan:
• ${produk.charAt(0).toUpperCase() + produk.slice(1)}
• Produk berstandar SNI / internasional dengan garansi kualitas
• Pengiriman cepat ke ${p.kota ?? 'lokasi Anda'} dengan harga kompetitif
• Dukungan teknis dan after-sales support

Kami ingin menjadwalkan pertemuan singkat (30 menit) untuk memperkenalkan katalog lengkap kami. Apakah Bapak/Ibu berkenan untuk meeting minggu ini atau depan?

Hormat kami,
Tim Sales PT Kemika Indonesia
📧 sales@kemika.co.id | 🌐 kemika.co.id`;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json() as EmailDraftInput;
    const { prospect_id, nama, sektor } = body;

    if (!prospect_id || !nama || !sektor) {
      return new Response(
        JSON.stringify({ error: 'prospect_id, nama, dan sektor wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    let emailText = '';

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (apiKey) {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
          'x-api-key':         apiKey,
        },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 600,
          messages:   [{ role: 'user', content: EMAIL_PROMPT(body) }],
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (claudeRes.ok) {
        const data = await claudeRes.json();
        emailText = data?.content?.[0]?.text?.trim() ?? '';
      } else {
        console.warn('[email-draft] Claude error:', await claudeRes.text());
      }
    }

    if (!emailText) emailText = generateTemplate(body);

    // Simpan draft ke database
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );
    await supabase
      .from('b2b_prospects')
      .update({ email_draft: emailText })
      .eq('id', prospect_id);

    return new Response(
      JSON.stringify({ email: emailText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[email-draft]', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
