import type { Activity } from "../../core/types";
import { bestActivity, consistencyScore, monthDistanceKm, weekDistanceKm, weeklySeries, recoveryHint, trainingLoad } from "../../core/analytics";

const pace=(s?:number)=>s?`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,"0")}`:"--:--";

export default function TrainingOverview({activities}:{activities:Activity[]}){
  const best=bestActivity(activities); const recovery=recoveryHint(activities); const weeks=weeklySeries(activities); const totalLoad=activities.reduce((s,a)=>s+trainingLoad(a),0);
  const max=Math.max(1,...weeks.map(x=>x.km));
  return <>
    <div className="overview-grid">
      <div className="insight-card"><span>7 DNI</span><strong>{weekDistanceKm(activities).toFixed(1)} km</strong><small>aktualny kilometraż</small></div>
      <div className="insight-card"><span>30 DNI</span><strong>{monthDistanceKm(activities).toFixed(1)} km</strong><small>miesięczny kilometraż</small></div>
      <div className="insight-card"><span>REGULARNOŚĆ</span><strong>{consistencyScore(activities)}%</strong><small>aktywne tygodnie</small></div>
      <div className="insight-card"><span>RECOVERY</span><strong>{recovery.score}%</strong><small>{recovery.label}</small></div>
      <div className="insight-card"><span>NAJLEPSZE ŚR. TEMPO</span><strong>{pace(best?.avgPaceSecPerKm)}</strong><small>{best ? `${(best.distanceM/1000).toFixed(2)} km` : "brak danych"}</small></div>
      <div className="insight-card"><span>ŁĄCZNY LOAD</span><strong>{totalLoad}</strong><small>wskaźnik treningowy</small></div>
    </div>
    <div className="chart-card"><div className="eyebrow">KILOMETRAŻ • 8 TYGODNI</div><div className="bars">{weeks.map(w=><div className="bar-col" key={w.label}><div className="bar" style={{height:`${Math.max(5,(w.km/max)*100)}%`}}/><span>{w.label}</span><b>{w.km.toFixed(1)}</b></div>)}</div></div>
  </>;
}
