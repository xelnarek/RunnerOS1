import { useMemo, useState } from 'react';
import { LocateFixed, Navigation, Route, Target } from 'lucide-react';
import MapView from './MapView';
import type { Activity } from '../../core/types';

export default function RoutesScreen({activities}:{activities:Activity[]}){
  const [follow,setFollow]=useState(false);
  const recent=useMemo(()=>activities[0]?.points ?? [],[activities]);
  const last=recent.at(-1);
  return <section className="panel routes-screen">
    <div className="panel-head"><div><div className="eyebrow">MAPA</div><h2>Trasy i nawigacja</h2></div><button className={follow?'icon-btn active':''} onClick={()=>setFollow(v=>!v)} title="Śledź pozycję"><LocateFixed size={18}/></button></div>
    <div className="map-shell"><MapView points={recent} follow={follow}/><div className="map-badge"><Navigation size={14}/> {last?`${last.lat.toFixed(5)}, ${last.lng.toFixed(5)}`:'Wrocław • widok startowy'}</div></div>
    <div className="route-tools"><button className="tool-card"><Route/><b>Buduj trasę</b><span>Pętla, dystans, teren</span></button><button className="tool-card"><Target/><b>Zaproponuj bieg</b><span>Na bazie historii</span></button></div>
  </section>
}
