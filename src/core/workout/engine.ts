import type { Activity } from '../types';

export type WorkoutStepType='warmup'|'easy'|'tempo'|'interval'|'recovery'|'cooldown';
export type WorkoutStep={id:string; type:WorkoutStepType; label:string; durationSec:number; targetPaceSecPerKm?:number; targetRpe?:number; repeat?:number};
export type WorkoutDefinition={id:string; name:string; subtitle:string; sport:'run'; steps:WorkoutStep[]; totalSec:number; difficulty:1|2|3|4|5};

export type TrainingGoal={id:string; name:string; distanceKm:number; targetTimeSec?:number; dueAt:number; createdAt:number};

export const WORKOUTS:WorkoutDefinition[]=[
  {id:'easy-30',name:'Easy 30',subtitle:'Spokojny bieg tlenowy',sport:'run',difficulty:1,steps:[
    {id:'w',type:'warmup',label:'Rozgrzewka',durationSec:300,targetRpe:2},
    {id:'e',type:'easy',label:'Easy',durationSec:1200,targetRpe:4},
    {id:'c',type:'cooldown',label:'Schłodzenie',durationSec:300,targetRpe:2},
  ],totalSec:1800},
  {id:'tempo-20',name:'Tempo 20',subtitle:'Kontrolowany próg',sport:'run',difficulty:3,steps:[
    {id:'w',type:'warmup',label:'Rozgrzewka',durationSec:600,targetRpe:3},
    {id:'t',type:'tempo',label:'Tempo',durationSec:1200,targetRpe:7},
    {id:'c',type:'cooldown',label:'Schłodzenie',durationSec:600,targetRpe:2},
  ],totalSec:2400},
  {id:'interval-6x2',name:'6 × 2 min',subtitle:'Szybko / lekko',sport:'run',difficulty:4,steps:[
    {id:'w',type:'warmup',label:'Rozgrzewka',durationSec:600,targetRpe:3},
    {id:'fast',type:'interval',label:'Szybko',durationSec:120,targetRpe:8,repeat:6},
    {id:'rec',type:'recovery',label:'Lekko',durationSec:120,targetRpe:2,repeat:6},
    {id:'c',type:'cooldown',label:'Schłodzenie',durationSec:600,targetRpe:2},
  ],totalSec:3240},
  {id:'long-60',name:'Long Run 60',subtitle:'Spokojna objętość',sport:'run',difficulty:2,steps:[
    {id:'w',type:'warmup',label:'Rozgrzewka',durationSec:300,targetRpe:2},
    {id:'e',type:'easy',label:'Long Easy',durationSec:3000,targetRpe:4},
    {id:'c',type:'cooldown',label:'Schłodzenie',durationSec:300,targetRpe:2},
  ],totalSec:3600},
];

export { currentStep } from './runtime';

export function flattenWorkout(workout:WorkoutDefinition){
  const out:WorkoutStep[]=[];
  for(const step of workout.steps){
    const repeat=step.repeat??1;
    for(let i=0;i<repeat;i++) out.push({...step,id:`${step.id}-${i+1}`,label:repeat>1?`${step.label} ${i+1}/${repeat}`:step.label,repeat:undefined});
  }
  return out;
}

export function readinessScore(activities:Activity[], now=Date.now()){
  const cutoff=now-7*86400000;
  const recent=activities.filter(a=>a.startedAt>=cutoff);
  const load=recent.reduce((sum,a)=>sum+estimateTrainingLoad(a),0);
  const last=activities.filter(a=>a.startedAt<=now).sort((a,b)=>b.startedAt-a.startedAt)[0];
  const hours=last?.endedAt?Math.max(0,(now-last.endedAt)/3600000):168;
  const recovery=Math.min(100,Math.round(45+hours*2.8));
  const fatigue=Math.min(100,Math.round(load*2.2));
  const score=Math.max(0,Math.min(100,Math.round(0.65*recovery+0.35*(100-fatigue))));
  const label=score>=78?'Gotowy':score>=58?'Umiarkowanie gotowy':'Regeneracja';
  return {score,label,load7d:Math.round(load),hoursSinceLast:Math.round(hours)};
}

export function estimateTrainingLoad(a:Activity){
  const distanceKm=a.distanceM/1000;
  const intensity=a.avgPaceSecPerKm?Math.max(0.7,Math.min(1.8,300/a.avgPaceSecPerKm)):1;
  const hrBoost=a.heartRateAvg?Math.max(0.85,Math.min(1.35,a.heartRateAvg/140)):1;
  return Math.max(1,distanceKm*intensity*hrBoost*(0.5+a.movingSec/3600)*18);
}

export function recommendWorkout(activities:Activity[], goal?:TrainingGoal){
  const ready=readinessScore(activities);
  if(ready.score<52) return WORKOUTS.find(x=>x.id==='easy-30')!;
  const recent14=activities.filter(a=>a.startedAt>Date.now()-14*86400000);
  const hard=recent14.filter(a=>(a.avgPaceSecPerKm??999)<330).length;
  if(hard>=2) return WORKOUTS.find(x=>x.id==='long-60')!;
  if(goal?.targetTimeSec) return WORKOUTS.find(x=>x.id==='tempo-20')!;
  return WORKOUTS.find(x=>x.id==='interval-6x2')!;
}

export function predictRace(activities:Activity[]){
  const candidates=activities.filter(a=>a.type==='run'&&a.distanceM>=3000&&a.avgPaceSecPerKm&&a.movingSec>0);
  if(!candidates.length) return null;
  const best=candidates.sort((a,b)=>(a.avgPaceSecPerKm!-b.avgPaceSecPerKm!))[0];
  const base=best.avgPaceSecPerKm!;
  const factor=(d:number)=>base*(d/1000)**0.06*d/1000;
  const confidence=Math.max(20,Math.min(92,40+candidates.length*7));
  return {five:factor(5000),ten:factor(10000),half:factor(21097.5),confidence,sourceDistanceKm:best.distanceM/1000};
}


export function stepAudioIntro(step:WorkoutStep, index:number, total:number){
  const target = step.targetRpe ? ` Cel wysiłku RPE ${step.targetRpe}.` : '';
  return `Etap ${index} z ${total}. ${step.label}. ${Math.round(step.durationSec/60)} minut.${target}`;
}

export function stepAudioFinish(step:WorkoutStep){
  return `Koniec etapu: ${step.label}.`;
}
