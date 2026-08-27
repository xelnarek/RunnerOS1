import type { Activity } from './types';

export function weekDistanceKm(activities: Activity[], now = Date.now()) {
  const start = now - 7 * 86400000;
  return activities.filter(a => a.startedAt >= start).reduce((s, a) => s + a.distanceM, 0) / 1000;
}

export function monthDistanceKm(activities: Activity[], now = Date.now()) {
  const start = now - 30 * 86400000;
  return activities.filter(a => a.startedAt >= start).reduce((s, a) => s + a.distanceM, 0) / 1000;
}

export function bestActivity(activities: Activity[]) {
  return activities.filter(a => a.distanceM > 0 && a.avgPaceSecPerKm).sort((a,b) => (a.avgPaceSecPerKm! - b.avgPaceSecPerKm!))[0] ?? null;
}

export function consistencyScore(activities: Activity[], now = Date.now()) {
  const windowStart = now - 28 * 86400000;
  const recent = activities.filter(a => a.startedAt >= windowStart);
  const activeWeeks = new Set(recent.map(a => Math.max(0, Math.min(3, Math.floor((a.startedAt - windowStart) / (7 * 86400000)))))).size;
  return Math.min(100, Math.round((activeWeeks / 4) * 100));
}

export function weeklySeries(activities: Activity[], now=Date.now()){
  return Array.from({length:8},(_,i)=>{
    const end=now-(7-i)*86400000, start=end-7*86400000;
    return {label:`T${i+1}`, km:activities.filter(a=>a.startedAt>=start&&a.startedAt<end).reduce((s,a)=>s+a.distanceM,0)/1000};
  });
}

export function trainingLoad(a: Activity){
  const paceFactor = a.avgPaceSecPerKm ? Math.max(0.65, Math.min(1.7, 300 / a.avgPaceSecPerKm)) : 1;
  const distanceFactor = a.distanceM / 1000;
  return Math.round(distanceFactor * paceFactor * (a.movingSec / 3600 + 0.5) * 20);
}

export function recoveryHint(activities: Activity[], now=Date.now()){
  const last=activities.filter(a=>a.startedAt<=now).sort((a,b)=>b.startedAt-a.startedAt)[0];
  if(!last) return {score:100,label:'Gotowy',detail:'Brak ostatniego obciążenia.'};
  const hours=Math.max(0,(now-last.endedAt!)/3600000);
  const load=trainingLoad(last);
  const score=Math.max(0,Math.min(100,Math.round(100-(load*1.4)+hours*3)));
  const label=score>=75?'Gotowy':score>=50?'Lekki trening':'Regeneracja';
  return {score,label,detail:`Szacunkowa regeneracja po ostatnim treningu (${Math.round(load)} load).`};
}
