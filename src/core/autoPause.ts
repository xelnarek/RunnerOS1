import type { GeoPoint } from './types';
import { haversine } from './metrics';

export interface AutoPauseOptions { stationarySpeedMps?:number; stationaryDistanceM?:number; triggerSec?:number; resumeSpeedMps?:number; }

export class AutoPauseDetector {
  private stillSince:number|null=null;
  private paused=false;
  private readonly stationarySpeed:number;
  private readonly stationaryDistance:number;
  private readonly triggerMs:number;
  private readonly resumeSpeed:number;
  constructor(options:AutoPauseOptions={}){
    this.stationarySpeed=options.stationarySpeedMps ?? 0.7;
    this.stationaryDistance=options.stationaryDistanceM ?? 4;
    this.triggerMs=(options.triggerSec ?? 8)*1000;
    this.resumeSpeed=options.resumeSpeedMps ?? 1.7;
  }
  update(point:GeoPoint, prev:GeoPoint|null){
    if(!prev) return {paused:this.paused, shouldPause:false, shouldResume:false};
    const dt=Math.max(0,(point.ts-prev.ts));
    const d=haversine(prev,point);
    const speed=typeof point.speed==='number' && point.speed>=0 ? point.speed : (dt>0?d/(dt/1000):0);
    const stationary=speed<this.stationarySpeed && d<this.stationaryDistance;
    if(!this.paused){
      if(stationary){ if(this.stillSince==null) this.stillSince=point.ts; if(point.ts-this.stillSince>=this.triggerMs){ this.paused=true; this.stillSince=null; return {paused:true,shouldPause:true,shouldResume:false}; } }
      else this.stillSince=null;
    }else if(speed>=this.resumeSpeed || d>=this.stationaryDistance){
      this.paused=false; this.stillSince=null; return {paused:false,shouldPause:false,shouldResume:true};
    }
    return {paused:this.paused,shouldPause:false,shouldResume:false};
  }
  reset(){this.stillSince=null;this.paused=false;}
  isPaused(){return this.paused;}
}
