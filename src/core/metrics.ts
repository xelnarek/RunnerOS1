import type { GeoPoint } from './types';
const R=6371000;
const rad=(x:number)=>x*Math.PI/180;

export function haversine(a:GeoPoint,b:GeoPoint){
  const dLat=rad(b.lat-a.lat), dLon=rad(b.lng-a.lng);
  const x=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(x)));
}

export interface SegmentMetric { distanceM:number; elapsedSec:number; movingSec:number; speedMps:number; }

export function validSegment(a:GeoPoint,b:GeoPoint,maxSpeedMps=20){
  const dt=(b.ts-a.ts)/1000;
  if(dt<=0 || dt>45) return null;
  const d=haversine(a,b);
  if((b.accuracy??999)>80 || d/dt>maxSpeedMps) return null;
  return { distanceM:d, elapsedSec:dt, movingSec:(d>=2 || (b.speed??0)>=0.8) ? dt : 0, speedMps:d/dt } satisfies SegmentMetric;
}

export function distance(points:GeoPoint[]){
  return points.reduce((d,_,i)=>i===0?d:d+(validSegment(points[i-1],points[i])?.distanceM??0),0);
}

export function movingTime(points:GeoPoint[]){
  return points.reduce((s,_,i)=>i===0?s:s+(validSegment(points[i-1],points[i])?.movingSec??0),0);
}

export function elevationGain(points:GeoPoint[]){
  let g=0;
  for(let i=1;i<points.length;i++){
    const a=points[i-1].altitude,b=points[i].altitude;
    if(a==null||b==null) continue;
    const delta=b-a;
    const seg=validSegment(points[i-1],points[i]);
    if(seg && delta>1 && delta<50) g+=delta;
  }
  return g;
}

export function maxSpeed(points:GeoPoint[]){
  let max=0;
  for(const p of points){ if(typeof p.speed==='number' && Number.isFinite(p.speed)) max=Math.max(max,p.speed); }
  for(let i=1;i<points.length;i++) max=Math.max(max,validSegment(points[i-1],points[i])?.speedMps??0);
  return Math.min(max,20);
}

export function averageSpeed(points:GeoPoint[], movingSec?:number){
  const d=distance(points), t=movingSec ?? movingTime(points);
  return t>0 ? d/t : 0;
}

export function splits(points:GeoPoint[], kilometer=1000){
  const out:number[]=[];
  let acc=0, elapsed=0;
  for(let i=1;i<points.length;i++){
    const seg=validSegment(points[i-1],points[i]); if(!seg) continue;
    let remaining=seg.distanceM;
    let localDt=seg.elapsedSec;
    while(acc+remaining>=kilometer){
      const needed=kilometer-acc;
      const ratio=needed/remaining;
      elapsed += localDt*ratio;
      out.push(Math.round(elapsed));
      localDt*=1-ratio; remaining-=needed; acc=0;
    }
    acc+=remaining; elapsed+=localDt;
  }
  return out;
}

export function paceSecPerKm(distanceM:number,movingSec:number){
  if(distanceM<=0||movingSec<=0) return undefined;
  return movingSec/(distanceM/1000);
}
