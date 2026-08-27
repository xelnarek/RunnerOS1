import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Activity as ActivityIcon, BarChart3, Download, Home, Compass, Users, UserCircle, LogOut } from 'lucide-react';
import RecordScreen from './features/record/RecordScreen';
import ActivityDetail from './features/activity/ActivityDetail';
import { exportActivitiesJson, deleteActivity, loadActivities, saveActivities } from './core/storage';
import { deleteActivityDb, loadActivitiesDb, saveActivitiesDb } from './core/db/activityDb';
import { distance,elevationGain,maxSpeed,paceSecPerKm,splits } from './core/metrics';
import TrainingOverview from './features/profile/TrainingOverview';
import HealthConnectCard from './features/profile/HealthConnectCard';
import HeartRateCard from './features/profile/HeartRateCard';
import SyncStatus from './features/status/SyncStatus';
import ExploreScreen from './features/explore/ExploreScreen';
import { enqueue } from './core/sync/syncQueue';
import { clearAuth, loadAuth } from './core/auth';
import DiagnosticsScreen from './features/diagnostics/DiagnosticsScreen';
import PlanScreen from './features/plan/PlanScreen';
import GearCard from './features/profile/GearCard';
import AudioSettingsCard from './features/profile/AudioSettingsCard';
import { flushSync } from './core/sync/syncQueue';
import AuthScreen from './features/auth/AuthScreen';
import { api } from './core/api/client';
import type { Activity, GeoPoint } from './core/types';
import { Target as TargetIcon } from 'lucide-react';
import WorkoutScreen from './features/workout/WorkoutScreen';
import { updateActivityGear } from './core/workout/gear';

export default function App(){
  const [auth,setAuth]=useState(loadAuth());
  const [backend,setBackend]=useState<'unknown'|'online'|'offline'>('unknown');
  const [tab,setTab]=useState<'home'|'record'|'history'|'plan'|'explore'|'profile'>('home');
  const [activities,setActivities]=useState<Activity[]>(loadActivities());
  const [selected,setSelected]=useState<Activity|null>(null);
  const [storageMode,setStorageMode]=useState<'migrating'|'indexeddb'|'local'>('migrating');
  const [plannedWorkoutId,setPlannedWorkoutId]=useState<string|undefined>();

  useEffect(()=>{ api.health().then(()=>setBackend('online')).catch(()=>setBackend('offline')); },[]);
  useEffect(()=>{ if(!auth.token || backend!=='online') return; const run=()=>flushSync(`${import.meta.env.VITE_API_URL||''}/v1/sync`,auth.token).catch(()=>null); run(); const id=window.setInterval(run,30000); return()=>window.clearInterval(id); },[auth.token,backend]);
  useEffect(()=>{ let live=true; loadActivitiesDb().then(items=>{ if(!live)return; setActivities(items); setStorageMode('indexeddb'); }).catch(()=>setStorageMode('local')); return()=>{live=false}},[]);
  const totals=useMemo(()=>({km:activities.reduce((s,a)=>s+a.distanceM,0)/1000,elev:activities.reduce((s,a)=>s+a.elevationGainM,0)}),[activities]);
  async function finish(points:GeoPoint[],startedAt:number,endedAt:number,durationSec:number,movingSec:number,heartRate?:number,type:Activity['type']='run',workoutId?:string){
    const d=distance(points); const a:Activity={id:crypto.randomUUID(),type,startedAt,endedAt,durationSec,movingSec,pausedSec:Math.max(0,durationSec-movingSec),distanceM:d,elevationGainM:elevationGain(points),avgPaceSecPerKm:paceSecPerKm(d,movingSec),maxSpeedMps:maxSpeed(points),avgSpeedMps:d/Math.max(1,movingSec),heartRateAvg:heartRate,points,splitsSecPerKm:splits(points),status:'completed',workoutId};
    const next=[a,...activities]; setActivities(next);
    enqueue({entity:'activity', action:'upsert', payload:a}); setSelected(a); setTab('history');
    try { await saveActivitiesDb(next); setStorageMode('indexeddb'); } catch { saveActivities(next); setStorageMode('local'); }
  }
  async function remove(id:string){const next=activities.filter(a=>a.id!==id);setActivities(next);setSelected(null);try{await deleteActivityDb(id)}catch{deleteActivity(id)}}
  function downloadAll(){const url=exportActivitiesJson(activities);const a=document.createElement('a');a.href=url;a.download='runneros-activities.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),500)}
  if(!auth.token && backend==='online') return <AuthScreen onAuthenticated={()=>setAuth(loadAuth())}/>;
  const nav: [string, any, string][]=[['home',Home,'Start'],['record',ActivityIcon,'Trenuj'],['history',BarChart3,'Historia'],['plan',TargetIcon,'Plan'],['explore',Compass,'Explore'],['profile',UserCircle,'Profil']];
  if(selected) return <Shell nav={nav} tab={tab} setTab={(t)=>{setSelected(null);setTab(t)}}><ActivityDetail activity={selected} onBack={()=>setSelected(null)}/></Shell>;
  return <Shell nav={nav} tab={tab} setTab={setTab} onLogout={()=>{clearAuth();setAuth(loadAuth())}} backend={backend}>
    {tab==='home'&&<><div className="greeting"><div><div className="eyebrow">DZIŚ</div><h1>Twój trening.</h1><p>Rejestruj, analizuj, wracaj do wyników.</p></div><div className="avatar">R</div></div><div className="stats"><div><b>{totals.km.toFixed(1)}</b><span>km łącznie</span></div><div><b>{activities.length}</b><span>aktywności</span></div><div><b>{totals.elev.toFixed(0)}</b><span>m ↑</span></div></div><RecordScreen onFinished={finish}/></>}
    {tab==='record'&&<RecordScreen onFinished={finish} plannedWorkoutId={plannedWorkoutId}/>} 
    {tab==='history'&&<section className="panel"><div className="panel-head"><div><div className="eyebrow">HISTORIA</div><h2>Aktywności</h2><span className="muted">Storage: {storageMode}</span></div><button className="icon-btn" onClick={downloadAll} disabled={!activities.length}><Download size={18}/></button></div>{activities.length===0?<div className="empty">Brak treningów. Pierwszy jest dosłownie jednym kliknięciem.</div>:activities.map(a=><article className="activity" key={a.id} onClick={()=>setSelected(a)}><div className="activity-icon"><ActivityIcon/></div><div className="activity-main"><b>{a.type === 'run' ? 'Bieg' : a.type === 'walk' ? 'Marsz' : a.type === 'ride' ? 'Rower' : a.type === 'hike' ? 'Wędrówka' : 'Aktywność'}</b><span>{new Date(a.startedAt).toLocaleString('pl-PL')}</span><strong>{(a.distanceM/1000).toFixed(2)} km • {Math.round(a.durationSec/60)} min • {a.avgPaceSecPerKm?`${Math.floor(a.avgPaceSecPerKm/60)}:${String(Math.round(a.avgPaceSecPerKm%60)).padStart(2,'0')} /km`:''}</strong></div><button className="delete" onClick={e=>{e.stopPropagation();remove(a.id)}}>×</button></article>)}</section>}
    {tab==='plan'&&<WorkoutScreen activities={activities} onStart={(id)=>{setPlannedWorkoutId(id);setTab('record')}}/>}
    {tab==='explore'&&<ExploreScreen activities={activities}/>}
    {tab==='profile'&&<section className="panel"><div className="profile-head"><div className="avatar big">R</div><div><div className="eyebrow">PROFIL</div><h2>Runner</h2><span>Historia, rekordy, cele i sprzęt</span></div></div><div className="stats compact"><div><b>{totals.km.toFixed(1)}</b><span>km</span></div><div><b>{activities.length}</b><span>treningi</span></div><div><b>{activities.filter(a=>a.distanceM>5000).length}</b><span>&gt;5 km</span></div></div><TrainingOverview activities={activities}/><GearCard activities={activities}/><SyncStatus/><HeartRateCard/><HealthConnectCard/><AudioSettingsCard/><DiagnosticsScreen/></section>}
  </Shell>
}

type ShellProps={children:React.ReactNode;nav: [string,any,string][];tab:string;setTab:(t:any)=>void;onLogout?:()=>void;backend?:'unknown'|'online'|'offline'};
function Shell({children,nav,tab,setTab,onLogout,backend}:ShellProps){return <div className="app"><header><div className="brand">RUNNER<span>OS</span></div><div className="header-actions"><div className="pill">V2.1 • GPS + OFFLINE + HC + BLE + WORKOUT</div>{onLogout&&<button className="icon-btn" title="Wyloguj" onClick={onLogout}><LogOut size={16}/></button>}</div></header><main>{children}</main><nav>{nav.map(([id,I,label])=><button className={tab===id?'active':''} key={id} onClick={()=>setTab(id)}><I size={20}/><span>{label}</span></button>)}</nav></div>}
