import {useMemo,useState} from 'react';
import {Check,ChevronRight,Clock3,Play,ShieldCheck,Target,TimerReset} from 'lucide-react';
import type {Activity} from '../../core/types';
import {WORKOUTS,flattenWorkout,readinessScore,recommendWorkout,predictRace,type TrainingGoal} from '../../core/workout/engine';
import './workout.css';

type Props={activities:Activity[]; onStart?:(workoutId:string)=>void};
const fmt=(s:number)=>`${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;
const GOAL_KEY='runneros.goal.v1';
function loadGoal():TrainingGoal|undefined{try{return JSON.parse(localStorage.getItem(GOAL_KEY)||'null')||undefined}catch{return undefined}}
function saveGoal(goal:TrainingGoal){localStorage.setItem(GOAL_KEY,JSON.stringify(goal))}

export default function WorkoutScreen({activities,onStart}:Props){
  const [selected,setSelected]=useState('easy-30');
  const [goal,setGoal]=useState<TrainingGoal|undefined>(loadGoal());
  const ready=useMemo(()=>readinessScore(activities),[activities]);
  const recommendation=useMemo(()=>recommendWorkout(activities,goal),[activities,goal]);
  const race=useMemo(()=>predictRace(activities),[activities]);
  const workout=WORKOUTS.find(w=>w.id===selected)!;
  const steps=flattenWorkout(workout);
  const createGoal=()=>{const g:TrainingGoal={id:crypto.randomUUID(),name:'Cel biegowy',distanceKm:10,targetTimeSec:50*60,dueAt:Date.now()+56*86400000,createdAt:Date.now()};saveGoal(g);setGoal(g)};
  return <section className="workout-screen">
    <div className="workout-hero"><div><span className="eyebrow">WORKOUT ENGINE • V2.0</span><h2>Trening dopasowany do Ciebie.</h2><p>Gotowość, jednostka, cel i prognoza wyniku w jednym miejscu.</p></div><div className="readiness"><span>GOTOWOŚĆ</span><strong>{ready.score}</strong><small>{ready.label}</small></div></div>
    <div className="workout-reco"><div><span className="label">REKOMENDACJA</span><h3>{recommendation.name}</h3><p>{recommendation.subtitle} • load 7 dni: {ready.load7d}</p></div><button onClick={()=>{setSelected(recommendation.id);onStart?.(recommendation.id)}}><Play size={16}/> START</button></div>
    <div className="workout-grid">{WORKOUTS.map(w=><button key={w.id} className={selected===w.id?'workout-preset active':'workout-preset'} onClick={()=>setSelected(w.id)}><span>{w.name}</span><small>{w.subtitle}</small><b><Clock3 size={13}/>{fmt(w.totalSec)}</b></button>)}</div>
    <article className="workout-detail"><div className="section-head"><div><span className="label">JEDNOSTKA</span><h3>{workout.name}</h3><p>{workout.subtitle}</p></div><TimerReset size={18}/></div><div className="timeline">{steps.map((s,i)=><div className="timeline-step" key={s.id}><div className="step-index">{i+1}</div><div><strong>{s.label}</strong><span>{s.type} • {fmt(s.durationSec)}{s.targetRpe?` • RPE ${s.targetRpe}`:''}</span></div></div>)}</div><div className="workout-footer"><span><Target size={14}/> {steps.length} etapów • {fmt(workout.totalSec)}</span><button className="primary small" onClick={()=>onStart?.(workout.id)}><Play size={15}/> URUCHOM</button></div></article>
    <article className="goal-card v20"><div><span className="label">CEL STARTOWY</span><h3>{goal?`${goal.distanceKm} km • ${goal.targetTimeSec?fmt(goal.targetTimeSec):'bez czasu'}`:'Brak aktywnego celu'}</h3><p>{goal?`Termin: ${new Date(goal.dueAt).toLocaleDateString('pl-PL')}. System będzie oceniać progres względem celu.`:'Ustaw pierwszy cel, żeby adaptować jednostki i obciążenie.'}</p></div><button className="secondary" onClick={createGoal}>{goal?<><ShieldCheck size={15}/> AKTYWNY</>:<><ChevronRight size={15}/> USTAW 10K</>}</button></article>
    <article className="predict-card v20"><div className="section-head"><div><span className="label">RACE PREDICTOR • V2.0</span><h3>Prognoza wyniku</h3></div><span className="confidence">{race?`${race.confidence}% pewności`:'Brak danych'}</span></div>{race?<div className="predict-grid"><div><b>{fmt(race.five)}</b><span>5 km</span></div><div><b>{fmt(race.ten)}</b><span>10 km</span></div><div><b>{fmt(race.half)}</b><span>21,1 km</span></div></div>:<p className="muted">Zarejestruj co najmniej jeden bieg ≥ 3 km.</p>}<div className="predict-note"><Check size={14}/> Model bazuje na najlepszym tempie i liczbie zarejestrowanych biegów.</div></article>
  </section>
}
