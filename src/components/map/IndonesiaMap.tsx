import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import type { GeoJsonObject, Feature as GeoFeature } from 'geojson';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CircleMarker, GeoJSON, MapContainer, TileLayer, Tooltip } from 'react-leaflet';

export type ProvinceData = {
  count: number;
  value: number;
};

export type ProspectPin = {
  id:     number;
  lat:    number;
  lng:    number;
  nama:   string;
  sektor: string;
  status: string;
  rating: number | null;
};

export interface IndonesiaMapProps {
  data?:          Record<string, ProvinceData>;
  selected?:      string | null;
  onProvSelected?: (province: string) => void;
  mode?:          'b2g' | 'b2b';
  prospects?:     ProspectPin[];
  onPinSelect?:   (id: number) => void;
}

// Centroids [lat, lng] computed from province geometry
const CENTROIDS: Record<string, [number, number]> = {
  Aceh: [3.7582, 96.7701],
  Bali: [-8.4844, 115.1033],
  'Bangka-Belitung': [-2.5907, 106.8413],
  Banten: [-6.3796, 105.9527],
  Bengkulu: [-3.9611, 102.6071],
  Gorontalo: [0.7214, 122.4101],
  'Jakarta Raya': [-6.2201, 106.8216],
  Jambi: [-1.5464, 102.9557],
  'Jawa Barat': [-6.8079, 107.6202],
  'Jawa Tengah': [-7.1998, 110.0715],
  'Jawa Timur': [-7.4419, 113.6028],
  'Kalimantan Barat': [-0.4897, 110.2956],
  'Kalimantan Selatan': [-3.1178, 115.9037],
  'Kalimantan Tengah': [-1.4705, 113.2112],
  'Kalimantan Timur': [0.1005, 117.071],
  'Kalimantan Utara': [3.2532, 116.9067],
  'Kepulauan Riau': [1.4008, 105.2212],
  Lampung: [-5.2263, 105.0433],
  Maluku: [-5.9647, 131.8052],
  'Maluku Utara': [-0.2065, 127.3892],
  'Nusa Tenggara Barat': [-8.4463, 117.6804],
  'Nusa Tenggara Timur': [-9.0709, 122.101],
  Papua: [-4.4432, 137.569],
  'Papua Barat': [-2.0297, 132.4397],
  Riau: [0.6869, 102.2709],
  'Sulawesi Barat': [-2.3769, 119.3354],
  'Sulawesi Selatan': [-4.7998, 120.2613],
  'Sulawesi Tengah': [-1.0963, 121.9839],
  'Sulawesi Tenggara': [-4.6777, 122.553],
  'Sulawesi Utara': [2.3477, 125.2393],
  'Sumatera Barat': [-1.494, 100.1288],
  'Sumatera Selatan': [-2.9378, 104.2651],
  'Sumatera Utara': [2.1106, 98.6792],
  Yogyakarta: [-7.905, 110.4878],
};

type ProvFeature = GeoFeature & { properties: { state: string } };

function choroplethColor(count: number, max: number): string {
  if (!count || max === 0) return 'rgba(22, 29, 40, 0.7)';
  const r = count / max;
  if (r < 0.2) return 'rgba(29,158,117,0.65)';
  if (r < 0.45) return 'rgba(46,160,67,0.70)';
  if (r < 0.70) return 'rgba(210,153,34,0.75)';
  return 'rgba(218,54,51,0.80)';
}

function bubbleRadius(count: number, max: number): number {
  if (!count || max === 0) return 0;
  return 7 + (count / max) * 22;
}

function fmtRupiah(v: number): string {
  if (v >= 1e12) return `Rp ${(v / 1e12).toFixed(1)}T`;
  if (v >= 1e9) return `Rp ${(v / 1e9).toFixed(1)}M`;
  if (v >= 1e6) return `Rp ${(v / 1e6).toFixed(1)}Jt`;
  return `Rp ${v.toLocaleString('id-ID')}`;
}

function tooltipHtml(name: string, prov: ProvinceData, mode: 'b2g' | 'b2b'): string {
  const label = mode === 'b2g' ? 'Paket' : 'Prospek';
  return `
    <div style="background:#161d28;border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:8px 12px;font-family:Inter,sans-serif;min-width:160px;pointer-events:none">
      <div style="font-size:11px;font-weight:600;color:#e6edf3;margin-bottom:4px">${name}</div>
      <div style="font-size:10px;color:#7d8590">${label}: <span style="color:#3fb950;font-weight:600">${prov.count.toLocaleString('id-ID')}</span></div>
      <div style="font-size:10px;color:#7d8590">Nilai: <span style="color:#388bfd;font-weight:600">${fmtRupiah(prov.value)}</span></div>
    </div>`;
}

const PIN_STATUS_COLOR: Record<string, string> = {
  baru:         '#388bfd',
  dihubungi:    '#d29922',
  negosiasi:    '#a78bfa',
  deal:         '#3fb950',
  tidak_sesuai: '#7d8590',
};

function pinTooltipHtml(p: ProspectPin): string {
  const color = PIN_STATUS_COLOR[p.status] ?? '#7d8590';
  const star   = p.rating ? `⭐ ${p.rating.toFixed(1)}` : '';
  return `
    <div style="background:#161d28;border:1px solid rgba(255,255,255,0.12);border-radius:6px;padding:8px 12px;font-family:Inter,sans-serif;min-width:160px;pointer-events:none">
      <div style="font-size:11px;font-weight:600;color:#e6edf3;margin-bottom:4px">${p.nama}</div>
      <div style="font-size:10px;color:#7d8590">${p.sektor} ${star}</div>
      <div style="font-size:10px;margin-top:3px;color:${color};font-weight:600">${p.status.replace('_', ' ')}</div>
    </div>`;
}

export function IndonesiaMap({
  data = {},
  selected,
  onProvSelected,
  mode = 'b2g',
  prospects = [],
  onPinSelect,
}: IndonesiaMapProps) {
  const [geoData, setGeoData] = useState<GeoJsonObject | null>(null);

  useEffect(() => {
    fetch('/indonesia-provinces.geojson')
      .then((r) => r.json())
      .then(setGeoData);
  }, []);

  const maxCount = useMemo(
    () => Math.max(...Object.values(data).map((d) => d.count), 1),
    [data],
  );

  const accentHex = mode === 'b2b' ? '#1d9e75' : '#3fb950';

  const getStyle = useCallback(
    (feature: ProvFeature | undefined) => {
      const name = feature?.properties?.state ?? '';
      const count = data[name]?.count ?? 0;
      const isSel = selected === name;
      return {
        fillColor: isSel ? accentHex : choroplethColor(count, maxCount),
        fillOpacity: isSel ? 0.95 : count ? 0.70 : 0.35,
        weight: isSel ? 2.5 : 1,
        color: isSel ? '#ffffff' : 'rgba(255,255,255,0.15)',
        opacity: 1,
      };
    },
    [data, maxCount, selected, accentHex],
  );

  const onEachFeature = useCallback(
    (feature: ProvFeature, layer: L.Layer) => {
      const name = feature.properties?.state;
      const path = layer as L.Path;
      const prov = data[name];

      path.on({
        mouseover() {
          path.setStyle({ weight: 2, color: 'rgba(255,255,255,0.55)', fillOpacity: 0.92 });
          (path as L.Polyline).bringToFront?.();
        },
        mouseout() {
          const count = data[name]?.count ?? 0;
          const isSel = selected === name;
          path.setStyle({
            fillColor: isSel ? accentHex : choroplethColor(count, maxCount),
            fillOpacity: isSel ? 0.95 : count ? 0.70 : 0.35,
            weight: isSel ? 2.5 : 1,
            color: isSel ? '#ffffff' : 'rgba(255,255,255,0.15)',
          });
        },
        click() {
          onProvSelected?.(name);
        },
      });

      if (prov) {
        path.bindTooltip(tooltipHtml(name, prov, mode), {
          sticky: true,
          opacity: 1,
          className: 'scope-tooltip',
        });
      }
    },
    [data, maxCount, selected, accentHex, mode, onProvSelected],
  );

  if (!geoData) {
    return (
      <div className="flex-1 grid place-items-center text-muted-foreground text-xs">
        Memuat peta…
      </div>
    );
  }

  const geoKey = `${Object.keys(data).join(',')}-${selected}-${mode}`;

  return (
    <div className="relative flex-1 min-h-0">
      <MapContainer
        center={[-2.5, 118]}
        zoom={5}
        minZoom={4}
        maxZoom={10}
        style={{ height: '100%', width: '100%', background: '#0a0e14' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <GeoJSON
          key={geoKey}
          data={geoData}
          style={(f) => getStyle(f as ProvFeature)}
          onEachFeature={(f, l) => onEachFeature(f as ProvFeature, l)}
        />

        {Object.entries(data).map(([name, prov]) => {
          const center = CENTROIDS[name];
          if (!center || !prov.count) return null;
          const r = bubbleRadius(prov.count, maxCount);
          return (
            <CircleMarker
              key={name}
              center={center}
              radius={r}
              pathOptions={{
                fillColor: accentHex,
                fillOpacity: 0.75,
                color: '#0a0e14',
                weight: 1.5,
              }}
              eventHandlers={{ click: () => onProvSelected?.(name) }}
            >
              <Tooltip sticky opacity={1} className="scope-tooltip">
                <div dangerouslySetInnerHTML={{ __html: tooltipHtml(name, prov, mode) }} />
              </Tooltip>
            </CircleMarker>
          );
        })}

        {prospects.map((pin) => {
          const color = PIN_STATUS_COLOR[pin.status] ?? '#7d8590';
          return (
            <CircleMarker
              key={`pin-${pin.id}`}
              center={[pin.lat, pin.lng]}
              radius={7}
              pathOptions={{
                fillColor:    color,
                fillOpacity:  0.9,
                color:        '#0a0e14',
                weight:       1.5,
              }}
              eventHandlers={{ click: () => onPinSelect?.(pin.id) }}
            >
              <Tooltip sticky opacity={1} className="scope-tooltip">
                <div dangerouslySetInnerHTML={{ __html: pinTooltipHtml(pin) }} />
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card border border-border rounded-md px-3 py-2 text-[10px] space-y-1.5 shadow-lg">
        <div className="text-muted-foreground uppercase tracking-wider font-medium mb-1">
          {mode === 'b2g' ? 'Paket B2G' : 'Prospek B2B'}
        </div>
        {mode === 'b2b' && prospects.length > 0
          ? [
              { color: PIN_STATUS_COLOR.baru,         label: 'Baru' },
              { color: PIN_STATUS_COLOR.dihubungi,     label: 'Dihubungi' },
              { color: PIN_STATUS_COLOR.negosiasi,     label: 'Negosiasi' },
              { color: PIN_STATUS_COLOR.deal,          label: 'Deal' },
              { color: PIN_STATUS_COLOR.tidak_sesuai,  label: 'Tidak Sesuai' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))
          : [
              { color: 'rgba(218,54,51,0.80)', label: 'Tinggi' },
              { color: 'rgba(210,153,34,0.75)', label: 'Sedang-Tinggi' },
              { color: 'rgba(46,160,67,0.70)', label: 'Sedang-Rendah' },
              { color: 'rgba(29,158,117,0.65)', label: 'Rendah' },
              { color: 'rgba(22,29,40,0.7)', label: 'Belum ada data' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-sm border border-white/10 shrink-0" style={{ background: color }} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))
        }
      </div>

      {/* Attribution */}
      <div className="absolute bottom-1 right-2 z-[1000] text-[9px] text-muted-foreground/40 pointer-events-none">
        © OpenStreetMap · CARTO
      </div>
    </div>
  );
}
