import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoPoint } from '../../core/types';
import 'maplibre-gl/dist/maplibre-gl.css';
import './map.css';

type Props = { points?: GeoPoint[]; center?: [number, number]; follow?: boolean };
const FALLBACK: [number, number] = [17.0385, 51.1079];

function styleUrl() {
  return import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';
}

export default function MapView({ points = [], center, follow = false }: Props) {
  const host = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const route = useRef<maplibregl.GeoJSONSource | null>(null);

  useEffect(() => {
    if (!host.current) return;
    const first = points.at(0);
    const initial: [number, number] = center || (first ? [first.lng, first.lat] : FALLBACK);
    const m = new maplibregl.Map({ container: host.current, style: styleUrl(), center: initial, zoom: first ? 14 : 11 });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    m.on('load', () => {
      m.addSource('runneros-route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } });
      m.addLayer({ id: 'runneros-route-line', type: 'line', source: 'runneros-route', paint: { 'line-width': 5, 'line-color': '#111827', 'line-opacity': 0.9 } });
      route.current = m.getSource('runneros-route') as maplibregl.GeoJSONSource;
      updateRoute(points, route.current, m, follow);
    });
    map.current = m;
    return () => { route.current = null; m.remove(); map.current = null; };
  }, []);

  useEffect(() => {
    if (!route.current || !map.current) return;
    updateRoute(points, route.current, map.current, follow);
  }, [points, follow]);

  return <div ref={host} className="map-view" aria-label="Mapa treningu" />;
}

function updateRoute(points: GeoPoint[], source: maplibregl.GeoJSONSource, map: maplibregl.Map, follow: boolean) {
  const coords = points.map(p => [p.lng, p.lat] as [number, number]);
  source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } });
  if (!coords.length) return;
  if (follow) {
    map.easeTo({ center: coords.at(-1)!, duration: 350 });
  }
}
