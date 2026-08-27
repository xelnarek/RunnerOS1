export type ActivityType = 'run'|'walk'|'hike'|'ride'|'other';
export type ActivityStatus = 'completed'|'discarded';

export interface GeoPoint {
  lat:number; lng:number; ts:number;
  accuracy?:number; altitude?:number; speed?:number; source?:'web'|'android';
}

export interface Activity {
  id:string;
  type:ActivityType;
  startedAt:number;
  endedAt?:number;
  durationSec:number;
  movingSec:number;
  pausedSec:number;
  distanceM:number;
  elevationGainM:number;
  avgPaceSecPerKm?:number;
  maxSpeedMps?:number;
  avgSpeedMps?:number;
  calories?:number;
  heartRateAvg?:number;
  heartRateMax?:number;
  gpsQuality?:'excellent'|'good'|'fair'|'poor';
  autoPauseCount?:number;
  points:GeoPoint[];
  splitsSecPerKm:number[];
  status:ActivityStatus;
  notes?:string;
  gearId?:string;
  workoutId?:string;
  rpe?:number;
}

export interface UserProfile { name:string; avatarUrl?:string; totalDistanceM:number; activityCount:number; }
