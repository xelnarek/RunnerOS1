import type { GeoPoint } from '../types';
import { haversine } from '../metrics';

export type Segment = {id:string;name:string;points:GeoPoint[];distanceM?:number};
export type SegmentResult = {segmentId:string;name:string;elapsedSec:number;distanceM:number;matchedPoints:number};

function nearestDistanceM(p:GeoPoint, line:GeoPoint[]){let best=Infinity; for(const q of line) best=Math.min(best,haversine(p,q)); return best;}
function lineDistance(line:GeoPoint[]){let d=0; for(let i=1;i<line.length;i++) d+=haversine(line[i-1],line[i]); return d;}

export function detectSegments(track:GeoPoint[], segments:Segment[], toleranceM=35):SegmentResult[]{
  const results:SegmentResult[]=[]; if(track.length<2)return results;
  for(const s of segments){
    const line=s.points; if(line.length<2)continue;
    let start=-1,end=-1;
    for(let i=0;i<track.length;i++){ if(nearestDistanceM(track[i],line)<=toleranceM){start=i;break;} }
    if(start<0)continue;
    for(let i=start+1;i<track.length;i++){if(nearestDistanceM(track[i],line)<=toleranceM) end=i; else if(end>0) break;}
    if(end<=start)continue;
    const d=lineDistance(track.slice(start,end+1));
    results.push({segmentId:s.id,name:s.name,elapsedSec:Math.max(1,(track[end].ts-track[start].ts)/1000),distanceM:d,matchedPoints:end-start+1});
  }
  return results;
}
