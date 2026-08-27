import type { Activity } from './types';
const KEY='runneros.activities.v2';

export function loadActivities():Activity[]{
  try{
    const value=JSON.parse(localStorage.getItem(KEY)||'[]');
    return Array.isArray(value)?value:[];
  }catch{return[];}
}
export function saveActivities(items:Activity[]){ localStorage.setItem(KEY,JSON.stringify(items)); }
export function upsertActivity(activity:Activity){ const next=[activity,...loadActivities().filter(a=>a.id!==activity.id)]; saveActivities(next); return next; }
export function deleteActivity(id:string){ const next=loadActivities().filter(a=>a.id!==id); saveActivities(next); return next; }
export function exportActivitiesJson(items=loadActivities()){
  const blob=new Blob([JSON.stringify(items,null,2)],{type:'application/json'});
  return URL.createObjectURL(blob);
}
export function exportActivityGpx(activity:Activity){
  const esc=(s:string)=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const trk=activity.points.map(p=>`<trkpt lat="${p.lat}" lon="${p.lng}"><ele>${p.altitude??0}</ele><time>${new Date(p.ts).toISOString()}</time></trkpt>`).join('');
  const xml=`<?xml version="1.0" encoding="UTF-8"?><gpx version="1.1" creator="RunnerOS"><trk><name>${esc('RunnerOS '+new Date(activity.startedAt).toLocaleString('pl-PL'))}</name><trkseg>${trk}</trkseg></trk></gpx>`;
  return URL.createObjectURL(new Blob([xml],{type:'application/gpx+xml'}));
}
