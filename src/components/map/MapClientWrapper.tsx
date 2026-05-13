import { lazy, Suspense, useEffect, useState } from 'react';
import type { IndonesiaMapProps } from './IndonesiaMap';

// Lazy-load Leaflet only on the client — Leaflet requires `window` and cannot run on the server.
const LazyMap = lazy(() =>
  import('./IndonesiaMap').then((m) => ({ default: m.IndonesiaMap })),
);

function MapSkeleton() {
  return (
    <div className="flex-1 grid place-items-center text-muted-foreground text-xs">
      <span className="animate-pulse">Memuat peta…</span>
    </div>
  );
}

export function MapClientWrapper(props: IndonesiaMapProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <MapSkeleton />;

  return (
    <Suspense fallback={<MapSkeleton />}>
      <LazyMap {...props} />
    </Suspense>
  );
}
