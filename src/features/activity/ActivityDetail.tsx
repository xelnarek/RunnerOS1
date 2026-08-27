import { ArrowLeft, Download, Route, TrendingUp, Timer, HeartPulse, Gauge } from 'lucide-react';
import RoutePreview from './RoutePreview';
import type { Activity } from '../../core/types';
import { exportActivityGpx } from '../../core/storage';
import './activity.css';

const fmt=(s:number)=>`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const pace=(s?:number)=>s?`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`:'--:--';

export default function ActivityDetail({activity,onBack}:{activity:Activity;onBack:()=>void}){
  const dl=()=>{const url=exportActivityGpx(activity);const a=document.createElement('a');a.href=url;a.download=`runneros-${activity.id}.gpx`;a.click();setTimeout(()=>URL.revokeObjectURL(url),500);};
  return <section className="detail">
    <button className="back" onClick={onBack}><ArrowLeft size={18}/> Historia</button>
    <div className="detail-title"><div><div className="eyebrow">BIEG • {new Date(activity.startedAt).toLocaleDateString('pl-PL')}</div><h1>{(activity.distanceM/1000).toFixed(2)} km</h1><p>{new Date(activity.startedAt).toLocaleTimeString('pl-PL',{hour:'2-digit',minute:'2-digit'})}</p></div><button className="icon-btn" onClick={dl}><Download size={19}/></button></div>
    <div className="hero-grid"><div><b>{fmt(activity.durationSec)}</b><span>CZAS</span></div><div><b>{pace(activity.avgPaceSecPerKm)}</b><span>MIN/KM</span></div><div><b>+{activity.elevationGainM.toFixed(0)}</b><span>WZNIESIENIE</span></div><div><b>{Math.round(activity.movingSec/60)} min</b><span>W RUCHU</span></div></div>
    <div className="map-panel"><RoutePreview points={activity.points}/></div>
    <div className="panel"><div className="eyebrow">SPLITY</div><h2>Kilometr po kilometrze</h2>{activity.splitsSecPerKm.length===0?<p className="muted">Za mało danych na pełne splity.</p>:<div className="splits">{activity.splitsSecPerKm.map((s,i)=><div key={i}><span>{i+1}</span><b>{pace(s)}</b><em>min/km</em></div>)}</div>}</div>
    <div className="panel two"><div><TrendingUp/><b>{activity.maxSpeedMps?(activity.maxSpeedMps*3.6).toFixed(1):'0.0'} km/h</b><span>max prędkość</span></div><div><Route/><b>{activity.points.length}</b><span>punkty GPS</span></div><div><Timer/><b>{Math.round(activity.pausedSec/60)} min</b><span>pauza</span></div><div><HeartPulse/><b>{activity.heartRateAvg??'--'} bpm</b><span>średnie tętno</span></div><div><Gauge/><b>{activity.avgSpeedMps?(activity.avgSpeedMps*3.6).toFixed(1):'0.0'} km/h</b><span>średnia prędkość</span></div></div>
  </section>
}
