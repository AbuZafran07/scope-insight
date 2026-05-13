// Rule-based relevance scoring — gratis, tanpa API eksternal
// Cocok untuk supplier alkes, pest control, lab, dan sanitasi

export interface ScoreResult {
  score:    number;
  notes:    string;
  kategori: 'alkes' | 'pest_control' | 'lab' | 'sanitasi' | 'lainnya';
}

type Rule = {
  keywords: string[];
  score:    number;
  kategori: ScoreResult['kategori'];
  label:    string;
};

const RULES: Rule[] = [
  // ── Alat Kesehatan (85–95) ─────────────────────────────────────────────
  {
    score: 95, kategori: 'alkes', label: 'alat kesehatan utama',
    keywords: [
      'alat kesehatan','alkes','peralatan kesehatan','peralatan medis',
      'alat medis','medical device','medical equipment',
    ],
  },
  {
    score: 90, kategori: 'alkes', label: 'APD & habis pakai medis',
    keywords: [
      'apd','alat pelindung diri','masker medis','masker n95','masker kn95',
      'sarung tangan medis','sarung tangan latex','hazmat','baju pelindung',
      'jarum suntik','spuit','infus set','kateter','nasogastric','selang oksigen',
      'nebulizer','pulse oximeter','tensimeter','stetoskop','termometer',
    ],
  },
  {
    score: 88, kategori: 'alkes', label: 'peralatan diagnostik',
    keywords: [
      'ecg','ekg','elektrokardiogram','usg','ultrasonografi','x-ray','rontgen',
      'ct scan','mri','endoskopi','laparoskopi','inkubator bayi','defibrilator',
      'ventilator','oksigen konsentrator','autoclave','sterilisator',
    ],
  },
  {
    score: 85, kategori: 'alkes', label: 'habis pakai rumah sakit',
    keywords: [
      'plester','perban','kasa steril','kapas','pembalut','betadine','alkohol 70',
      'cairan infus','nacl','ringer laktat','dextrose','obat-obatan','farmasi',
      'bahan habis pakai','bhp medis','suplemen','vitamin',
    ],
  },

  // ── Pest Control (85–92) ───────────────────────────────────────────────
  {
    score: 92, kategori: 'pest_control', label: 'pest control & fumigasi',
    keywords: [
      'pest control','pengendalian hama','fumigasi','fogging','thermal fogging',
      'pengasapan','disinseksi','desinsektisasi','disinfestasi',
    ],
  },
  {
    score: 88, kategori: 'pest_control', label: 'pengendalian vektor',
    keywords: [
      'nyamuk','tikus','kecoa','rayap','lalat','kutu','tungau','semut','ular',
      'pengendalian vektor','vector control','insektisida','rodentisida',
      'pestisida','herbisida','termitisida','racun tikus',
    ],
  },

  // ── Laboratorium (85–93) ───────────────────────────────────────────────
  {
    score: 93, kategori: 'lab', label: 'reagen & bahan kimia lab',
    keywords: [
      'reagen','reagent','bahan kimia','chemical','larutan buffer','media kultur',
      'media tanam','agar','pcr','elisa','western blot','antibodi','antigen',
      'strip test','rapid test','kit diagnostik','test kit',
    ],
  },
  {
    score: 88, kategori: 'lab', label: 'peralatan laboratorium',
    keywords: [
      'laboratorium','lab kesehatan','lab klinik','lab patologi','lab mikro',
      'sentrifus','centrifuge','mikropipet','micropipette','spektrofotometer',
      'inkubator lab','freezer lab','lemari pendingin lab','autoklaf',
      'biosafety cabinet','laminar flow','timbangan analitik','ph meter',
      'vortex','magnetic stirrer','hotplate','tabung reaksi','cawan petri',
      'erlenmeyer','buret','pipet','labu ukur','cover glass','object glass',
    ],
  },

  // ── Sanitasi & Desinfeksi (70–82) ────────────────────────────────────
  {
    score: 82, kategori: 'sanitasi', label: 'desinfektan & antiseptik',
    keywords: [
      'desinfektan','disinfektan','antiseptik','hand sanitizer','hand rub',
      'cairan pembersih','pembersih lantai rumah sakit','klorin','hipoklorit',
      'hidrogen peroksida','quaternary ammonium','lysol','wipol','povidone',
    ],
  },
  {
    score: 75, kategori: 'sanitasi', label: 'kebersihan & sanitasi fasilitas',
    keywords: [
      'kebersihan','sanitasi','higiene','hygiene','sterilisasi ruangan',
      'uv sterilizer','ozon sterilizer','air purifier','hepa filter',
      'ipal','pengolahan limbah','limbah medis','b3','incinerator',
      'kantong sampah medis','sharp container','safety box',
    ],
  },
  {
    score: 70, kategori: 'sanitasi', label: 'laundry & linen RS',
    keywords: [
      'linen rumah sakit','laundry rs','baju operasi','scrub suit','linen medis',
      'sprei rs','selimut rs','handuk rs','deterjen rs',
    ],
  },
];

// Kata kunci tidak relevan — kurangi score kalau ada
const IRRELEVANT_KEYWORDS = [
  'konstruksi','bangunan','gedung','jalan','jembatan','irigasi','drainase',
  'kendaraan','mobil','motor','bus','truk','kapal',
  'atk','alat tulis','kertas','tinta printer',
  'komputer','laptop','server','jaringan','it ','software',
  'makan','minum','catering','konsumsi rapat',
  'pakaian dinas','seragam','sepatu dinas',
];

export function scorePackage(
  namaPaket: string,
  namaInstansi?: string | null,
  jenisPengadaan?: string | null,
): ScoreResult {
  const haystack = [namaPaket, namaInstansi, jenisPengadaan]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let best: Rule | null = null;

  for (const rule of RULES) {
    if (rule.keywords.some((kw) => haystack.includes(kw))) {
      if (!best || rule.score > best.score) {
        best = rule;
      }
    }
  }

  // Penalti jika ada kata tidak relevan
  const hasIrrelevant = IRRELEVANT_KEYWORDS.some((kw) => haystack.includes(kw));

  if (best) {
    const score = hasIrrelevant
      ? Math.max(40, best.score - 20)
      : best.score;

    return {
      score,
      kategori: best.kategori,
      notes: hasIrrelevant
        ? `Terdeteksi sebagai ${best.label}, namun mengandung komponen tidak relevan. Perlu verifikasi manual.`
        : `Terdeteksi sebagai ${best.label}. Paket ini relevan untuk supplier ${best.kategori === 'alkes' ? 'alat kesehatan' : best.kategori === 'pest_control' ? 'pest control' : best.kategori === 'lab' ? 'laboratorium' : 'sanitasi'}.`,
    };
  }

  // Tidak ada match sama sekali
  return {
    score:    hasIrrelevant ? 5 : 15,
    kategori: 'lainnya',
    notes:    'Tidak ditemukan kata kunci yang relevan dengan produk/jasa alkes, pest control, atau laboratorium.',
  };
}
