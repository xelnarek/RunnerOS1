import { useEffect,useMemo,useRef,useState } from 'react';
import { Activity, Pause, Play, Square, MapPin, RotateCcw, ShieldCheck, Gauge, Navigation, BatteryCharging } from 'lucide-react';
import { GpsTracker, classifyAccuracy } from '../../core/gps';
import { distance,elevationGain,maxSpeed,paceSecPerKm,splits,movingTime,validSegment } from '../../core/metrics';
import { AutoPauseDetector } from '../../core/autoPause';
import { clearSession, loadSession, saveSession } from '../../core/session';
import { getNativeLocationPlugin, startNativeTracking } from '../../core/nativeLocation';
import { readLatestHeartRate, writeHealthActivity } from '../../core/health';
import type { GeoPoint } from '../../core/types';
import './record.css';
import { audioEvent, kilometerReached, resetAudioMarkers, stopAudio } from '../../core/audio/audioEngine';
import { WORKOUTS, currentStep, stepAudioIntro, stepAudioFinish } from '../../core/workout/engine';
import { startWorkout, pauseWorkout, resumeWorkout, tickWorkout, stepRemainingSec, workoutProgress, type WorkoutRuntimeState } from '../../core/workout/runtime';

type Props={plannedWorkoutId?:string; onFinished:(p:GeoPoint[],startedAt:number,endedAt:number,durationSec:number,movingSec:number,heartRate?:number,type?:'run'|'walk'|'hike'|'ride'|'other',workoutId?:string)=>void};
const fmt=(s:number)=>`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(Math.floor(s)%60).padStart(2,'0')}`;
const pace=(s:number)=>s?`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`:'--:--';

export default function RecordScreen({onFinished,plannedWorkoutId}:Props){
  const [activityType,setActivityType]=useState<'run'|'walk'|'hike'|'ride'>('run');
  const [running,setRunning]=useState(false),[paused,setPaused]=useState(false),[autoPaused,setAutoPaused]=useState(false),[points,setPoints]=useState<GeoPoint[]>([]),[now,setNow]=useState(Date.now()),[gpsError,setGpsError]=useState(''),[recoverable,setRecoverable]=useState(false),[gpsStatus,setGpsStatus]=useState<'excellent'|'good'|'fair'|'poor'|'searching'>('searching'),[gpsAcc,setGpsAcc]=useState<number|null>(null),[hr,setHr]=useState<number|null>(null);
  const [activeWorkoutId,setActiveWorkoutId]=useState<string|undefined>(plannedWorkoutId);
  const planned=activeWorkoutId ? WORKOUTS.find(w=>w.id===activeWorkoutId) : undefined;
  const [workoutRuntime,setWorkoutRuntime]=useState<WorkoutRuntimeState>(()=>({status:'idle',stepIndex:0,stepElapsedSec:0,totalElapsedSec:0,completedSteps:0,startedAt:null}));
  const announcedStepRef=useRef(-1);
  const pausedRef=useRef(false);
  const startRef=useRef(0); const pauseStartedRef=useRef<number|null>(null); const pausedTotalRef=useRef(0); const gps=useRef<GpsTracker|null>(null); const autoPause=useRef(new AutoPauseDetector());
  const nativeStopRef=useRef<(()=>Promise<void>)|null>(null);
  const lastAnnouncedGps=useRef<string>('');
  const audioDistanceRef=useRef(0);
  useEffect(()=>{pausedRef.current=paused},[paused]);
  useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),500);return()=>clearInterval(t)},[]);
  useEffect(()=>{ if(!running || !planned || paused) return; const t=setInterval(()=>setWorkoutRuntime(prev=>{ const next=tickWorkout(prev,planned,0.5); if(next.stepIndex!==prev.stepIndex){ const finished=planned.steps[prev.stepIndex]; const current=planned.steps[next.stepIndex]; if(finished) audioEvent('stepFinish',{gpsLabel:stepAudioFinish(finished)}); if(current && next.status==='running') audioEvent('stepStart',{gpsLabel:stepAudioIntro(current,next.stepIndex+1,planned.steps.length)}); if(next.status==='completed') audioEvent('workoutFinish'); } return next;}),500); return()=>clearInterval(t)},[running,paused,planned]);
  useEffect(()=>{const s=loadSession(); if(s){setRecoverable(true); if(s.workoutId) setActiveWorkoutId(s.workoutId)} return()=>{gps.current?.stop(); void nativeStopRef.current?.()}},[]);
  const dist=useMemo(()=>distance(points),[points]), elev=useMemo(()=>elevationGain(points),[points]), max=maxSpeed(points);
  const elapsed=running?Math.max(0,(now-startRef.current-pausedTotalRef.current-(pauseStartedRef.current?now-pauseStartedRef.current:0))/1000):0;
  const moving=useMemo(()=>Math.max(0, movingTime(points)),[points]);
  const p=paceSecPerKm(dist,Math.max(1,moving||elapsed))??0;
  function persist(){saveSession({startedAt:startRef.current,workoutId:activeWorkoutId,pausedTotalMs:pausedTotalRef.current,pausedAt:pauseStartedRef.current,points})}
  const commit=(point:GeoPoint,t:number)=>setPoints(prev=>{
    const last=prev[prev.length-1];
    if(last && point.ts<=last.ts) return prev;
    const sample={...point,source:point.source??'web'};
    if(last){
      const state=autoPause.current.update(sample,last);
      if(!pausedRef.current && state.shouldPause){
        pauseStartedRef.current=sample.ts;
        setPaused(true);
        setAutoPaused(true);
        if(planned) setWorkoutRuntime(prevState=>pauseWorkout(prevState));
        persist();
        audioEvent('pause');
        return prev;
      }
      if(pausedRef.current && state.shouldResume){
        if(pauseStartedRef.current) pausedTotalRef.current+=Math.max(0,sample.ts-pauseStartedRef.current);
        pauseStartedRef.current=null;
        setPaused(false);
        setAutoPaused(false);
        if(planned) setWorkoutRuntime(prevState=>resumeWorkout(prevState));
        setGpsError('Wznowiono GPS • ruch wykryty');
        persist();
      }
      if(pausedRef.current && !state.shouldResume){
        setGpsAcc(sample.accuracy??null);
        setGpsStatus(classifyAccuracy(sample.accuracy));
        return prev;
      }
    }
    const next=[...prev,sample];
    const nextGps=classifyAccuracy(sample.accuracy);
    setGpsAcc(sample.accuracy??null); setGpsStatus(nextGps);
    if(nextGps !== lastAnnouncedGps.current){
      if(nextGps==='poor') audioEvent('warning');
      else if(nextGps==='excellent' || nextGps==='good') audioEvent('gps',{gpsLabel: nextGps==='excellent' ? 'Bardzo dobry sygnał GPS.' : 'Sygnał GPS jest dobry.'});
      lastAnnouncedGps.current=nextGps;
    }
    if(last){ const seg=validSegment(last,sample); if(seg) audioDistanceRef.current += seg.distanceM; }
    kilometerReached(audioDistanceRef.current, paceSecPerKm(audioDistanceRef.current, Math.max(1,movingTime(next))));
    setTimeout(()=>saveSession({startedAt:t,workoutId:activeWorkoutId,pausedTotalMs:pausedTotalRef.current,pausedAt:pauseStartedRef.current,points:next}),0);
    return next;
  });
  async function attachTracker(t:number){
    const native=await getNativeLocationPlugin();
    if(native){
      setGpsError('ANDROID • FUSED HIGH ACCURACY');
      nativeStopRef.current=await startNativeTracking(p=>commit(p,t),status=>{if(status==='running')setGpsError('ANDROID • FUSED HIGH ACCURACY');});
      const buffered=(await native.getBufferedPoints()).points||[];
      if(buffered.length) setPoints(prev=>[...prev,...buffered.filter(p=>!prev.some(x=>x.ts===p.ts)).map(p=>({...p,source:'android' as const})).sort((a,b)=>a.ts-b.ts)]);
      return;
    }
    const tr=new GpsTracker(p=>commit(p,t),m=>setGpsError(m),{maxAccuracy:65,maxSpeedMps:12,minDistanceM:2.5}); gps.current=tr; tr.start();
    setGpsError('WEB • HIGH ACCURACY');
  }
  async function start(){const t=Date.now(); if(plannedWorkoutId) setActiveWorkoutId(plannedWorkoutId); const workout=plannedWorkoutId ? WORKOUTS.find(w=>w.id===plannedWorkoutId) : planned; resetAudioMarkers(); audioDistanceRef.current=0; stopAudio(); audioEvent('start'); if(workout){ const rt=startWorkout(workout,t); setWorkoutRuntime(rt); announcedStepRef.current=0; audioEvent('stepStart',{gpsLabel:stepAudioIntro(workout.steps[0],1,workout.steps.length)}); } else { setWorkoutRuntime({status:'idle',stepIndex:0,stepElapsedSec:0,totalElapsedSec:0,completedSteps:0,startedAt:null}); } startRef.current=t;pauseStartedRef.current=null;pausedTotalRef.current=0;autoPause.current.reset();setPoints([]);setRunning(true);setPaused(false);setAutoPaused(false);setRecoverable(false);setGpsError('Uruchamianie GPS…');try{const n=await getNativeLocationPlugin(); if(n?.clearBufferedPoints) await n.clearBufferedPoints(); await attachTracker(t);}catch(e){setRunning(false);setGpsError((e as Error).message||'Nie udało się uruchomić GPS.');}}
  async function recover(){const s=loadSession();if(!s)return; if(s.workoutId) setActiveWorkoutId(s.workoutId); const recoveredWorkout=s.workoutId?WORKOUTS.find(w=>w.id===s.workoutId):undefined; if(recoveredWorkout){ const base=startWorkout(recoveredWorkout,s.startedAt); setWorkoutRuntime(s.pausedAt?pauseWorkout(base):base); } startRef.current=s.startedAt;pausedTotalRef.current=s.pausedTotalMs;pauseStartedRef.current=s.pausedAt;autoPause.current.reset();setPoints(s.points);setRunning(true);setPaused(Boolean(s.pausedAt));setAutoPaused(false);setRecoverable(false);try{if(!s.pausedAt)await attachTracker(s.startedAt);}catch(e){setGpsError((e as Error).message||'Nie udało się wznowić GPS.');}}
  async function togglePause(){if(!running)return;if(!paused){pauseStartedRef.current=Date.now();setPaused(true);setAutoPaused(false); if(planned) setWorkoutRuntime(prev=>pauseWorkout(prev)); audioEvent('pause');gps.current?.stop();await nativeStopRef.current?.();nativeStopRef.current=null;persist();}else{if(pauseStartedRef.current)pausedTotalRef.current+=Date.now()-pauseStartedRef.current;pauseStartedRef.current=null;setPaused(false);setAutoPaused(false);setGpsError('Wznawianie GPS…'); if(planned) setWorkoutRuntime(prev=>resumeWorkout(prev)); audioEvent('resume');try{await attachTracker(startRef.current)}catch(e){setGpsError((e as Error).message||'Nie udało się wznowić GPS.');}persist();}}
  async function stop(){const end=Date.now();if(paused&&pauseStartedRef.current)pausedTotalRef.current+=end-pauseStartedRef.current;const duration=Math.max(0,(end-startRef.current)/1000);const movingSec=Math.max(0,duration-pausedTotalRef.current/1000);gps.current?.stop();await nativeStopRef.current?.();nativeStopRef.current=null;setRunning(false);setPaused(false);clearSession(); audioEvent('finish');setRecoverable(false);let avgHr:number|undefined; try{const samples=await readLatestHeartRate(startRef.current,end);if(samples.length) {avgHr=Math.round(samples.reduce((s:any,x:any)=>s+x.bpm,0)/samples.length);setHr(avgHr);}}catch{}
    const activity={startedAt:startRef.current,endedAt:end,distanceM:dist,movingSec,elevationGainM:elev,avgPaceSecPerKm:paceSecPerKm(dist,movingSec),heartRateAvg:avgHr,points};
    try{await writeHealthActivity(activity)}catch{}
    onFinished(points,startRef.current,end,duration,movingSec,avgHr,activityType,activeWorkoutId);
    setActiveWorkoutId(undefined); setWorkoutRuntime({status:'idle',stepIndex:0,stepElapsedSec:0,totalElapsedSec:0,completedSteps:0,startedAt:null});
  }
  async function discard(){audioDistanceRef.current=0; stopAudio(); gps.current?.stop();await nativeStopRef.current?.();nativeStopRef.current=null;clearSession();setRunning(false);setPaused(false);setPoints([]);setRecoverable(false);setActiveWorkoutId(undefined);setWorkoutRuntime({status:'idle',stepIndex:0,stepElapsedSec:0,totalElapsedSec:0,completedSteps:0,startedAt:null});setGpsError('Sesja odrzucona.');}
  const gpsLabel=gpsStatus==='excellent'?'GPS EXCELLENT':gpsStatus==='good'?'GPS DOBRY':gpsStatus==='fair'?'GPS ŚREDNI':gpsStatus==='poor'?'GPS SŁABY':'GPS SZUKA';
  return <section className={`record-card ${running?'is-running':''}`}>
    {!running&&<div className="activity-mode-picker">{([['run','Bieg'],['walk','Marsz'],['hike','Wędrówka'],['ride','Rower']] as const).map(([id,label])=><button key={id} className={activityType===id?'active':''} onClick={()=>setActivityType(id)}>{label}</button>)}</div>}
    <div className="record-top"><span><Activity size={18}/> {activityType==='run'?'BIEG':activityType==='walk'?'MARSZ':activityType==='hike'?'WĘDRÓWKA':'ROWER'}</span><span className={`gps gps-${gpsStatus}`}><MapPin size={16}/> {running&&!paused?gpsLabel:paused?'PAUZA':'GPS GOTOWY'} {gpsAcc!=null&&<small>{Math.round(gpsAcc)} m</small>}</span></div>
    {recoverable&&!running&&<div className="recovery"><ShieldCheck size={18}/><div><b>Odzyskano niedokończony trening</b><span>Sesja jest zapisana lokalnie. Punkty GPS można bezpiecznie odzyskać.</span></div><button onClick={recover}>ODZYSKAJ</button><button className="ghost" onClick={discard}>ODRZUĆ</button></div>}
    <div className="hero-metric"><div className="metric-big">{(dist/1000).toFixed(2)}<small> km</small></div><div className="metric-sub">{fmt(elapsed)}</div></div>
    {running&&planned&&(()=>{const step=currentStep(planned,workoutRuntime); return <div className="workout-runtime"><div className="runtime-head"><div><span className="eyebrow">WORKOUT</span><strong>{step?.label||'Gotowe'}</strong><small>{step?`Etap ${workoutRuntime.stepIndex+1}/${planned.steps.length}`:'Zakończono'}</small></div><b>{Math.ceil(stepRemainingSec(planned,workoutRuntime)/60)} min</b></div><div className="runtime-progress"><span style={{width:`${Math.round(workoutProgress(planned,workoutRuntime)*100)}%`}}/></div><div className="runtime-meta"><span>{step?.targetRpe?`Cel RPE ${step.targetRpe}`:'Trzymaj komfortowe tempo'}</span><span>{Math.round(workoutProgress(planned,workoutRuntime)*100)}%</span></div></div>})()}
    <div className="metric-grid"><div><b>{p?pace(p):'--:--'}</b><span>tempo /km</span></div><div><b>+{elev.toFixed(0)}</b><span>przewyższenie</span></div><div><b>{(max*3.6).toFixed(1)}</b><span>max km/h</span></div><div><b>{hr??'--'}</b><span>średnie HR</span></div></div>
    {running&&<div className="live-strip"><span><Gauge size={14}/> auto-pauza {autoPaused?'AKTYWNA':'gotowa'}</span><span><Navigation size={14}/> {points.length} pkt</span><span><BatteryCharging size={14}/> offline</span></div>}
    {!running?<button className="primary" onClick={start}><Play size={22}/> START BIEGU</button>:<div className="actions"><button className="secondary" onClick={togglePause}>{paused?<Play/>:<Pause/>}{paused?'WZNÓW':'PAUZA'}</button><button className="danger" onClick={stop}><Square/> ZAKOŃCZ</button></div>}
    {points.length>0&&<div className="mini-row"><span>Splity: <b>{splits(points).length}</b> • ruch: <b>{fmt(moving)}</b></span><button className="ghost" onClick={()=>{if(!running){setPoints([]);clearSession()}}} disabled={running}><RotateCcw size={14}/> reset</button></div>}
    <div className={gpsError?'status error':'status'}>{gpsError||'Offline-first • aktywna sesja jest automatycznie zapisywana lokalnie.'}</div>
  </section>
}
