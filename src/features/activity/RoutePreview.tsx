import type { GeoPoint } from '../../core/types';
import './route-preview.css';

export default function RoutePreview({points}:{points:GeoPoint[]}){
  if(points.length<2) return <div className="route-empty">Za mało punktów GPS, aby narysować trasę.</div>;
  const minLat=Math.min(...points.map(p=>p.lat)), maxLat=Math.max(...points.map(p=>p.lat));
  const minLng=Math.min(...points.map(p=>p.lng)), maxLng=Math.max(...points.map(p=>p.lng));
  const dx=Math.max(maxLng-minLng,0.00001),dy=Math.max(maxLat-minLat,0.00001);
  const pad=18;
  const path=points.map((p,i)=>{const x=pad+((p.lng-minLng)/dx)*(100-pad*2);const y=pad+(1-(p.lat-minLat)/dy)*(100-pad*2);return `${i?'L':'M'} ${x.toFixed(2)} ${y.toFixed(2)}`}).join(' ');
  return <div className="route-preview"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Podgląd trasy"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeOpacity=".08" strokeWidth=".35"/></pattern></defs><rect width="100" height="100" fill="url(#grid)"/><path d={path} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/><circle cx={pad+((points[0].lng-minLng)/dx)*(100-pad*2)} cy={pad+(1-(points[0].lat-minLat)/dy)*(100-pad*2)} r="2" fill="currentColor"/><circle cx={pad+((points.at(-1)!.lng-minLng)/dx)*(100-pad*2)} cy={pad+(1-(points.at(-1)!.lat-minLat)/dy)*(100-pad*2)} r="2" fill="currentColor"/></svg><div className="route-label"><span>START</span><span>KONIEC</span></div></div>
}
