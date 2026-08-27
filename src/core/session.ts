import type { GeoPoint } from './types';

export interface ActiveSession {
  startedAt:number;
  workoutId?:string;


  pausedTotalMs:number;
  pausedAt:number|null;
  points:GeoPoint[];
}
const KEY='runneros.active-session.v1';
export function loadSession():ActiveSession|null{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');return x?.startedAt&&Array.isArray(x.points)?x:null}catch{return null}}
export function saveSession(x:ActiveSession){localStorage.setItem(KEY,JSON.stringify(x))}
export function clearSession(){localStorage.removeItem(KEY)}
