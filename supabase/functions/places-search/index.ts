// Edge Function: places-search
// Query Google Places API → upsert ke b2b_prospects
// Secret yang harus di-set: supabase secrets set GOOGLE_PLACES_API_KEY=AIza...

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const PLACES_URL = 'https://places.googleapis.com/v1/places:searchText';

interface PlacesBody {
  keyword:  string;
  kota:     string;
  sektor:   string;
  provinsi?: string;
  maxResults?: number;
}

interface PlaceResult {
  id:          string;
  displayName: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  location?: { latitude: number; longitude: number };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json() as PlacesBody;
    const { keyword, kota, sektor, provinsi, maxResults = 20 } = body;

    if (!keyword || !kota) {
      return new Response(
        JSON.stringify({ error: 'keyword dan kota wajib diisi' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY belum di-set di Supabase secrets' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Panggil Google Places API v1 (New)
    const placesRes = await fetch(PLACES_URL, {
      method: 'POST',
      headers: {
        'Content-Type':       'application/json',
        'X-Goog-Api-Key':     apiKey,
        'X-Goog-FieldMask':   [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.nationalPhoneNumber',
          'places.websiteUri',
          'places.rating',
          'places.userRatingCount',
          'places.location',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery:           `${keyword} ${kota}`,
        maxResultCount:      Math.min(maxResults, 20),
        languageCode:        'id',
        locationBias: {
          circle: {
            center: { latitude: -2.5, longitude: 118 },
            radius: 5_000_000,
          },
        },
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!placesRes.ok) {
      const err = await placesRes.text();
      console.error('[places-search] Google API error:', err);
      return new Response(
        JSON.stringify({ error: 'Google Places API error', detail: err }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const placesData = await placesRes.json();
    const places: PlaceResult[] = placesData.places ?? [];

    const rows = places.map((p) => ({
      place_id:      p.id,
      nama:          p.displayName?.text ?? '',
      alamat:        p.formattedAddress   ?? null,
      telepon:       p.nationalPhoneNumber ?? null,
      website:       p.websiteUri         ?? null,
      rating:        p.rating             ?? null,
      total_reviews: p.userRatingCount    ?? 0,
      lat:           p.location?.latitude  ?? null,
      lng:           p.location?.longitude ?? null,
      sektor,
      kota,
      provinsi:      provinsi ?? null,
      synced_at:     new Date().toISOString(),
    }));

    if (rows.length > 0) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );
      const { error: upsertErr } = await supabase
        .from('b2b_prospects')
        .upsert(rows, { onConflict: 'place_id', ignoreDuplicates: false });
      if (upsertErr) console.error('[places-search] upsert error:', upsertErr.message);
    }

    return new Response(
      JSON.stringify({ total: rows.length, data: rows }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[places-search]', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
