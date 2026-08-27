import type { GeoPoint } from './types';
import { haversine } from './metrics';

export type GpsRejectionReason = 'poor-accuracy' | 'teleport' | 'invalid-time' | 'stale' | 'stationary-noise';
export type GpsSample = GeoPoint & { source?: 'web' | 'android'; accepted?: boolean; rejectionReason?: GpsRejectionReason };

export interface GpsQuality {
  status: 'excellent' | 'good' | 'fair' | 'poor' | 'searching';
  accuracyM: number | null;
  satellites?: number;
  lastFixTs: number | null;
  rejected: number;
}

export interface GpsTrackerOptions {
  maxAccuracy?: number;
  maxSpeedMps?: number;
  minDistanceM?: number;
}

export class GpsTracker {
  private watchId:number|null=null;
  private last:GeoPoint|null=null;
  private readonly onPoint:(p:GeoPoint)=>void;
  private readonly onError:(message:string)=>void;
  private readonly maxAccuracy:number;
  private readonly maxSpeedMps:number;
  private readonly minDistanceM:number;
  private rejected = 0;
  private quality: GpsQuality = { status:'searching', accuracyM:null, lastFixTs:null, rejected:0 };

  constructor(onPoint:(p:GeoPoint)=>void,onError:(message:string)=>void=()=>{}, options: GpsTrackerOptions={}){
    this.onPoint=onPoint;
    this.onError=onError;
    this.maxAccuracy=options.maxAccuracy ?? 65;
    this.maxSpeedMps=options.maxSpeedMps ?? 12;
    this.minDistanceM=options.minDistanceM ?? 2.5;
  }

  start(){
    if(!('geolocation' in navigator)) throw new Error('Geolokalizacja nie jest dostępna.');
    this.stop();
    this.quality = { status:'searching', accuracyM:null, lastFixTs:null, rejected:0 };
    this.watchId=navigator.geolocation.watchPosition(pos=>{
      const c=pos.coords;
      const p:GeoPoint={lat:c.latitude,lng:c.longitude,ts:pos.timestamp,accuracy:c.accuracy,altitude:c.altitude??undefined,speed:c.speed??undefined};
      const accepted=this.validate(p);
      if(!accepted.ok){
        this.rejected += 1;
        this.quality = { ...this.quality, status: classifyAccuracy(c.accuracy), rejected:this.rejected };
        this.onError(`GPS: ${'reason' in accepted ? accepted.reason : 'unknown'}`);
        return;
      }
      this.last=p;
      this.quality = { status: classifyAccuracy(p.accuracy ?? null), accuracyM: p.accuracy ?? null, lastFixTs:p.ts, rejected:this.rejected };
      this.onPoint(p);
    }, err=>this.onError(err.message||'Błąd GPS'),{enableHighAccuracy:true,maximumAge:1000,timeout:12000});
  }
  stop(){ if(this.watchId!==null){navigator.geolocation.clearWatch(this.watchId);this.watchId=null;} this.last=null; }
  getQuality(){ return this.quality; }
  private validate(p:GeoPoint):{ok:true}|{ok:false;reason:GpsRejectionReason}{
    const accuracy=p.accuracy??999;
    if(!Number.isFinite(p.lat)||!Number.isFinite(p.lng)||!Number.isFinite(p.ts)) return {ok:false,reason:'invalid-time'};
    if(accuracy>this.maxAccuracy) return {ok:false,reason:'poor-accuracy'};
    if(!this.last) return {ok:true};
    const dt=(p.ts-this.last.ts)/1000;
    if(dt<=0) return {ok:false,reason:'invalid-time'};
    if(dt>45) return {ok:false,reason:'stale'};
    const d=haversine(this.last,p);
    const observedSpeed=d/dt;
    const reportedSpeed = typeof p.speed==='number' && p.speed>=0 ? p.speed : null;
    const dynamicLimit=Math.max(this.maxSpeedMps,(reportedSpeed??0)+10);
    if(d>this.minDistanceM && observedSpeed>dynamicLimit) return {ok:false,reason:'teleport'};
    if(d<this.minDistanceM && dt>=2 && (reportedSpeed??0)<0.8) return {ok:true};
    if(d<this.minDistanceM && accuracy>35 && dt>=2) return {ok:false,reason:'stationary-noise'};
    return {ok:true};
  }
}

export function classifyAccuracy(accuracy: number|null|undefined): GpsQuality['status'] {
  if(accuracy==null || !Number.isFinite(accuracy)) return 'searching';
  if(accuracy <= 8) return 'excellent';
  if(accuracy <= 20) return 'good';
  if(accuracy <= 45) return 'fair';
  return 'poor';
}
